import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  role: z.enum(["security", "service_staff"]),
  
  // Password is only required on create. We will refine this in the modal.
  password: z.string().optional(),
  
  shift: z.string().optional(),
  gateAssignment: z.string().optional(),
  serviceCategory: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "security" && !data.shift) {
    ctx.addIssue({ path: ["shift"], message: "Shift required for security", code: z.ZodIssueCode.custom });
  }
  if (data.role === "service_staff" && !data.serviceCategory) {
    ctx.addIssue({ path: ["serviceCategory"], message: "Department required", code: z.ZodIssueCode.custom });
  }
});
