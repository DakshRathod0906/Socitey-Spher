import mongoose from "mongoose";

const occupancySchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    occupancyType: { type: String, enum: ["OWNER", "TENANT"], required: true },
    residentType: { type: String, enum: ["PRIMARY", "FAMILY"], required: true },
    status: { type: String, enum: ["ACTIVE", "PAST"], default: "ACTIVE" },
    moveInDate: { type: Date, required: true },
    moveOutDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

occupancySchema.index({ societyId: 1, flatId: 1, status: 1 });
occupancySchema.index({ userId: 1, status: 1 });

export default mongoose.model("Occupancy", occupancySchema);
