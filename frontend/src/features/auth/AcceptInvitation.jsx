import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Card } from "../../components/ui";
import api from "../../services/api";
import { toast } from "sonner";

const acceptSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(acceptSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/auth/accept-invitation", {
        token,
        name: data.name,
        phone: data.phone,
        password: data.password
      });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-6">
          <h2 className="text-xl font-bold text-danger">Invalid Invitation</h2>
          <p className="mt-2 text-muted">No invitation token was provided.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text">Accept Invitation</h1>
          <p className="text-muted mt-2">Complete your profile to join the society.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Full Name" 
            error={errors.name?.message} 
            {...register("name")} 
          />
          <Input 
            label="Phone Number" 
            type="tel"
            error={errors.phone?.message} 
            {...register("phone")} 
          />
          <Input 
            label="Password" 
            type="password"
            error={errors.password?.message} 
            {...register("password")} 
          />
          <Input 
            label="Confirm Password" 
            type="password"
            error={errors.confirmPassword?.message} 
            {...register("confirmPassword")} 
          />

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>
      </Card>
    </div>
  );
}
