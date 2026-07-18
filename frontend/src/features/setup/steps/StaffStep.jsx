import { Button } from "../../../components/ui";
import api from "../../../services/api";
import { UsersIcon } from "lucide-react";

export default function StaffStep({ save, saving, previous }) {

  const handleNext = () => {
    save((payload) => api.post("/setup/staff", payload).then(r => r.data), { staff: [] });
  };

  return (
    <div className="animate-fade-in text-center py-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <UsersIcon className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-text mb-2">Invite Staff & Guards</h2>
      <p className="text-muted mb-8 max-w-md mx-auto">
        You can invite society staff, managers, and security guards later from the Staff Management module. 
      </p>

      <div className="pt-6 flex justify-between max-w-lg mx-auto">
        <Button variant="outline" onClick={previous} disabled={saving}>Back</Button>
        <Button onClick={handleNext} loading={saving}>Skip & Continue</Button>
      </div>
    </div>
  );
}
