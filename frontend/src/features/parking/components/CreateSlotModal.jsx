import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, Select } from "../../../components/ui";
import { useCreateSlot } from "../hooks/useParking";

const schema = z.object({
  slotNumber: z.string().min(1, "Slot Number is required").max(10, "Slot number too long"),
  slotType: z.enum(["resident", "visitor", "ev"], { required_error: "Type is required" }),
});

export default function CreateSlotModal({ isOpen, onClose }) {
  const { mutate: createSlot, isPending } = useCreateSlot();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { slotType: "resident" }
  });

  const onSubmit = (data) => {
    createSlot(data, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      title="Create Parking Slot"
      description="Add a new physical parking slot to the society."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>Create Slot</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Slot Number *" 
          placeholder="e.g. P1-01"
          error={errors.slotNumber?.message}
          {...register("slotNumber")}
        />
        
        <Select 
          label="Slot Type *"
          error={errors.slotType?.message}
          options={[
            { label: "Resident", value: "resident" },
            { label: "Visitor", value: "visitor" },
            { label: "EV Charging", value: "ev" }
          ]}
          {...register("slotType")}
        />
      </form>
    </Modal>
  );
}
