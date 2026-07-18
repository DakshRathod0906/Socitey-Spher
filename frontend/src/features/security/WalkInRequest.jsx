import { useState, useEffect } from "react";
import { Users, Search, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "../../components/shared";
import { Button, Input, Select, Card } from "../../components/ui";
import { useRequestWalkIn } from "./hooks/useSecurityVisits";
import api from "../../services/api";

const walkInSchema = z.object({
  visitorName: z.string().min(2, "Name is required"),
  visitorPhone: z.string().min(10, "Phone number is required"),
  purpose: z.string().min(2, "Purpose is required"),
  flatId: z.string().min(1, "Please select a destination flat"),
  visitorType: z.enum(["GUEST", "DELIVERY", "SERVICE_PROVIDER"]),
});

export default function WalkInRequest() {
  const [flats, setFlats] = useState([]);
  
  useEffect(() => {
    // Fetch all flats in the society so guard can select destination
    const fetchFlats = async () => {
      try {
        const { data } = await api.get("/societies/me"); // Assuming society info includes flats, or we need a /flats endpoint.
        // For now, let's use a mock list of flats or call the correct endpoint
        const res = await api.get("/setup/flats"); // if available
        setFlats(res.data.flats || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFlats();
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(walkInSchema),
    defaultValues: { visitorType: "GUEST" }
  });

  const { mutate: sendRequest, isPending } = useRequestWalkIn({
    onSuccess: () => {
      reset();
    }
  });

  const onSubmit = (formData) => {
    sendRequest({
      flatId: formData.flatId,
      visitorData: {
        name: formData.visitorName,
        phone: formData.visitorPhone,
        visitorType: formData.visitorType
      },
      visitData: {
        purpose: formData.purpose
      }
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Walk-in Visitor" 
        subtitle="Log a visitor arriving without a pre-approved pass."
      />

      <Card className="max-w-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-4 pb-4 border-b border-border">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Users className="h-4 w-4" /> Visitor Details
            </h3>
            
            <Input 
              label="Visitor Name" 
              placeholder="e.g. Amit Patel" 
              error={errors.visitorName?.message} 
              {...register("visitorName")} 
            />
            
            <Input 
              label="Phone Number" 
              placeholder="e.g. 9876543210" 
              type="tel" 
              error={errors.visitorPhone?.message} 
              {...register("visitorPhone")} 
            />

            <Select 
              label="Visitor Type"
              options={[
                { value: "GUEST", label: "Guest / Relative" },
                { value: "DELIVERY", label: "Delivery" },
                { value: "SERVICE_PROVIDER", label: "Service Provider" }
              ]}
              {...register("visitorType")}
            />
            
            <Input 
              label="Purpose of Visit" 
              placeholder="e.g. Meeting, Food Delivery" 
              error={errors.purpose?.message} 
              {...register("purpose")} 
            />
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Building className="h-4 w-4" /> Destination
            </h3>
            
            <Input 
              label="Flat ID (Temporary mock until dropdown is wired)" 
              placeholder="Enter Flat ID" 
              error={errors.flatId?.message} 
              {...register("flatId")} 
            />
            {/* Ideally this is a searchable dropdown of flats */}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" loading={isPending}>
              Send Approval Request to Resident
            </Button>
            <p className="text-xs text-muted text-center mt-3">
              The resident will receive a notification to approve or reject this entry.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
