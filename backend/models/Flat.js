import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    towerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tower", required: true },
    flatNumber: { type: String, required: true },
    floor: { type: Number, required: true },
    type: { type: String, enum: ["1BHK", "2BHK", "3BHK", "4BHK", "Studio", "Other"], default: "2BHK" },
    status: { type: String, enum: ["VACANT", "OCCUPIED"], default: "VACANT" },
    isGenerated: { type: Boolean, default: true },
    maintenanceAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

flatSchema.index({ societyId: 1, towerId: 1, flatNumber: 1 }, { unique: true });

export default mongoose.model("Flat", flatSchema);
