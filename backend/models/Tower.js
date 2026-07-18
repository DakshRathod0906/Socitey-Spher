import mongoose from "mongoose";

const towerSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    name: { type: String, required: true },
    floorsCount: { type: Number, required: true },
    flatsPerFloor: { type: Number, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

towerSchema.index({ societyId: 1, name: 1 }, { unique: true });

export default mongoose.model("Tower", towerSchema);
