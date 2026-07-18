import { Button } from "../../../components/ui";
import { CheckCircle2 } from "lucide-react";

export default function CompletionStep({ complete, saving, previous }) {
  return (
    <div className="animate-fade-in text-center py-8">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">Setup Complete!</h2>
      <p className="text-muted mb-8 max-w-md mx-auto">
        Your society platform is ready. Click below to activate your society and access your dashboard.
      </p>

      <div className="pt-6 flex justify-between max-w-lg mx-auto">
        <Button variant="outline" onClick={previous} disabled={saving}>Back</Button>
        <Button onClick={complete} loading={saving} size="lg">Activate Society</Button>
      </div>
    </div>
  );
}
