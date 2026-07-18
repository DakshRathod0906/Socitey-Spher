import { useState } from "react";
import { Button } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function AmenityStep({ save, saving, previous }) {
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    // For now, we skip detailed amenity config.
    save((payload) => api.post("/setup/amenities", payload).then(r => r.data), { amenities: [] });
  };

  return (
    <div className="animate-fade-in text-center py-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-text mb-2">Amenities Configuration</h2>
      <p className="text-muted mb-8 max-w-md mx-auto">
        Detailed amenity booking and management will be available in the upcoming <strong>Facility Module</strong>. For now, you can skip this step.
      </p>

      <div className="pt-6 flex justify-between max-w-lg mx-auto">
        <Button variant="outline" onClick={previous} disabled={saving}>Back</Button>
        <Button onClick={handleNext} loading={saving}>Skip for Now</Button>
      </div>
    </div>
  );
}
