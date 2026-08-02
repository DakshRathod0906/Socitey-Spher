import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["Gym", "Club House", "Swimming Pool", "Garden", "Community Hall", "Indoor Games", "Outdoor Sports", "Parking", "Other"] 
    },
    description: { type: String },
    capacity: { type: Number, default: 1 },
    openTime: { type: String, default: "06:00" },
    closeTime: { type: String, default: "22:00" },
    slotDurationMinutes: { type: Number, default: 60 },
    bookingRequired: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: false },
    maxBookingsPerResident: { type: Number },
    advanceBookingDays: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Amenity", amenitySchema);
