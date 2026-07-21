import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    slotNumber: { type: String, required: true },
    slotType: { type: String, enum: ["resident", "visitor", "ev"], default: "resident" },
    isOccupied: { type: Boolean, default: false },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    status: { type: String, enum: ["AVAILABLE", "ALLOCATED", "MAINTENANCE", "DISABLED"], default: "AVAILABLE" },
    occupiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

parkingSlotSchema.index({ societyId: 1, slotNumber: 1 }, { unique: true });

export default mongoose.model("ParkingSlot", parkingSlotSchema);
