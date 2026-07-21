import { useState } from "react";
import { Modal } from "../../../components/ui";

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function BookingModal({ isOpen, onClose, amenity, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: ""
  });
  const [error, setError] = useState("");

  if (!amenity) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.bookingDate || !formData.startTime || !formData.endTime) {
      setError("All fields are required.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.bookingDate < today) {
      setError("Booking date cannot be in the past.");
      return;
    }

    const startMins = timeToMinutes(formData.startTime);
    const endMins = timeToMinutes(formData.endTime);
    const openMins = timeToMinutes(amenity.openTime);
    const closeMins = timeToMinutes(amenity.closeTime);

    if (startMins >= endMins) {
      setError("Start time must be before end time.");
      return;
    }

    if (startMins < openMins || endMins > closeMins) {
      setError(`Booking must be within operating hours (${amenity.openTime} - ${amenity.closeTime}).`);
      return;
    }

    // Pass only required fields matching backend contract
    onSubmit({
      amenityId: amenity._id,
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${amenity.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-md mb-4 border border-blue-100">
          <strong>Operating Hours:</strong> {amenity.openTime} - {amenity.closeTime}<br/>
          <strong>Capacity:</strong> {amenity.capacity} concurrent bookings
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

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
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming...
              </>
            ) : "Confirm Booking"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
