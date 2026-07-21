import { useState } from "react";
import { Plus, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Button } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useParkingSlots, useUpdateOccupancy } from "./hooks/useParking";
import AssignParkingModal from "./components/AssignParkingModal";
import CreateSlotModal from "./components/CreateSlotModal";

export default function Parking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignSlot, setAssignSlot] = useState(null);
  
  const { data: slots, isLoading, isError } = useParkingSlots();
  const { mutate: updateOccupancy } = useUpdateOccupancy();

  if (isLoading) return <LoadingScreen message="Loading parking slots..." />;
  if (isError) return <div className="p-8 text-center bg-danger-light text-danger rounded-xl">Failed to load parking slots.</div>;

  let filteredSlots = slots || [];

  if (statusFilter) {
    filteredSlots = filteredSlots.filter(s => s.status === statusFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredSlots = filteredSlots.filter(s => 
      s.slotNumber.toLowerCase().includes(q) || 
      s.allocatedTo?.flatId?.flatNumber?.toLowerCase().includes(q) ||
      s.vehicleId?.licensePlate?.toLowerCase().includes(q)
    );
  }

  // Metrics
  const totalSlots = slots?.length || 0;
  const allocated = slots?.filter(s => s.status === "ALLOCATED").length || 0;
  const available = slots?.filter(s => s.status === "AVAILABLE").length || 0;
  const occupied = slots?.filter(s => s.isOccupied).length || 0;

  const columns = [
    { header: "Spot No.", accessor: "slotNumber", sortable: true, cell: (row) => <span className="font-medium">{row.slotNumber}</span> },
    { 
      header: "Allotted To (Flat)", 
      accessor: "allocatedTo", 
      sortable: true,
      cell: (row) => row.allocatedTo ? `${row.allocatedTo.name} (${row.allocatedTo.flatId?.flatNumber || 'N/A'})` : "-" 
    },
    { 
      header: "Vehicle No.", 
      accessor: "vehicleNo",
      cell: (row) => row.vehicleId ? row.vehicleId.licensePlate : "-"
    },
    { 
      header: "Slot Type", 
      accessor: "slotType",
      cell: (row) => <span className="capitalize">{row.slotType}</span>
    },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => (
        <Badge variant={row.status === "AVAILABLE" ? "success" : "default"}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: "Occupancy", 
      accessor: "isOccupied",
      cell: (row) => (
        <Badge variant={row.isOccupied ? "danger" : "outline"}>
          {row.isOccupied ? "Occupied" : "Empty"}
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
            { 
              label: row.status === "AVAILABLE" ? "Assign Spot" : "Edit Allocation", 
              icon: Edit, 
              onClick: () => setAssignSlot(row) 
            },
            {
              label: row.isOccupied ? "Mark Empty" : "Mark Occupied",
              icon: row.isOccupied ? ToggleLeft : ToggleRight,
              onClick: () => updateOccupancy({ slotId: row._id, isOccupied: !row.isOccupied })
            }
          ]}
          trigger={
            <Button variant="outline" size="sm">Manage</Button>
          }
        />
      )
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Parking Management" 
        subtitle="Manage resident parking spots and EV charging allocations."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border">
          <p className="text-sm text-muted">Total Slots</p>
          <p className="text-2xl font-bold text-text">{totalSlots}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border">
          <p className="text-sm text-muted">Allocated</p>
          <p className="text-2xl font-bold text-text">{allocated}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border">
          <p className="text-sm text-muted">Available</p>
          <p className="text-2xl font-bold text-text">{available}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-border">
          <p className="text-sm text-muted">Occupied Right Now</p>
          <p className="text-2xl font-bold text-danger">{occupied}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto flex-1">
          <FilterBar 
            searchPlaceholder="Search by spot no, flat, or vehicle..."
            onSearch={setSearchQuery}
            filters={[
              { 
                label: "Status", 
                options: [
                  { label: "All", value: "" }, 
                  { label: "Allocated", value: "ALLOCATED" }, 
                  { label: "Available", value: "AVAILABLE" }
                ],
                onChange: setStatusFilter
              }
            ]}
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto whitespace-nowrap">
          <Plus size={18} className="mr-2" />
          Create Slot
        </Button>
      </div>

      <DataTable 
        columns={columns}
        data={filteredSlots}
        itemsPerPage={10}
        emptyMessage="No parking slots found."
      />

      {assignSlot && (
        <AssignParkingModal 
          isOpen={true} 
          onClose={() => setAssignSlot(null)} 
          slot={assignSlot} 
        />
      )}

      <CreateSlotModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
