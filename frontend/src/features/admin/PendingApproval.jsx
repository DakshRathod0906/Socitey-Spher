import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Textarea } from "../../components/ui";
import { PageHeader } from "../../components/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import { toast } from "sonner";
import { LoadingScreen } from "../../components/feedback";

const societySchema = z.object({
  name: z.string().min(3, "Society name must be at least 3 characters"),
  address: z.string().min(10, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Invalid ZIP/Pincode"),
});

export default function PendingApproval() {
  const { logout, refreshUser, tenant } = useAuth();
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(societySchema),
    mode: "onTouched",
  });

  const fetchSociety = async () => {
    try {
      const res = await api.get("/societies/pending-application");
      setSociety(res.data);
      if (res.data.status === "REJECTED") {
        reset(res.data); // Pre-fill the form
      }
    } catch (error) {
      toast.error("Failed to fetch application status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSociety();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await api.put("/societies/pending-application", data);
      toast.success("Application resubmitted successfully");
      setSociety(res.data);
      setIsEditing(false);
      refreshUser(); // Refresh tenant status
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resubmit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen fullScreen={true} message="Checking application status..." />;
  }

  if (society?.status === "REJECTED" && isEditing) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-fade-in">
        <PageHeader 
          title="Update Application" 
          subtitle="Please correct the information below and resubmit."
        />
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Society Name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Textarea
              label="Street Address"
              rows={3}
              error={errors.address?.message}
              {...register("address")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                error={errors.city?.message}
                {...register("city")}
              />
              <Input
                label="State"
                error={errors.state?.message}
                {...register("state")}
              />
            </div>
            <Input
              label="ZIP / Postal Code"
              error={errors.pincode?.message}
              {...register("pincode")}
            />
            <div className="pt-4 flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" loading={isSubmitting}>Resubmit Application</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const isRejected = society?.status === "REJECTED";
  const isUnderReview = society?.status === "UNDER_REVIEW";

  const handleCheckStatus = async () => {
    try {
      const { tenant: updatedTenant } = await refreshUser();
      if (updatedTenant?.status === "APPROVED") {
        toast.success("Your society has been approved!");
        // ProtectedRoute will automatically redirect to setup
      } else {
        toast.info(`Your application is currently ${updatedTenant?.status.replace("_", " ").toLowerCase()}.`);
        await fetchSociety();
      }
    } catch (err) {
      toast.error("Failed to check status");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 animate-fade-in space-y-8">
      <PageHeader 
        title={isRejected ? "Application Rejected" : "Application Submitted"} 
        subtitle={isRejected ? "Your society registration was rejected by the admin." : "Your society registration is currently being processed."}
      />

      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-6 mb-6">
          <div>
            <p className="text-sm text-muted font-medium mb-1">Status</p>
            {isRejected ? (
              <div className="flex items-center gap-2 text-danger font-semibold bg-danger-light px-3 py-1.5 rounded-full w-max text-sm">
                <span className="h-2 w-2 rounded-full bg-danger"></span>
                Rejected
              </div>
            ) : isUnderReview ? (
              <div className="flex items-center gap-2 text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-full w-max text-sm">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Under Review
              </div>
            ) : (
              <div className="flex items-center gap-2 text-warning font-semibold bg-warning-light px-3 py-1.5 rounded-full w-max text-sm">
                <span className="h-2 w-2 rounded-full bg-warning"></span>
                Submitted
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted font-medium mb-1">Next Steps</p>
            <p className="text-sm text-text">
              {isRejected ? "Update details and resubmit" : "Waiting for platform admin review"}
            </p>
          </div>
        </div>
        
        {isRejected && society?.rejectionReason && (
          <div className="mb-6 bg-danger-light/50 border border-danger/20 rounded-lg p-4 text-sm text-danger-dark">
            <span className="font-semibold block mb-1">Reason for Rejection:</span>
            {society.rejectionReason}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-text">Onboarding Checklist</h3>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0 text-sm mt-0.5">✓</div>
            <div>
              <p className="font-medium text-text">Application received</p>
              <p className="text-sm text-muted">We have successfully received your society details.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm mt-0.5 ${isRejected ? 'bg-danger text-white' : isUnderReview ? 'bg-primary text-white' : 'bg-warning-light text-warning'}`}>
              {isRejected ? "✗" : isUnderReview ? "✓" : "⏳"}
            </div>
            <div>
              <p className={`font-medium ${isRejected ? 'text-danger' : 'text-text'}`}>
                {isRejected ? "Application rejected" : isUnderReview ? "Currently under review" : "Waiting for review"}
              </p>
              <p className="text-sm text-muted">
                {isRejected ? "Please update your application details and resubmit." : "A Super Admin will review and verify your application shortly."}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full border border-border text-muted flex items-center justify-center flex-shrink-0 text-sm mt-0.5"></div>
            <div>
              <p className="font-medium text-muted">Society setup</p>
              <p className="text-sm text-muted">Once approved, you will be able to access the setup wizard.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isRejected ? (
          <Button onClick={() => setIsEditing(true)} className="flex-1">
            Update Application
          </Button>
        ) : (
          <Button onClick={handleCheckStatus} className="flex-1">
            Check Status
          </Button>
        )}
        <Button variant="outline" onClick={logout} className="flex-1">
          Logout
        </Button>
      </div>
    </div>
  );
}
