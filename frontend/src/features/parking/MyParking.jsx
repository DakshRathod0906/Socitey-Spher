import { useState } from "react";
import { Car, Zap, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Card, Badge, Button } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useParkingSlots, useVehicles } from "./hooks/useParking";
import { useAuth } from "../../contexts/AuthContext";
import RegisterVehicleModal from "./components/RegisterVehicleModal";

export default function MyParking() {
  const { user } = useAuth();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const { data: slots, isLoading: slotsLoading } = useParkingSlots();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();

  if (slotsLoading || vehiclesLoading) return <LoadingScreen message="Loading parking data..." />;

  // Filter slots for the current resident
  const mySlots = slots?.filter(s => s.allocatedTo?._id === user._id) || [];
  const myVehicles = vehicles?.filter(v => v.ownerUserId?._id === user._id) || [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="My Parking" 
        subtitle="Manage your allotted parking spots and registered vehicles."
        actions={
          <Button onClick={() => setIsRegisterModalOpen(true)}>
            Register Vehicle
          </Button>
        }
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text mb-4">Allocated Parking Spots</h2>
          {mySlots.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border border-dashed rounded-xl text-muted">
              You don't have any parking spots allocated yet. Register a vehicle and contact the Admin to assign a spot.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {mySlots.map((spot) => {
                const isEV = spot.slotType === "ev";
                return (
                  <Card key={spot._id} className="p-0 overflow-hidden">
                    <div className={`p-4 border-b border-border flex items-center justify-between ${isEV ? 'bg-success-light/30' : 'bg-secondary-light/50'}`}>
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-muted" />
                        <span className="font-semibold text-text text-lg">{spot.slotNumber}</span>
                      </div>
                      <Badge variant={isEV ? "success" : "default"}>
                        {spot.slotType.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="p-5">
                      <div className="mb-4">
                        <p className="text-sm text-muted mb-1">Registered Vehicle</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-text text-lg">
                            {spot.vehicleId ? spot.vehicleId.licensePlate : "No Vehicle Assigned"}
                          </p>
                          {spot.vehicleId?.makeModel && (
                            <p className="text-sm font-medium text-text">{spot.vehicleId.makeModel}</p>
                          )}
                        </div>
                      </div>
                      
                      {spot.vehicleId && (
                        <div className="flex items-center gap-2 text-xs text-muted bg-surface p-2 rounded-md">
                          <ShieldCheck className="h-4 w-4 text-success" />
                          This vehicle is pre-approved at the security gate via ANPR.
                        </div>
                      )}
                      
                      {isEV && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary-light/30 p-2 rounded-md">
                          <Zap className="h-4 w-4" />
                          EV Charging Station Active. Billing linked to your monthly maintenance.
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-text mb-4">My Registered Vehicles</h2>
          {myVehicles.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border border-dashed rounded-xl text-muted">
              No vehicles registered yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myVehicles.map(v => (
                <Card key={v._id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-text">{v.licensePlate}</span>
                      <Badge variant="outline">{v.type}</Badge>
                    </div>
                    <p className="text-sm text-muted">{v.makeModel || "Unknown Model"}</p>
                    <p className="text-sm text-muted">{v.color || "Unknown Color"}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <RegisterVehicleModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
