import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    name: { type: String, required: true },
    phone: { type: String }, // Optional, not unique at DB level
    email: { type: String },
    photo: { type: String },
    visitorType: {
      type: String,
      enum: ["GUEST", "DELIVERY", "CAB", "SERVICE_PROVIDER", "MAINTENANCE", "EMERGENCY", "OTHER"],
      required: true,
      default: "GUEST"
    },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Index on societyId and phone for faster reuse lookups, but not unique
visitorSchema.index({ societyId: 1, phone: 1 });

export default mongoose.model("Visitor", visitorSchema);
