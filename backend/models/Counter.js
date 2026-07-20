import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
  entity: { type: String, required: true }, // e.g., 'COMPLAINT'
  seq: { type: Number, default: 0 }
});

counterSchema.index({ societyId: 1, entity: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);
