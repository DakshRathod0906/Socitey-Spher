import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui";

export default function CreateAmenityModal({ isOpen, onClose, amenity, onSubmit, isSubmitting }) {
  const isEditMode = !!amenity;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    openTime: "06:00",
    closeTime: "22:00",
    capacity: 10,
    slotDurationMinutes: 60,
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name || "",
        description: amenity.description || "",
        openTime: amenity.openTime || "06:00",
        closeTime: amenity.closeTime || "22:00",
        capacity: amenity.capacity || 10,
        slotDurationMinutes: amenity.slotDurationMinutes || 60,
        isActive: amenity.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        openTime: "06:00",
        closeTime: "22:00",
        capacity: 10,
        slotDurationMinutes: 60,
        isActive: true,
      });
    }
    setError("");
  }, [amenity, isOpen]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setError("");
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (formData.capacity <= 0) {
      setError("Capacity must be greater than zero.");
      return;
    }

    if (formData.slotDurationMinutes <= 0) {
      setError("Slot duration must be greater than zero.");
      return;
    }

    const openMins = timeToMinutes(formData.openTime);
    const closeMins = timeToMinutes(formData.closeTime);

    if (openMins === closeMins) {
      setError("Open and close times cannot be identical.");
      return;
    }

    if (openMins > closeMins) {
      setError("Open time must be before close time.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Amenity" : "Create Amenity"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g. Swimming Pool"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Optional description or rules..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Open Time</label>
            <input
              type="time"
              name="openTime"
              value={formData.openTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Close Time</label>
            <input
              type="time"
              name="closeTime"
              value={formData.closeTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (Concurrent)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slot Duration (Mins)</label>
            <input
              type="number"
              name="slotDurationMinutes"
              value={formData.slotDurationMinutes}
              onChange={handleChange}
              min="15"
              step="15"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        {isEditMode && (
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (Available for booking)
            </label>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
          >
            {isSubmitting ? "Saving..." : "Save Amenity"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
