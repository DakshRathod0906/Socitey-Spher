import { Edit, Eye, Power, PowerOff } from "lucide-react";
import { Button } from "../../../components/ui";

export default function StaffTable({ staffList, onView, onEdit, onToggleStatus }) {
  if (!staffList || staffList.length === 0) {
    return (
      <div className="text-center py-10 text-muted bg-background border border-border rounded-lg">
        No staff members found.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-surface border-b border-border text-muted text-sm">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium">Gate</th>
              <th className="p-4 font-medium">Shift</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff._id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-text">{staff.name}</div>
                  <div className="text-xs text-muted mt-0.5">{staff.employeeId}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    staff.role === "security" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    {staff.role === "security" ? "Security" : "Service Staff"}
                  </span>
                </td>
                <td className="p-4 text-muted">
                  {staff.role === "service_staff" ? (
                    <span className="capitalize">{staff.serviceCategory?.replace("_", " ") || "—"}</span>
                  ) : "—"}
                </td>
                <td className="p-4 text-muted">
                  {staff.role === "security" ? (staff.gateAssignment || "—") : "—"}
                </td>
                <td className="p-4 text-muted">
                  {staff.role === "security" ? (staff.shift || "—") : "—"}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    staff.accountStatus === "ACTIVE" ? "text-emerald-500" : "text-muted"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${staff.accountStatus === "ACTIVE" ? "bg-emerald-500" : "bg-muted"}`}></span>
                    {staff.accountStatus === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="px-2 text-muted hover:text-text" onClick={() => onView(staff)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="px-2 text-muted hover:text-primary" onClick={() => onEdit(staff)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`px-2 ${staff.accountStatus === "ACTIVE" ? "text-error hover:bg-error/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
                      onClick={() => onToggleStatus(staff)}
                      title={staff.accountStatus === "ACTIVE" ? "Deactivate" : "Activate"}
                    >
                      {staff.accountStatus === "ACTIVE" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
