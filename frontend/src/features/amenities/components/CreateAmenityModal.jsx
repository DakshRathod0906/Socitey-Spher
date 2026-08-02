import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui";

export default function CreateAmenityModal({ isOpen, onClose, amenity, onSubmit, isSubmitting }) {
  const isEditMode = !!amenity;
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    openTime: "06:00",
    closeTime: "22:00",
    capacity: 10,
    bookingRequired: false,
    slotDurationMinutes: 60,
    maxBookingsPerResident: 2,
    advanceBookingDays: 7,
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name || "",
        category: amenity.category || "",
        description: amenity.description || "",
        openTime: amenity.openTime || "06:00",
        closeTime: amenity.closeTime || "22:00",
        capacity: amenity.capacity || 10,
        bookingRequired: amenity.bookingRequired || false,
        slotDurationMinutes: amenity.slotDurationMinutes || 60,
        maxBookingsPerResident: amenity.maxBookingsPerResident || 2,
        advanceBookingDays: amenity.advanceBookingDays || 7,
        isActive: amenity.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        openTime: "06:00",
        closeTime: "22:00",
        capacity: 10,
        bookingRequired: false,
        slotDurationMinutes: 60,
        maxBookingsPerResident: 2,
        advanceBookingDays: 7,
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
    
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!formData.category) {
      setError("Category is required.");
      return;
    }

    if (formData.capacity <= 0) {
      setError("Capacity must be greater than zero.");
      return;
    }

    const openMins = timeToMinutes(formData.openTime);
    const closeMins = timeToMinutes(formData.closeTime);

    if (openMins >= closeMins) {
      setError("Open time must be before close time.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={isEditMode ? "Edit Amenity" : "Create Amenity"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              required
            >
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
            </select>
          </div>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
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

        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="bookingRequired"
            name="bookingRequired"
            checked={formData.bookingRequired}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="bookingRequired" className="ml-2 block text-sm font-medium text-slate-700">
            Booking Required
          </label>
        </div>

        {formData.bookingRequired && (
          <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Duration (Mins)</label>
              <select
                name="slotDurationMinutes"
                value={formData.slotDurationMinutes}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-blue-500 bg-white"
              >
                <option value="30">30</option>
                <option value="60">60</option>
                <option value="90">90</option>
                <option value="120">120</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max/Resident</label>
              <input
                type="number"
                name="maxBookingsPerResident"
                value={formData.maxBookingsPerResident}
                onChange={handleChange}
                min="1"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Adv. Days</label>
              <input
                type="number"
                name="advanceBookingDays"
                value={formData.advanceBookingDays}
                onChange={handleChange}
                min="1"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {isEditMode && (
          <div className="flex items-center">
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
