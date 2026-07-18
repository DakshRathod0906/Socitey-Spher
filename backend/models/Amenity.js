import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    name: { type: String, required: true },
    description: { type: String },
    capacity: { type: Number, default: 1 },
    openTime: { type: String, default: "06:00" },
    closeTime: { type: String, default: "22:00" },
    slotDurationMinutes: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Amenity", amenitySchema);
