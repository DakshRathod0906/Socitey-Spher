import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Checkbox } from "../../../components/ui";
import api from "../../../services/api";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "lucide-react";

const amenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  capacity: z.coerce.number().min(1, "Minimum capacity is 1"),
  openTime: z.string().min(1, "Open time is required"),
  closeTime: z.string().min(1, "Close time is required"),
  bookingRequired: z.boolean().default(false),
  slotDurationMinutes: z.coerce.number().optional(),
  maxBookingsPerResident: z.coerce.number().optional(),
  advanceBookingDays: z.coerce.number().optional(),
});

export default function AmenityStep({ save, saving, previous }) {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(amenitySchema),
    defaultValues: { 
      capacity: 1, 
      openTime: "06:00", 
      closeTime: "22:00", 
      bookingRequired: false,
      slotDurationMinutes: 60,
      maxBookingsPerResident: 2,
      advanceBookingDays: 7
    }
  });

  const bookingRequired = watch("bookingRequired");

  const fetchAmenities = async () => {
    try {
      const res = await api.get("/amenities");
      if (res.data.success) {
        setAmenities(res.data.data.filter(a => a.isActive));
      } else {
        setAmenities(res.data.filter(a => a.isActive));
      }
    } catch (error) {
      toast.error("Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const onAddAmenity = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post("/amenities", data);
      toast.success("Amenity added");
      reset(); 
      fetchAmenities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add amenity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAmenity = async (id) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return;
    try {
      await api.delete(`/amenities/${id}`);
      toast.success("Amenity deleted");
      fetchAmenities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete amenity");
    }
  };

  const handleNext = () => {
    save((payload) => api.post("/setup/amenities", payload).then(r => r.data), { amenities: [] });
  };

  if (loading) return <div className="text-center py-10 text-muted">Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text">Amenities Configuration</h2>
        <p className="text-muted text-sm mt-1">Configure the facilities available in your society.</p>
      </div>

      <div className="bg-background border border-border rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-text mb-4">Add New Amenity</h3>
        <form onSubmit={handleSubmit(onAddAmenity)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <Input label="Name" placeholder="e.g. Main Pool" error={errors.name?.message} {...register("name")} />
            <Select label="Category" error={errors.category?.message} {...register("category")}>
              <option value="">Select Category</option>
              <option value="Gym">Gym</option>
              <option value="Club House">Club House</option>
              <option value="Swimming Pool">Swimming Pool</option>
              <option value="Garden">Garden</option>
              <option value="Community Hall">Community Hall</option>
              <option value="Indoor Games">Indoor Games</option>
              <option value="Outdoor Sports">Outdoor Sports</option>
              <option value="Parking">Parking</option>
              <option value="Other">Other</option>
            </Select>
            <Input type="number" label="Capacity" error={errors.capacity?.message} {...register("capacity")} />
            <Input type="time" label="Opening Time" error={errors.openTime?.message} {...register("openTime")} />
            <Input type="time" label="Closing Time" error={errors.closeTime?.message} {...register("closeTime")} />
          </div>
          
          <div className="pt-2">
            <Checkbox 
              label="Booking Required" 
              checked={bookingRequired}
              onChange={(e) => setValue("bookingRequired", e.target.checked)}
            />
          </div>

          {bookingRequired && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-2 bg-primary/5 p-3 rounded-lg border border-primary/20 mt-4">
              <Select label="Slot Duration" error={errors.slotDurationMinutes?.message} {...register("slotDurationMinutes")}>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
                <option value="120">120 Minutes</option>
              </Select>
              <Input type="number" label="Max Bookings Per Resident" error={errors.maxBookingsPerResident?.message} {...register("maxBookingsPerResident")} />
              <Input type="number" label="Advance Booking Days" error={errors.advanceBookingDays?.message} {...register("advanceBookingDays")} />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting}>
              <PlusIcon className="w-4 h-4 mr-2" /> Add Amenity
            </Button>
          </div>
        </form>
      </div>

      {amenities.length > 0 && (
        <div className="bg-background border border-border rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-muted text-sm">
                <th className="p-3 font-medium">Amenity Name</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Capacity</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((amenity) => (
                <tr key={amenity._id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="p-3 font-medium text-text">{amenity.name}</td>
                  <td className="p-3 text-muted">{amenity.category}</td>
                  <td className="p-3 text-muted">{amenity.capacity}</td>
                  <td className="p-3 text-muted">{amenity.isActive ? "Active" : "Inactive"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" className="text-error px-2" onClick={() => deleteAmenity(amenity._id)}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-6 flex justify-between">
        <Button variant="outline" onClick={previous} disabled={saving}>Back</Button>
        <Button onClick={handleNext} loading={saving}>Save & Continue</Button>
      </div>
    </div>
  );
}
