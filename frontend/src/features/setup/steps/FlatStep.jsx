import { useState, useEffect } from "react";
import { Button } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function FlatStep({ save, saving, previous }) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flats, setFlats] = useState([]);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/setup/flats");
      setFlats(res.data);
    } catch (error) {
      toast.error("Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await api.post("/setup/flats"); // Generates flats backend side
      toast.success("Flats generated successfully!");
      await fetchFlats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate flats");
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (flats.length === 0) {
      toast.error("Please generate flats before proceeding.");
      return;
    }
    // We already saved/generated them. We can just call save with dummy payload to advance progress, 
    // but progress is already updated on backend by the generate endpoint.
    // Instead of dummy payload, we use `save` which triggers the state machine.
    // Actually our /setup/flats post endpoint does the marking. We'll just call `next` if we had access to it.
    // Let's modify the way save works, or just hit an endpoint to proceed. 
    // Since we called generate via API already, the backend marked flats as completed.
    // So we can just proceed. However, the requirement is to use `save` from hook.
    // Let's create an empty POST or just trigger a refetch of status and advance.
    save(() => Promise.resolve({ progress: { flats: true }, message: "Proceeding" }), {});
  };

  // Group flats by tower name
  const groupedFlats = flats.reduce((acc, flat) => {
    const tName = flat.towerId?.name || "Unknown";
    if (!acc[tName]) acc[tName] = [];
    acc[tName].push(flat);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text">Generate Flats</h2>
        <p className="text-muted text-sm mt-1">
          Automatically generate all flats based on your tower dimensions.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-text">
          <p className="font-medium text-primary mb-1">Important Note</p>
          <p>
            Generating flats will create the entire inventory for your society. If you change tower configurations later and regenerate, any unassigned auto-generated flats will be replaced.
          </p>
        </div>
      </div>

      <div className="flex justify-center py-6">
        <Button 
          size="lg" 
          onClick={handleGenerate} 
          loading={generating}
          disabled={loading || saving}
        >
          {flats.length > 0 ? "Regenerate Flats" : "Generate Flats Now"}
        </Button>
      </div>

      {!loading && flats.length > 0 && (
        <div className="mt-8 space-y-8">
          <h3 className="font-semibold text-lg border-b border-border pb-2">Preview</h3>
          {Object.entries(groupedFlats).map(([towerName, towerFlats]) => (
            <div key={towerName}>
              <h4 className="font-medium text-text mb-3">Tower {towerName}</h4>
              <div className="flex flex-wrap gap-2">
                {towerFlats.slice(0, 15).map(f => (
                  <div key={f._id} className="px-3 py-1.5 bg-surface border border-border rounded text-sm text-text">
                    {f.flatNumber}
                  </div>
                ))}
                {towerFlats.length > 15 && (
                  <div className="px-3 py-1.5 bg-surface/50 border border-border border-dashed rounded text-sm text-muted italic">
                    + {towerFlats.length - 15} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-8 flex justify-between mt-auto">
        <Button variant="outline" onClick={previous} disabled={saving || generating}>Back</Button>
        <Button onClick={handleNext} disabled={flats.length === 0 || saving || generating}>Continue</Button>
      </div>
    </div>
  );
}
