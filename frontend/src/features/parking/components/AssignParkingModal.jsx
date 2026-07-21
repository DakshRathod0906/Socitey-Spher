import { useState } from "react";
import { Modal, Button, Select } from "../../../components/ui";
import { useAllocateSlot, useVehicles } from "../hooks/useParking";
import { useUsers } from "../../residents/hooks/useResidents";

export default function AssignParkingModal({ isOpen, onClose, slot }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { mutate: allocateSlot, isPending } = useAllocateSlot();

  // Get active residents
  const residents = users?.filter(u => u.role === "resident" && u.accountStatus === "ACTIVE") || [];
  
  // Filter vehicles by selected user
  const userVehicles = vehicles?.filter(v => v.ownerUserId?._id === selectedUser) || [];

  const handleAllocate = () => {
    if (!selectedUser) return;
    
    allocateSlot({
      slotId: slot._id,
      userId: selectedUser,
      vehicleId: selectedVehicle || null
    }, {
      onSuccess: () => {
        onClose();
        setSelectedUser("");
        setSelectedVehicle("");
      }
    });
  };

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      title="Assign Parking Spot"
      description={`Allocate slot ${slot?.slotNumber} to a resident.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleAllocate} loading={isPending} disabled={!selectedUser}>Save Allocation</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select 
          label="Resident *"
          disabled={usersLoading}
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setSelectedVehicle(""); // Reset vehicle when user changes
          }}
          options={[
            { label: "Select a resident...", value: "" },
            ...residents.map(r => ({
              label: `${r.name} (${r.flatId?.flatNumber || 'No Flat'})`,
              value: r._id
            }))
          ]}
        />
        
        {selectedUser && (
          <Select 
            label="Vehicle"
            disabled={vehiclesLoading || userVehicles.length === 0}
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            options={[
              { label: userVehicles.length === 0 ? "No registered vehicles" : "Select a vehicle (Optional)...", value: "" },
              ...userVehicles.map(v => ({
                label: `${v.licensePlate} (${v.type})`,
                value: v._id
              }))
            ]}
          />
        )}
      </div>
    </Modal>
  );
}
