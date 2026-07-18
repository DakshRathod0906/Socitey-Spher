import { Car, Zap, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Card, Badge, Button } from "../../components/ui";

const MOCK_MY_PARKING = [
  { id: 1, spotNo: "P1-01", type: "4 Wheeler", vehicleNo: "MH-12-AB-1234", vehicleModel: "Honda City", isEV: false },
  { id: 2, spotNo: "P2-EV-01", type: "EV (4W)", vehicleNo: "MH-12-EV-9999", vehicleModel: "Tata Nexon EV", isEV: true },
];

export default function MyParking() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="My Parking" 
        subtitle="Manage your allotted parking spots and registered vehicles."
        actions={<Button variant="outline">Request New Spot</Button>}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {MOCK_MY_PARKING.map((spot) => (
          <Card key={spot.id} className="p-0 overflow-hidden">
            <div className={`p-4 border-b border-border flex items-center justify-between ${spot.isEV ? 'bg-success-light/30' : 'bg-secondary-light/50'}`}>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-muted" />
                <span className="font-semibold text-text text-lg">{spot.spotNo}</span>
              </div>
              <Badge variant={spot.isEV ? "success" : "default"}>
                {spot.type}
              </Badge>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <p className="text-sm text-muted mb-1">Registered Vehicle</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-text text-lg">{spot.vehicleNo}</p>
                  <p className="text-sm font-medium text-text">{spot.vehicleModel}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted bg-surface p-2 rounded-md">
                <ShieldCheck className="h-4 w-4 text-success" />
                This vehicle is pre-approved at the security gate via ANPR.
              </div>
              
              {spot.isEV && (
                <div className="mt-3 flex items-center gap-2 text-xs text-primary bg-primary-light/30 p-2 rounded-md">
                  <Zap className="h-4 w-4" />
                  EV Charging Station Active. Billing linked to your monthly maintenance.
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
