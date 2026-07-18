import { useState } from "react";
import { Megaphone, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Modal, Button, Input, Textarea, Checkbox } from "../../components/ui";

const MOCK_NOTICES = [
  { id: 1, title: "Annual General Meeting 2024", date: "Today", target: "All Residents", status: "Active" },
  { id: 2, title: "Water Supply Interruption", date: "Yesterday", target: "Block A & B", status: "Active" },
  { id: 3, title: "Diwali Celebration Guidelines", date: "Last Month", target: "All Residents", status: "Archived" },
];

export default function Notices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const filteredNotices = MOCK_NOTICES.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      header: "Notice Title", 
      accessor: "title", 
      cell: (row) => <span className="font-medium text-text">{row.title}</span> 
    },
    { header: "Date Posted", accessor: "date" },
    { header: "Target Audience", accessor: "target" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => (
        <Badge variant={row.status === "Active" ? "success" : "default"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: () => (
        <Dropdown 
          align="right"
          items={[
            { label: "View Notice", icon: Eye, onClick: () => {} },
            { label: "Edit", icon: Edit, onClick: () => {} },
            { type: "separator" },
            { label: "Archive", icon: Trash2, danger: true, onClick: () => toast.success("Notice archived") },
          ]}
          trigger={
            <Button variant="outline" size="sm">Options</Button>
          }
        />
      )
    }
  ];

  const handleCreateNotice = () => {
    toast.success("Notice broadcasted successfully to all selected residents.");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Notice Board" 
        subtitle="Broadcast announcements, meeting minutes, and updates to residents."
      />

      <FilterBar 
        searchPlaceholder="Search notices by title..."
        onSearch={setSearchQuery}
        actionButton={{ label: "Create Notice", icon: Plus, onClick: () => setIsCreateModalOpen(true) }}
        filters={[
          { label: "Status", options: [{ label: "Active" }, { label: "Archived" }] }
        ]}
      />

      <DataTable 
        columns={columns}
        data={filteredNotices}
        itemsPerPage={10}
      />

      <Modal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Notice"
        description="Draft a new announcement. You can target specific blocks or send to everyone."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNotice}>Broadcast Notice</Button>
          </>
        }
      >
        <div className="space-y-4 animate-fade-in">
          <Input label="Notice Title" placeholder="e.g. Annual General Meeting" />
          <Textarea 
            label="Message Content" 
            placeholder="Write the full announcement here..." 
            rows={5} 
          />
          
          <div className="pt-2">
            <label className="text-sm font-medium text-text mb-2 block">Target Audience</label>
            <div className="space-y-2">
              <Checkbox label="Send to ALL residents" defaultChecked />
              <div className="ml-6 space-y-2 opacity-50 pointer-events-none">
                <Checkbox label="Block A only" />
                <Checkbox label="Block B only" />
                <Checkbox label="Owners only" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
