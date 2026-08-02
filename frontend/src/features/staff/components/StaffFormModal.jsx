import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal, Input, Select, Button } from "../../../components/ui";
import { staffSchema } from "../utils/validation";

export default function StaffFormModal({ isOpen, onClose, staff, onSubmit, isSubmitting }) {
  const isEditMode = !!staff;

  // Refine schema dynamically: Password is required for create, optional for edit
  const schema = isEditMode
    ? staffSchema
    : staffSchema.extend({
        password: z.string().min(8, "Minimum 8 characters"),
      });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "security",
      shift: "Morning",
      serviceCategory: "electrician",
      ...staff,
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        reset(staff);
      } else {
        reset({ role: "security", shift: "Morning", serviceCategory: "electrician" });
      }
    }
  }, [isOpen, staff, reset]);

  return (
    <Modal open={isOpen} onClose={onClose} title={isEditMode ? "Edit Staff Member" : "Add Staff Member"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <Input label="Name" placeholder="Full Name" error={errors.name?.message} {...register("name")} />
          <Input type="email" label="Email" placeholder="Email Address" error={errors.email?.message} {...register("email")} />
          
          {!isEditMode && (
            <Input type="password" label="Password" placeholder="Strong password" error={errors.password?.message} {...register("password")} />
          )}
          
          <Input label="Phone" placeholder="Phone Number" error={errors.phone?.message} {...register("phone")} />
          <Input label="Employee ID" placeholder="e.g. SEC-001" error={errors.employeeId?.message} {...register("employeeId")} />
          
          <Select label="Role" error={errors.role?.message} {...register("role")} disabled={isEditMode}>
            <option value="security">Security Guard</option>
            <option value="service_staff">Service Staff</option>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2 bg-primary/5 p-3 rounded-lg border border-primary/20 mt-4">
          {selectedRole === "security" ? (
            <>
              <Select label="Shift" error={errors.shift?.message} {...register("shift")}>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </Select>
              <Input label="Gate Assignment" placeholder="e.g. Main Gate" error={errors.gateAssignment?.message} {...register("gateAssignment")} />
            </>
          ) : (
            <Select label="Department" error={errors.serviceCategory?.message} {...register("serviceCategory")}>
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="carpenter">Carpenter</option>
              <option value="gardener">Gardener</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="lift_technician">Lift Technician</option>
              <option value="other">Other</option>
            </Select>
          )}
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditMode ? "Save Changes" : "Add Staff"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
