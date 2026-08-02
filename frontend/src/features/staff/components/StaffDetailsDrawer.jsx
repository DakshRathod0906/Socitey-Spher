import { X, User, Phone, Mail, Briefcase, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../../components/ui";

export default function StaffDetailsDrawer({ isOpen, onClose, staff }) {
  if (!isOpen || !staff) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not Available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-border ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
          <h2 className="text-lg font-semibold text-text">Staff Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-text hover:bg-secondary-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {staff.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">{staff.name}</h3>
              <p className="text-sm text-muted">{staff.employeeId}</p>
            </div>
          </div>

          {/* Personal Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Personal</h4>
            <div className="space-y-3 bg-surface p-4 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted mb-0.5">Email</p>
                  <p className="text-sm font-medium text-text">{staff.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-text">{staff.phone || "Not Available"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Employment</h4>
            <div className="space-y-3 bg-surface p-4 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted mb-0.5">Role</p>
                  <p className="text-sm font-medium text-text capitalize">{staff.role.replace("_", " ")}</p>
                </div>
              </div>
              
              {staff.role === "service_staff" ? (
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4" /> {/* Spacer */}
                  <div>
                    <p className="text-xs text-muted mb-0.5">Department</p>
                    <p className="text-sm font-medium text-text capitalize">{staff.serviceCategory?.replace("_", " ") || "Not Available"}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4" /> {/* Spacer */}
                    <div>
                      <p className="text-xs text-muted mb-0.5">Shift</p>
                      <p className="text-sm font-medium text-text">{staff.shift || "Not Available"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4" /> {/* Spacer */}
                    <div>
                      <p className="text-xs text-muted mb-0.5">Gate</p>
                      <p className="text-sm font-medium text-text">{staff.gateAssignment || "Not Available"}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-muted mb-0.5">Joined Date</p>
                  <p className="text-sm font-medium text-text">{formatDate(staff.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {staff.accountStatus === "ACTIVE" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-error mt-0.5" />
                )}
                <div>
                  <p className="text-xs text-muted mb-0.5">Status</p>
                  <p className={`text-sm font-medium ${staff.accountStatus === "ACTIVE" ? "text-emerald-500" : "text-error"}`}>
                    {staff.accountStatus === "ACTIVE" ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Activity</h4>
            <div className="bg-surface p-4 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">Assigned</p>
                  <p className="text-lg font-semibold text-text">Not Available</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Resolved</p>
                  <p className="text-lg font-semibold text-text">Not Available</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted mb-1">Last Login</p>
                <p className="text-sm font-medium text-text">Not Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-surface flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  );
}
