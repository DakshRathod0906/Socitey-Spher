import { useState } from "react";
import { Plus, Building, GripVertical, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Card, Button, Input, Badge } from "../../components/ui";
import { toast } from "sonner";

export default function SocietySetup() {
  const [towers, setTowers] = useState([
    { id: 1, name: "Tower A", floors: 15, flatsPerFloor: 4 },
    { id: 2, name: "Tower B", floors: 15, flatsPerFloor: 4 },
  ]);

  const handleAddTower = () => {
    setTowers([...towers, { id: Date.now(), name: `Tower ${String.fromCharCode(65 + towers.length)}`, floors: 10, flatsPerFloor: 4 }]);
    toast.success("Tower added");
  };

  const handleRemoveTower = (id) => {
    setTowers(towers.filter(t => t.id !== id));
    toast.success("Tower removed");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Society Setup" 
        subtitle="Configure the structural layout of your society."
        actions={<Button>Save Configuration</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-text">Towers / Blocks</h3>
            <Button variant="outline" size="sm" onClick={handleAddTower}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tower
            </Button>
          </div>

          {towers.map((tower, index) => (
            <Card key={tower.id} className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
              <GripVertical className="h-5 w-5 text-muted cursor-grab" />
              <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <Building className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-4">
                <Input 
                  defaultValue={tower.name}
                  label="Tower Name"
                  className="bg-transparent"
                />
                <Input 
                  defaultValue={tower.floors}
                  type="number"
                  label="Total Floors"
                  className="bg-transparent"
                />
                <Input 
                  defaultValue={tower.flatsPerFloor}
                  type="number"
                  label="Flats / Floor"
                  className="bg-transparent"
                />
              </div>

              <button 
                onClick={() => handleRemoveTower(tower.id)}
                className="p-2 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors shrink-0 self-end mb-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-text mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Towers</span>
                <span className="font-medium text-text">{towers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Floors</span>
                <span className="font-medium text-text">{towers.reduce((acc, curr) => acc + Number(curr.floors), 0)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3 mt-3">
                <span className="text-text font-semibold">Total Flats</span>
                <span className="font-bold text-primary text-lg">
                  {towers.reduce((acc, curr) => acc + (Number(curr.floors) * Number(curr.flatsPerFloor)), 0)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-text mb-4">Role Management</h3>
            <p className="text-sm text-muted mb-4">
              Configure which modules are accessible to residents by default.
            </p>
            <div className="space-y-2">
              {['Visitors', 'Complaints', 'Billing', 'Amenities'].map(module => (
                <div key={module} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-light">
                  <span className="text-sm font-medium">{module}</span>
                  <Badge variant="success" size="sm">Enabled</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">Manage Roles</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
