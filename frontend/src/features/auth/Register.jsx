import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { CheckCircle } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Register() {
  const { registerAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await registerAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone
      });
      setIsSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="animate-fade-in text-center space-y-4 py-8">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-success-light text-success rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-text">Check your email</h3>
        <p className="text-muted max-w-sm mx-auto">
          We've sent a verification link to your email address. Please click the link to verify your account and continue setting up your society.
        </p>
        <div className="mt-8">
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text">Create Admin Account</h2>
        <p className="text-muted mt-2">Start managing your society efficiently</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          error={errors.name?.message}
          {...register("name")}
        />
        
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        
        <Input
          label="Phone Number"
          type="tel"
          placeholder="10-digit number"
          error={errors.phone?.message}
          {...register("phone")}
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          className="w-full mt-6"
          loading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Already registered?{" "}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
