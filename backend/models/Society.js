import mongoose from "mongoose";

const societySchema = new mongoose.Schema(
  {
    societyCode: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "ACTIVE", "REJECTED", "SUSPENDED", "ARCHIVED"],
      default: "SUBMITTED",
    },
    setupProgress: {
      societyProfile: { type: Boolean, default: false },
      towers: { type: Boolean, default: false },
      floors: { type: Boolean, default: false },
      flats: { type: Boolean, default: false },
      amenities: { type: Boolean, default: false },
      staff: { type: Boolean, default: false },
      completed: { type: Boolean, default: false }
    },
    totalTowers: { type: Number, default: 0 },
    totalFlats: { type: Number, default: 0 },
    // Audit fields for approval workflow
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Society", societySchema);
