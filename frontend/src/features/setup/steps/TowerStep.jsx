import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "lucide-react";

const towersSchema = z.object({
  towers: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    floorsCount: z.coerce.number().min(1, "Minimum 1 floor"),
    flatsPerFloor: z.coerce.number().min(1, "Minimum 1 flat"),
  })).min(1, "Add at least one tower")
});

export default function TowerStep({ save, saving, previous }) {
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(towersSchema),
    defaultValues: { towers: [{ name: "A", floorsCount: 1, flatsPerFloor: 4 }] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "towers"
  });

  useEffect(() => {
    const fetchTowers = async () => {
      try {
        const res = await api.get("/setup/towers");
        if (res.data && res.data.length > 0) {
          reset({ towers: res.data });
        }
      } catch (error) {
        toast.error("Failed to load towers");
      } finally {
        setLoading(false);
      }
    };
    fetchTowers();
  }, [reset]);

  const onSubmit = (data) => {
    save((payload) => api.post("/setup/towers", payload).then(r => r.data), data);
  };

  if (loading) return <div className="text-center py-10 text-muted">Loading towers...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text">Define Towers</h2>
          <p className="text-muted text-sm mt-1">Add all residential towers and blocks in your society.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => append({ name: "", floorsCount: 1, flatsPerFloor: 4 })}>
          <PlusIcon className="w-4 h-4 mr-2" /> Add Tower
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start p-4 bg-background border border-border rounded-lg relative group">
              <Input 
                label="Tower Name" 
                placeholder="e.g. A, B, Block 1"
                error={errors.towers?.[index]?.name?.message} 
                {...register(`towers.${index}.name`)} 
              />
              <Input 
                type="number"
                label="Total Floors" 
                error={errors.towers?.[index]?.floorsCount?.message} 
                {...register(`towers.${index}.floorsCount`)} 
              />
              <Input 
                type="number"
                label="Flats per Floor" 
                error={errors.towers?.[index]?.flatsPerFloor?.message} 
                {...register(`towers.${index}.flatsPerFloor`)} 
              />
              
              <div className="mt-8">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-error hover:bg-error/10 px-2"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <TrashIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {errors.towers?.root && <p className="text-error text-sm">{errors.towers.root.message}</p>}

        <div className="pt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={previous} disabled={saving}>Back</Button>
          <Button type="submit" loading={saving}>Save & Continue</Button>
        </div>
      </form>
    </div>
  );
}
