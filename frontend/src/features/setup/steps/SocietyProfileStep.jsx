import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Textarea } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(10, "Please provide full address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Invalid ZIP/Pincode"),
});

export default function SocietyProfileStep({ save, saving, progress }) {
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    // Fetch current society profile data to prefill
    const fetchProfile = async () => {
      try {
        const res = await api.get("/societies/me"); 
        reset(res.data);
      } catch (error) {
        toast.error("Failed to load society profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = (data) => {
    // Using the save function from useSetupWizard which will handle API call and progress update
    save((payload) => api.put("/setup/profile", payload).then(r => r.data), data);
  };

  if (loading) return <div className="text-center py-10 text-muted">Loading profile...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text">Review Society Profile</h2>
        <p className="text-muted text-sm mt-1">Please confirm or update your society details before proceeding.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Society Name" error={errors.name?.message} {...register("name")} />
        <Textarea label="Street Address" rows={3} error={errors.address?.message} {...register("address")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" error={errors.city?.message} {...register("city")} />
          <Input label="State" error={errors.state?.message} {...register("state")} />
        </div>
        <Input label="ZIP / Postal Code" error={errors.pincode?.message} {...register("pincode")} />
        
        <div className="pt-6 flex justify-end">
          <Button type="submit" loading={saving}>
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
