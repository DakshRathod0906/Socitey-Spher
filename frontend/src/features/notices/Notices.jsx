import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Archive } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Button } from "../../components/ui";
import CreateNoticeModal from "./components/CreateNoticeModal";
import ViewNoticeModal from "./components/ViewNoticeModal";
import { useNotices, useArchiveNotice, useDeleteNotice } from "./hooks/useNotices";
import { format } from "date-fns";

export default function Notices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  const { data: notices = [], isLoading } = useNotices({ archived: statusFilter === "Archived" });
  const { mutate: archiveNotice } = useArchiveNotice();
  const { mutate: deleteNotice } = useDeleteNotice();
  
  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setIsCreateModalOpen(true);
  };

  const handleView = (notice) => {
    setSelectedNotice(notice);
    setIsViewModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedNotice(null);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this notice?")) {
      deleteNotice(id);
    }
  };

  const columns = [
    { 
      header: "Notice Title", 
      accessor: "title", 
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.isPinned && <span className="text-primary" title="Pinned">📌</span>}
          <span className="font-medium text-text">{row.title}</span>
        </div>
      )
    },
    { 
      header: "Date Posted", 
      accessor: "publishDate",
      cell: (row) => format(new Date(row.publishDate || row.createdAt), "MMM d, yyyy")
    },
    { 
      header: "Target Audience", 
      accessor: "audience",
      cell: (row) => row.audience.includes("all") ? "All Residents" : row.audience.join(", ")
    },
    { 
      header: "Status", 
      accessor: "isArchived",
      cell: (row) => (
        <Badge variant={row.isArchived ? "default" : "success"}>
          {row.isArchived ? "Archived" : "Active"}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => (
        <Dropdown 
          align="right"
          items={[
            { label: "View Notice", icon: Eye, onClick: () => handleView(row) },
            { label: "Edit", icon: Edit, onClick: () => handleEdit(row) },
            { type: "separator" },
            ...(row.isArchived ? [] : [{ label: "Archive", icon: Archive, onClick: () => archiveNotice(row._id) }]),
            { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(row._id) },
          ]}
          trigger={
            <Button variant="outline" size="sm">Options</Button>
          }
        />
      )
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Notice Board" 
        subtitle="Broadcast announcements, meeting minutes, and updates to residents."
      />

      <FilterBar 
        searchPlaceholder="Search notices by title..."
        onSearch={setSearchQuery}
        actionButton={{ label: "Create Notice", icon: Plus, onClick: handleCreate }}
        filters={[
          { 
            label: "Status", 
            options: [{ label: "Active", value: "Active" }, { label: "Archived", value: "Archived" }],
            value: statusFilter,
            onChange: setStatusFilter
          }
        ]}
      />

      <DataTable 
        columns={columns}
        data={filteredNotices}
        itemsPerPage={10}
        isLoading={isLoading}
        emptyStateMessage={searchQuery ? "No notices match your search." : `No ${statusFilter.toLowerCase()} notices found.`}
      />

      <CreateNoticeModal 
        open={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedNotice(null);
        }}
        initialValues={selectedNotice}
      />

      <ViewNoticeModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedNotice(null);
        }}
        notice={selectedNotice}
      />
    </div>
  );
}
