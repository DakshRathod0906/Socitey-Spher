import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input, Textarea } from "../../components/ui";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const societySchema = z.object({
  name: z.string().min(3, "Society name must be at least 3 characters"),
  address: z.string().min(10, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Invalid ZIP/Pincode"),
});

export default function CreateSociety() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(societySchema),
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await api.post("/societies", data);
      
      await refreshUser(); // updates the auth context and navigates via ProtectedRoute
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create society. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text">Create Your Society</h1>
        <p className="text-muted mt-2">
          Tell us about your society to get started with the setup.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Society Name"
            placeholder="e.g. Greenfield Apartments"
            error={errors.name?.message}
            {...register("name")}
          />
          
          <Textarea
            label="Street Address"
            placeholder="Full street address"
            rows={3}
            error={errors.address?.message}
            {...register("address")}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="City"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="State"
              placeholder="State"
              error={errors.state?.message}
              {...register("state")}
            />
          </div>
          
          <Input
            label="ZIP / Postal Code"
            placeholder="ZIP Code"
            error={errors.pincode?.message}
            {...register("pincode")}
          />

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
