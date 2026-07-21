import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, Select } from "../../../components/ui";
import { useRegisterVehicle } from "../hooks/useParking";

const schema = z.object({
  licensePlate: z.string().min(1, "License plate is required").max(20, "License plate too long"),
  type: z.enum(["4 Wheeler", "2 Wheeler", "EV (4W)", "EV (2W)"], { required_error: "Type is required" }),
  makeModel: z.string().optional(),
  color: z.string().optional()
});

export default function RegisterVehicleModal({ isOpen, onClose }) {
  const { mutate: registerVehicle, isPending } = useRegisterVehicle();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: "4 Wheeler" }
  });

  const onSubmit = (data) => {
    registerVehicle(data, {
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
      title="Register Vehicle"
      description="Register a new vehicle to request parking."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>Register Vehicle</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="License Plate *" 
          placeholder="e.g. MH12AB1234"
          error={errors.licensePlate?.message}
          {...register("licensePlate")}
        />
        
        <Select 
          label="Vehicle Type *"
          error={errors.type?.message}
          options={[
            { label: "4 Wheeler (Car)", value: "4 Wheeler" },
            { label: "2 Wheeler (Bike/Scooter)", value: "2 Wheeler" },
            { label: "EV (4W)", value: "EV (4W)" },
            { label: "EV (2W)", value: "EV (2W)" }
          ]}
          {...register("type")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Make / Model" 
            placeholder="e.g. Honda City"
            error={errors.makeModel?.message}
            {...register("makeModel")}
          />
          <Input 
            label="Color" 
            placeholder="e.g. Silver"
            error={errors.color?.message}
            {...register("color")}
          />
        </div>
      </form>
    </Modal>
  );
}
