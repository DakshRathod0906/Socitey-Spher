import { useState, useEffect } from "react";
import { Button, Badge } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";
import { AlertCircle, Building2, ChevronDown, ChevronUp, Layers } from "lucide-react";

export default function FlatStep({ save, saving, previous }) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flats, setFlats] = useState([]);
  const [expandedTowers, setExpandedTowers] = useState({});

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
      await api.post("/setup/flats");
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
    save(() => Promise.resolve({ progress: { flats: true }, message: "Proceeding" }), {});
  };

  const toggleExpandTower = (tName) => {
    setExpandedTowers((prev) => ({
      ...prev,
      [tName]: !prev[tName],
    }));
  };

  // Sort flats numerically by floor, then flat number
  const sortedFlats = [...flats].sort((a, b) => {
    if (a.floor !== b.floor) return a.floor - b.floor;
    return a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true });
  });

  // Group by Tower -> Floor
  const groupedByTowerAndFloor = sortedFlats.reduce((acc, flat) => {
    const tName = flat.towerId?.name || "Unknown";
    const floorNum = flat.floor || 1;
    if (!acc[tName]) acc[tName] = {};
    if (!acc[tName][floorNum]) acc[tName][floorNum] = [];
    acc[tName][floorNum].push(flat);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text">Generate Flats Inventory</h2>
        <p className="text-muted text-sm mt-1">
          Automatically generate structured flat inventory organized by tower and floor numbers.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-text">
          <p className="font-semibold text-primary mb-0.5">Important Note</p>
          <p className="text-muted">
            Generating flats creates the complete inventory for your society. If you modify tower configurations later and regenerate, any unassigned auto-generated flats will be updated.
          </p>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <Button
          size="lg"
          onClick={handleGenerate}
          loading={generating}
          disabled={loading || saving}
        >
          {flats.length > 0 ? "Regenerate Inventory" : "Generate Inventory Now"}
        </Button>
      </div>

      {!loading && flats.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-base text-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Flats Overview & Layout ({flats.length} Total Flats)
            </h3>
          </div>

          {Object.entries(groupedByTowerAndFloor).map(([towerName, floorMap]) => {
            const floorNumbers = Object.keys(floorMap).map(Number).sort((a, b) => a - b);
            const totalFlatsInTower = Object.values(floorMap).reduce((sum, list) => sum + list.length, 0);
            const isExpanded = expandedTowers[towerName];
            const displayedFloors = isExpanded ? floorNumbers : floorNumbers.slice(0, 3);

            return (
              <div key={towerName} className="bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {towerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-base">Tower {towerName}</h4>
                      <p className="text-xs text-muted">
                        {floorNumbers.length} Floors • {totalFlatsInTower} Total Flats
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">
                    {totalFlatsInTower} Units
                  </Badge>
                </div>

                {/* Floor Rows */}
                <div className="space-y-3 pt-2">
                  {displayedFloors.map((floorNum) => (
                    <div key={floorNum} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-background/50 border border-border/60 rounded-lg">
                      <div className="flex items-center gap-2 w-28 shrink-0">
                        <Layers className="w-3.5 h-3.5 text-muted" />
                        <span className="text-xs font-semibold text-text">Floor {floorNum}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 flex-1">
                        {floorMap[floorNum].map((flat) => (
                          <span
                            key={flat._id}
                            className="px-2.5 py-1 bg-surface border border-border rounded-md text-xs font-medium text-text shadow-2xs hover:border-primary/40 transition-colors"
                          >
                            {flat.flatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {floorNumbers.length > 3 && (
                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleExpandTower(towerName)}
                      className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          Show Less Floors
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          Show All {floorNumbers.length} Floors ({floorNumbers.length - 3} More Floors)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-8 flex justify-between mt-auto border-t border-border mt-8">
        <Button variant="outline" onClick={previous} disabled={saving || generating}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={flats.length === 0 || saving || generating}>
          Continue
        </Button>
      </div>
    </div>
  );
}
