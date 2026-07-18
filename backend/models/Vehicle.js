import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["TWO_WHEELER", "FOUR_WHEELER", "BICYCLE", "EV_TWO_WHEELER", "EV_FOUR_WHEELER", "OTHER"],
      required: true 
    },
    licensePlate: { type: String, required: true },
    normalizedLicensePlate: { type: String, required: true },
    makeModel: { type: String },
    color: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Enforce unique normalized license plate within a society
vehicleSchema.index({ societyId: 1, normalizedLicensePlate: 1 }, { unique: true });

export default mongoose.model("Vehicle", vehicleSchema);
