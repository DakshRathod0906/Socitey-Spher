import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, Select } from "../../components/ui";
import { useInviteResident } from "./hooks/useResidents";
import { useFlats } from "../super-admin/hooks/useFlats";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  flatId: z.string().min(1, "Flat is required"),
  occupancyType: z.enum(["OWNER", "TENANT"]),
  residentType: z.enum(["PRIMARY", "FAMILY"]),
});

export default function InviteResidentModal({ isOpen, onClose }) {
  const { flatOptions, isLoading: flatsLoading } = useFlats();
  const { mutate: inviteResident, isPending } = useInviteResident({
    onSuccess: () => {
      onClose();
      reset();
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { occupancyType: "OWNER", residentType: "PRIMARY" }
  });

  const onInvite = (data) => {
    inviteResident({ ...data, role: "resident" });
  };

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      title="Invite Resident"
      description="Send an invitation email to a new resident."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button loading={isPending} onClick={handleSubmit(onInvite)}>Send Invite</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onInvite)}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="resident@example.com" 
          error={errors.email?.message} 
          {...register("email")} 
        />
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Flat"
            disabled={flatsLoading} 
            error={errors.flatId?.message} 
            placeholder="Select a flat"
            options={flatOptions}
            {...register("flatId")} 
          />
          <Select 
            label="Occupancy Type"
            error={errors.occupancyType?.message} 
            options={[
              { value: "OWNER", label: "Owner" },
              { value: "TENANT", label: "Tenant" }
            ]}
            {...register("occupancyType")} 
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Select 
            label="Resident Type"
            error={errors.residentType?.message} 
            options={[
              { value: "PRIMARY", label: "Primary (Head of Household)" },
              { value: "FAMILY", label: "Family Member" }
            ]}
            {...register("residentType")} 
          />
        </div>
      </form>
    </Modal>
  );
}
