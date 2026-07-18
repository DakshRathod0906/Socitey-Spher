import { useState } from "react";
import { MessageSquare, MoreVertical, Edit } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Modal, Select } from "../../components/ui";

const MOCK_COMPLAINTS = [
  { id: 1, title: "Water leakage in master bathroom", category: "Plumbing", flat: "A-101", date: "Today, 10:00 AM", status: "Open", assignedTo: "Ramesh" },
  { id: 2, title: "Corridor light not working", category: "Electrical", flat: "B-205", date: "Yesterday", status: "In Progress", assignedTo: "Suresh" },
  { id: 3, title: "Lobby AC making noise", category: "Appliance", flat: "Common Area", date: "12 Oct 2023", status: "Resolved", assignedTo: "Suresh" },
  { id: 4, title: "Garbage not collected", category: "Housekeeping", flat: "C-401", date: "10 Oct 2023", status: "Resolved", assignedTo: "Mahesh" },
];

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  const filteredComplaints = MOCK_COMPLAINTS.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.flat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      header: "Ticket", 
      accessor: "title", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.title}</p>
          <p className="text-xs text-muted">{row.category} • {row.flat}</p>
        </div>
      )
    },
    { header: "Date Raised", accessor: "date" },
    { header: "Assigned To", accessor: "assignedTo" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "Resolved": "success",
          "In Progress": "primary",
          "Open": "danger"
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => (
        <Dropdown 
          align="right"
          items={[
            { label: "Update Status", icon: Edit, onClick: () => { setSelectedComplaint(row); setIsUpdateModalOpen(true); } },
          ]}
          trigger={
            <button className="p-1.5 rounded-lg text-muted hover:bg-secondary-light hover:text-text transition-colors">
              <MoreVertical size={16} />
            </button>
          }
        />
      )
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Helpdesk & Complaints" 
        subtitle="Manage resident tickets and assign service staff."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-danger-light flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-danger" />
          </div>
          <div>
            <p className="text-sm text-muted">Open Tickets</p>
            <p className="text-2xl font-bold text-text">14</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">In Progress</p>
            <p className="text-2xl font-bold text-text">8</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success-light flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted">Resolved (This Week)</p>
            <p className="text-2xl font-bold text-text">45</p>
          </div>
        </div>
      </div>

      <FilterBar 
        searchPlaceholder="Search tickets or flats..."
        onSearch={setSearchQuery}
        filters={[
          { label: "Category", options: [{ label: "Plumbing" }, { label: "Electrical" }, { label: "Housekeeping" }] },
          { label: "Status", options: [{ label: "Open" }, { label: "In Progress" }, { label: "Resolved" }] }
        ]}
      />

      <DataTable 
        columns={columns}
        data={filteredComplaints}
        itemsPerPage={10}
      />

      <Modal 
        open={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Ticket"
        description={selectedComplaint ? `Ticket: ${selectedComplaint.title}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("Ticket updated successfully!");
              setIsUpdateModalOpen(false);
            }}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Status</label>
            <Select defaultValue={selectedComplaint?.status}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Assign To</label>
            <Select defaultValue={selectedComplaint?.assignedTo}>
              <option value="Ramesh">Ramesh (Plumber)</option>
              <option value="Suresh">Suresh (Electrician)</option>
              <option value="Mahesh">Mahesh (Housekeeping)</option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
