import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "lucide-react";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Minimum 8 characters"),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  role: z.enum(["security", "service_staff"]),
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

export default function StaffStep({ save, saving, previous }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: "security", shift: "Morning", serviceCategory: "electrician" }
  });

  const selectedRole = watch("role");

  const fetchStaff = async () => {
    try {
      const res = await api.get("/users?role=security,service_staff");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setStaffList(list);
    } catch (error) {
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const [apiError, setApiError] = useState("");

  const onAddStaff = async (data) => {
    setIsSubmitting(true);
    setApiError("");
    try {
      await api.post("/users", data);
      toast.success("Staff member added");
      reset(); 
      fetchStaff();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to add staff";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStaff = async (id) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Staff deactivated");
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove staff");
    }
  };

  const handleNext = () => {
    save((payload) => api.post("/setup/staff", payload).then(r => r.data), { staff: [] });
  };

  if (loading) return <div className="text-center py-10 text-muted">Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text">Invite Staff & Guards</h2>
        <p className="text-muted text-sm mt-1">Add security personnel and service staff for your society.</p>
      </div>

      <div className="bg-background border border-border rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-text mb-4">Add Staff Member</h3>
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(onAddStaff)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <Input label="Name" placeholder="Full Name" error={errors.name?.message} {...register("name")} />
            <Input type="email" label="Email" placeholder="Email Address" error={errors.email?.message} {...register("email")} />
            <Input type="password" label="Password" placeholder="Strong password" error={errors.password?.message} {...register("password")} />
            <Input label="Phone" placeholder="Phone Number" error={errors.phone?.message} {...register("phone")} />
            <Input label="Employee ID" placeholder="e.g. SEC-001" error={errors.employeeId?.message} {...register("employeeId")} />
            <Select label="Role" error={errors.role?.message} {...register("role")}>
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

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting}>
              <PlusIcon className="w-4 h-4 mr-2" /> Add Staff
            </Button>
          </div>
        </form>
      </div>

      {staffList.length > 0 && (
        <div className="bg-background border border-border rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-muted text-sm">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Department / Gate</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff._id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="p-3 font-medium text-text">
                    <div>{staff.name}</div>
                    <div className="text-xs text-muted">{staff.employeeId}</div>
                  </td>
                  <td className="p-3 text-muted capitalize">{staff.role.replace("_", " ")}</td>
                  <td className="p-3 text-muted">
                    {staff.role === "security" ? staff.gateAssignment || staff.shift : staff.serviceCategory}
                  </td>
                  <td className="p-3 text-muted">{staff.accountStatus === "ACTIVE" ? "Active" : "Inactive"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" className="text-error px-2" onClick={() => deleteStaff(staff._id)}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-6 flex justify-between">
        <Button variant="outline" onClick={previous} disabled={saving}>Back</Button>
        <Button onClick={handleNext} loading={saving}>Save & Continue</Button>
      </div>
    </div>
  );
}
