import { useState, useMemo } from "react";
import {
  Shield,
  UserCheck,
  UserX,
  Clock,
  Download,
  Plus,
  Eye,
  MoreVertical,
  Phone,
  Building2,
  Car,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Button, Card, Modal, Input, Select } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useVisits } from "./hooks/useVisits";
import { exportToCSV } from "../../lib/exportUtils";
import api from "../../services/api";
import { toast } from "sonner";

export default function Visitors() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "", status: "ALL", type: "ALL" });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isPreApproveOpen, setIsPreApproveOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-approve Form State
  const [preApproveForm, setPreApproveForm] = useState({
    visitorName: "",
    phone: "",
    flatNumber: "",
    visitorType: "GUEST",
    vehicleNumber: "",
    purpose: "",
    expectedArrival: new Date().toISOString().slice(0, 16),
  });

  const { data: visits, meta, isLoading, isError, refetch } = useVisits({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status !== "ALL" ? filters.status : undefined,
    type: filters.type !== "ALL" ? filters.type : undefined,
  });

  const rawVisits = Array.isArray(visits) ? visits : (visits?.data || visits?.visits || []);

  // Calculate Real-time Metrics
  const metrics = useMemo(() => {
    return {
      total: rawVisits.length,
      checkedIn: rawVisits.filter((v) => v.status === "CHECKED_IN").length,
      checkedOut: rawVisits.filter((v) => v.status === "CHECKED_OUT").length,
      pending: rawVisits.filter((v) => v.status === "PENDING" || v.status === "APPROVED").length,
    };
  }, [rawVisits]);

  // Filter Visits by Status, Type, and Search term
  const filteredVisits = useMemo(() => {
    return rawVisits.filter((v) => {
      const matchStatus = filters.status === "ALL" || v.status === filters.status;
      const matchType = filters.type === "ALL" || (v.visitorType && v.visitorType.toUpperCase() === filters.type);
      const searchLower = filters.search ? filters.search.trim().toLowerCase() : "";
      const matchSearch =
        !searchLower ||
        (v.visitorName && v.visitorName.toLowerCase().includes(searchLower)) ||
        (v.visitorPhone && v.visitorPhone.includes(searchLower)) ||
        (v.phone && v.phone.includes(searchLower)) ||
        (v.flatNumber && v.flatNumber.toLowerCase().includes(searchLower));
      return matchStatus && matchType && matchSearch;
    });
  }, [rawVisits, filters.status, filters.type, filters.search]);

  const handlePreApproveSubmit = async (e) => {
    e.preventDefault();
    if (!preApproveForm.visitorName || !preApproveForm.flatNumber) {
      toast.error("Visitor Name and Flat Number are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/visitors", {
        flatNumber: preApproveForm.flatNumber,
        visitorData: {
          name: preApproveForm.visitorName,
          phone: preApproveForm.phone,
          vehicleNumber: preApproveForm.vehicleNumber,
        },
        visitData: {
          visitorType: preApproveForm.visitorType,
          purpose: preApproveForm.purpose,
          expectedArrival: preApproveForm.expectedArrival,
        },
      });
      toast.success("Visitor pre-approved successfully!");
      setIsPreApproveOpen(false);
      setPreApproveForm({
        visitorName: "",
        phone: "",
        flatNumber: "",
        visitorType: "GUEST",
        vehicleNumber: "",
        purpose: "",
        expectedArrival: new Date().toISOString().slice(0, 16),
      });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pre-approve visitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (visit) => {
    if (visit.status !== "APPROVED") {
      toast.error(`Cannot check in visitor with status '${visit.status}'. Pass must be Approved.`);
      return;
    }
    const targetId = visit.id || visit._id;
    try {
      await api.post("/visitors/check-in", {
        visitId: targetId,
        qrToken: visit.passCode || visit.qrTokenHash || targetId,
      });
      toast.success(`Visitor ${visit.visitorName || "Guest"} checked in successfully!`);
      refetch();
      if (selectedVisit && (selectedVisit.id === targetId || selectedVisit._id === targetId)) {
        setSelectedVisit(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check in visitor");
    }
  };

  const handleCheckOut = async (visit) => {
    const targetId = visit.id || visit._id;
    try {
      await api.post(`/visitors/${targetId}/check-out`);
      toast.success(`Visitor ${visit.visitorName || "Guest"} checked out successfully!`);
      refetch();
      if (selectedVisit && (selectedVisit.id === targetId || selectedVisit._id === targetId)) {
        setSelectedVisit(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check out visitor");
    }
  };

  const handleExpire = async (visit) => {
    const targetId = visit.id || visit._id;
    try {
      await api.patch(`/visitors/${targetId}/cancel`);
      toast.success(`Visitor pass for ${visit.visitorName || "Guest"} set to expired.`);
      refetch();
      if (selectedVisit && (selectedVisit.id === targetId || selectedVisit._id === targetId)) {
        setSelectedVisit(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to expire visitor pass");
    }
  };

  const columns = [
    {
      header: "Visitor Name",
      accessor: "visitorName",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {row.visitorName ? row.visitorName.charAt(0) : "V"}
          </div>
          <div>
            <span className="font-semibold text-text text-sm block">{row.visitorName || "Guest"}</span>
            {(row.visitorPhone || row.phone) && (
              <span className="text-xs text-muted flex items-center gap-1">
                <Phone className="w-3 h-3 text-muted" /> {row.visitorPhone || row.phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Visiting Flat",
      accessor: "flatNumber",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-medium text-text text-sm">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span>Flat {row.flatNumber || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Visitor Type",
      accessor: "visitorType",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface border border-border text-text uppercase">
          {row.visitorType || "GUEST"}
        </span>
      ),
    },
    {
      header: "Entry / Exit",
      accessor: "checkInTime",
      cell: (row) => (
        <div className="text-xs space-y-0.5 text-text">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>
              {row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not In"}
            </span>
          </div>
          {row.checkOutTime && (
            <div className="flex items-center gap-1 text-muted">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{new Date(row.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      ),
      exportAccessor: (row) => (row.checkInTime ? new Date(row.checkInTime).toLocaleString() : "-"),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const variants = {
          CHECKED_OUT: "default",
          CHECKED_IN: "success",
          PENDING: "warning",
          APPROVED: "primary",
          EXPIRED: "danger",
          REJECTED: "danger",
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status}</Badge>;
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => {
        const items = [
          {
            label: "View Pass Details",
            icon: Eye,
            onClick: () => setSelectedVisit(row),
          },
        ];

        if (row.status === "APPROVED") {
          items.push(
            {
              label: "Mark Check-In",
              icon: UserCheck,
              onClick: () => handleCheckIn(row),
            },
            {
              label: "Mark Expired",
              icon: Clock,
              onClick: () => handleExpire(row),
            }
          );
        } else if (row.status === "PENDING") {
          items.push({
            label: "Mark Expired",
            icon: Clock,
            onClick: () => handleExpire(row),
          });
        } else if (row.status === "CHECKED_IN") {
          items.push({
            label: "Mark Check-Out",
            icon: UserX,
            onClick: () => handleCheckOut(row),
          });
        } else if (row.status === "CHECKED_OUT") {
          items.push({
            label: "Mark Expired",
            icon: Clock,
            onClick: () => handleExpire(row),
          });
        }

        return (
          <Dropdown
            align="right"
            items={items}
            trigger={
              <button className="p-1.5 rounded-lg text-muted hover:bg-surface hover:text-text transition-colors">
                <MoreVertical size={16} />
              </button>
            }
          />
        );
      },
    },
  ];

  const handleExport = () => {
    const dataToExport =
      selectedRows.length > 0 ? filteredVisits.filter((r) => selectedRows.includes(r._id)) : filteredVisits;
    exportToCSV(dataToExport, "Visitor_Logs", columns.filter((c) => c.accessor !== "actions"));
  };

  if (isLoading) return <LoadingScreen message="Loading visitor entries..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger/10 text-danger rounded-xl border border-danger/20">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-semibold">Failed to load visitor logs.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Visitor Management & Entry Logs"
        description="Monitor guest check-ins, security gate entries, and delivery visitor passes in real time."
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!filteredVisits.length}>
              <Download size={16} className="mr-2" />
              {selectedRows.length > 0 ? `Export Selected (${selectedRows.length})` : "Export CSV"}
            </Button>
            <Button size="sm" onClick={() => setIsPreApproveOpen(true)}>
              <Plus size={16} className="mr-2" />
              Pre-Approve Visitor
            </Button>
          </div>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Visitors</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.total}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Currently Inside</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.checkedIn}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Expected / Pending</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.pending}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-slate-500/10 text-slate-600 rounded-xl shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Checked Out</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.checkedOut}</h4>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["ALL", "CHECKED_IN", "CHECKED_OUT", "APPROVED", "EXPIRED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilters({ ...filters, status: st, page: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filters.status === st
                    ? "bg-primary text-white shadow-xs"
                    : "bg-background border border-border text-muted hover:text-text"
                }`}
              >
                {st === "ALL" ? "All Visitors" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Select
              className="text-xs py-1.5 h-9 w-36"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            >
              <option value="ALL">All Types</option>
              <option value="GUEST">Guest</option>
              <option value="DELIVERY">Delivery</option>
              <option value="CAB">Cab</option>
              <option value="SERVICE_STAFF">Service Staff</option>
            </Select>
          </div>
        </div>

        <FilterBar
          searchPlaceholder="Search visitor name, phone, or flat number..."
          onSearch={(val) => setFilters({ ...filters, search: val, page: 1 })}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredVisits}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        pagination={{
          currentPage: filters.page,
          totalPages: meta?.totalPages || 1,
          onPageChange: (page) => setFilters({ ...filters, page }),
        }}
      />

      {/* View Pass Details Modal */}
      {selectedVisit && (
        <Modal open={!!selectedVisit} onClose={() => setSelectedVisit(null)} title="Visitor Pass Details">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg uppercase shrink-0">
                {selectedVisit.visitorName ? selectedVisit.visitorName.charAt(0) : "V"}
              </div>
              <div>
                <h3 className="font-bold text-text text-base">{selectedVisit.visitorName || "Guest"}</h3>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-muted" /> {selectedVisit.phone || "No phone provided"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Visiting Flat</span>
                <span className="font-semibold text-text text-sm flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Flat {selectedVisit.flatNumber || "N/A"}
                </span>
              </div>

              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Visitor Type</span>
                <span className="font-semibold text-text text-sm capitalize">
                  {selectedVisit.visitorType || "GUEST"}
                </span>
              </div>

              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Check-In Time</span>
                <span className="font-semibold text-text">
                  {selectedVisit.checkInTime ? new Date(selectedVisit.checkInTime).toLocaleString() : "Not Checked In"}
                </span>
              </div>

              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Check-Out Time</span>
                <span className="font-semibold text-text">
                  {selectedVisit.checkOutTime ? new Date(selectedVisit.checkOutTime).toLocaleString() : "Still Inside"}
                </span>
              </div>
            </div>

            {selectedVisit.vehicleNumber && (
              <div className="p-3 bg-surface border border-border rounded-lg flex items-center gap-2 text-xs">
                <Car className="w-4 h-4 text-muted" />
                <span className="text-muted">Vehicle Number:</span>
                <span className="font-bold text-text uppercase">{selectedVisit.vehicleNumber}</span>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setSelectedVisit(null)}>
                Close
              </Button>
              {selectedVisit.status === "APPROVED" && (
                <>
                  <Button onClick={() => handleCheckIn(selectedVisit)}>
                    <UserCheck className="w-4 h-4 mr-1.5" /> Mark Check-In
                  </Button>
                  <Button variant="outline" onClick={() => handleExpire(selectedVisit)}>
                    <Clock className="w-4 h-4 mr-1.5" /> Mark Expired
                  </Button>
                </>
              )}
              {selectedVisit.status === "PENDING" && (
                <Button variant="outline" onClick={() => handleExpire(selectedVisit)}>
                  <Clock className="w-4 h-4 mr-1.5" /> Mark Expired
                </Button>
              )}
              {selectedVisit.status === "CHECKED_IN" && (
                <Button variant="danger" onClick={() => handleCheckOut(selectedVisit)}>
                  <UserX className="w-4 h-4 mr-1.5" /> Mark Check-Out
                </Button>
              )}
              {selectedVisit.status === "CHECKED_OUT" && (
                <Button variant="outline" onClick={() => handleExpire(selectedVisit)}>
                  <Clock className="w-4 h-4 mr-1.5" /> Mark Expired
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Pre-Approve Visitor Modal */}
      {isPreApproveOpen && (
        <Modal open={isPreApproveOpen} onClose={() => setIsPreApproveOpen(false)} title="Pre-Approve Visitor">
          <form onSubmit={handlePreApproveSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Visitor Name"
                placeholder="e.g. Ramesh Shah"
                value={preApproveForm.visitorName}
                onChange={(e) => setPreApproveForm({ ...preApproveForm, visitorName: e.target.value })}
                required
              />
              <Input
                label="Flat Number"
                placeholder="e.g. A-101"
                value={preApproveForm.flatNumber}
                onChange={(e) => setPreApproveForm({ ...preApproveForm, flatNumber: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                placeholder="Phone number (optional)"
                value={preApproveForm.phone}
                onChange={(e) => setPreApproveForm({ ...preApproveForm, phone: e.target.value })}
              />
              <Select
                label="Visitor Type"
                value={preApproveForm.visitorType}
                onChange={(e) => setPreApproveForm({ ...preApproveForm, visitorType: e.target.value })}
              >
                <option value="GUEST">Guest</option>
                <option value="DELIVERY">Delivery</option>
                <option value="CAB">Cab</option>
                <option value="SERVICE_STAFF">Service Staff</option>
              </Select>
              <Input
                label="Vehicle Number"
                placeholder="e.g. GJ-01-AB-1234"
                value={preApproveForm.vehicleNumber}
                onChange={(e) => setPreApproveForm({ ...preApproveForm, vehicleNumber: e.target.value })}
              />
              <Input
                label="Expected Arrival"
                type="datetime-local"
                value={preApproveForm.expectedArrival}
                onChange={(e) => setPreApproveForm({ ...preApproveForm, expectedArrival: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreApproveOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Pre-Approve Pass
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
