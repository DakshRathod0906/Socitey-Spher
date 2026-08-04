import { useState, useEffect } from "react";
import { Modal, Button, Select } from "../../../components/ui";
import { useAllocateSlot, useVehicles } from "../hooks/useParking";
import { useResidents, useUsers } from "../../residents/hooks/useResidents";

export default function AssignParkingModal({ isOpen, onClose, slot }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const { data: residentsData, isLoading: residentsLoading } = useResidents();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const { mutate: allocateSlot, isPending } = useAllocateSlot();

  // Safely extract arrays from backend responses
  const primaryList = Array.isArray(residentsData) ? residentsData : (residentsData?.data || []);
  const secondaryList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
  const vehiclesList = Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.data || []);

  // Combine and deduplicate residents list, ensuring valid id and name
  const residentsMap = new Map();
  [...primaryList, ...secondaryList].forEach((u) => {
    if (!u) return;
    const id = u.userId || u._id;
    const name = u.name || u.occupantName;
    if (!id || !name || name === "Resident") return;

    const idStr = String(id);
    const flatNum = u.flatId?.flatNumber || u.flat?.flatNumber || u.flatNumber || "";

    if (!residentsMap.has(idStr) || (!residentsMap.get(idStr).flatNumber && flatNum)) {
      residentsMap.set(idStr, {
        _id: idStr,
        name: name,
        flatNumber: flatNum,
      });
    }
  });

  const residents = Array.from(residentsMap.values());

  // Set initial selected values if editing an existing allocation
  useEffect(() => {
    if (slot && slot.allocatedTo) {
      const userId = typeof slot.allocatedTo === "object" ? slot.allocatedTo._id : slot.allocatedTo;
      setSelectedUser(userId || "");
      const vehId = typeof slot.vehicleId === "object" ? slot.vehicleId?._id : slot.vehicleId;
      setSelectedVehicle(vehId || "");
    } else {
      setSelectedUser("");
      setSelectedVehicle("");
    }
  }, [slot]);

  // Filter vehicles owned by the selected resident vs other society vehicles
  const residentVehicles = vehiclesList.filter((v) => {
    const ownerId = typeof v.ownerUserId === "object" ? v.ownerUserId?._id : v.ownerUserId;
    return String(ownerId) === String(selectedUser);
  });

  const otherVehicles = vehiclesList.filter((v) => {
    const ownerId = typeof v.ownerUserId === "object" ? v.ownerUserId?._id : v.ownerUserId;
    return String(ownerId) !== String(selectedUser);
  });

  const handleAllocate = () => {
    if (!selectedUser || !slot?._id) return;

    allocateSlot(
      {
        slotId: slot._id,
        userId: selectedUser,
        vehicleId: selectedVehicle || null,
      },
      {
        onSuccess: () => {
          onClose();
          setSelectedUser("");
          setSelectedVehicle("");
        },
      }
    );
  };

  const isLoading = residentsLoading && usersLoading;

  const formatVehicleType = (type) => {
    const map = {
      FOUR_WHEELER: "Car",
      TWO_WHEELER: "2W / Bike",
      EV_FOUR_WHEELER: "EV (4W)",
      EV_TWO_WHEELER: "EV (2W)",
      BICYCLE: "Bicycle",
      OTHER: "Other"
    };
    return map[type] || type || "Vehicle";
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Assign Parking Spot"
      description={`Allocate slot ${slot?.slotNumber || "N/A"} to a resident.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} loading={isPending} disabled={!selectedUser}>
            Save Allocation
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <Select
          label="Resident *"
          disabled={isLoading}
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setSelectedVehicle("");
          }}
        >
          <option value="">Select a resident...</option>
          {residents.map((r) => {
            const flatNum = r.flatId?.flatNumber || r.flat?.flatNumber || r.flatNumber;
            return (
              <option key={r._id} value={r._id}>
                {r.name} {flatNum ? `(Flat ${flatNum})` : ""}
              </option>
            );
          })}
        </Select>

        {selectedUser && (
          <div>
            <Select
              label="Vehicle (Optional)"
              disabled={vehiclesLoading}
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">None / No vehicle linked (Optional)</option>
              {residentVehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  ⭐ {v.licensePlate} • {formatVehicleType(v.type)} {v.makeModel ? `(${v.makeModel})` : ""} (Resident's Vehicle)
                </option>
              ))}
              {otherVehicles.map((v) => {
                const ownerName = typeof v.ownerUserId === "object" ? v.ownerUserId?.name : "";
                return (
                  <option key={v._id} value={v._id}>
                    🚗 {v.licensePlate} • {formatVehicleType(v.type)} {ownerName ? `(${ownerName})` : ""}
                  </option>
                );
              })}
            </Select>
            {residentVehicles.length === 0 && (
              <p className="text-xs text-muted mt-1">
                This resident has no registered vehicles under their account. You can select an existing society vehicle above or save without linking a vehicle.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
