import { useState } from "react";
import { Car, Search, Edit } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Modal, Button, Input, Select } from "../../components/ui";

const MOCK_PARKING = [
  { id: 1, spotNo: "P1-01", flat: "A-101", vehicleNo: "MH-12-AB-1234", type: "4 Wheeler", status: "Allotted" },
  { id: 2, spotNo: "P1-02", flat: "A-102", vehicleNo: "MH-12-CD-5678", type: "2 Wheeler", status: "Allotted" },
  { id: 3, spotNo: "P1-03", flat: "-", vehicleNo: "-", type: "4 Wheeler", status: "Available" },
  { id: 4, spotNo: "P2-EV-01", flat: "B-205", vehicleNo: "MH-12-EV-9999", type: "EV (4W)", status: "Allotted" },
];

export default function Parking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  const filteredParking = MOCK_PARKING.filter(p => 
    p.spotNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.flat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: "Spot No.", accessor: "spotNo", sortable: true, cell: (row) => <span className="font-medium">{row.spotNo}</span> },
    { header: "Allotted To (Flat)", accessor: "flat", sortable: true },
    { header: "Vehicle No.", accessor: "vehicleNo" },
    { header: "Vehicle Type", accessor: "type" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => (
        <Badge variant={row.status === "Available" ? "success" : "default"}>
          {row.status}
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
            { label: row.status === "Available" ? "Assign Spot" : "Edit Allocation", icon: Edit, onClick: () => { setSelectedSpot(row); setIsAssignModalOpen(true); } },
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

      <FilterBar 
        searchPlaceholder="Search by spot no, flat, or vehicle..."
        onSearch={setSearchQuery}
        filters={[
          { label: "Status", options: [{ label: "Allotted" }, { label: "Available" }] },
          { label: "Type", options: [{ label: "4 Wheeler" }, { label: "2 Wheeler" }, { label: "EV (4W)" }] }
        ]}
      />

      <DataTable 
        columns={columns}
        data={filteredParking}
        itemsPerPage={10}
      />

      <Modal 
        open={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        title={selectedSpot?.status === "Available" ? "Assign Parking Spot" : "Edit Parking Allocation"}
        description={`Spot Number: ${selectedSpot?.spotNo} (${selectedSpot?.type})`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("Parking spot updated successfully!");
              setIsAssignModalOpen(false);
            }}>Save Allocation</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Assign to Flat" placeholder="e.g. A-101" defaultValue={selectedSpot?.flat !== "-" ? selectedSpot?.flat : ""} />
          <Input label="Vehicle Number" placeholder="e.g. MH-12-AB-1234" defaultValue={selectedSpot?.vehicleNo !== "-" ? selectedSpot?.vehicleNo : ""} />
        </div>
      </Modal>
    </div>
  );
}
