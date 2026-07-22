import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    towerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tower", required: true },
    flatNumber: { type: String, required: true },
    floor: { type: Number, required: true },
    flatType: { type: String, enum: ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "Studio", "Other"], default: "2BHK" },
    wing: { type: String },
    carpetArea: { type: Number },
    superBuiltUpArea: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    balconies: { type: Number },
    parkingSlots: { type: Number, default: 1 },
    occupancyType: { type: String, enum: ["OWNER", "TENANT", "VACANT"], default: "VACANT" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["VACANT", "OCCUPIED"], default: "VACANT" },
    isGenerated: { type: Boolean, default: true },
    maintenanceAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

flatSchema.index({ societyId: 1, towerId: 1, flatNumber: 1 }, { unique: true });

export default mongoose.model("Flat", flatSchema);
