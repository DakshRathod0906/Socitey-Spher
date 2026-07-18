import mongoose from "mongoose";
import { SERVICE_ORDER_STATUS } from "../constants/serviceOrderStatus.js";

const workOrderSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(SERVICE_ORDER_STATUS),
      default: SERVICE_ORDER_STATUS.ASSIGNED,
    },
    progressNotes: [{ note: String, updatedAt: { type: Date, default: Date.now } }],
    completionPhotos: [{ type: String }], // base64 or URLs
    
    // Analytics & Metrics
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    estimatedDuration: { type: Number, default: null }, // in minutes
    actualDuration: { type: Number, default: null }, // in minutes
  },
  { timestamps: true }
);

export default mongoose.model("WorkOrder", workOrderSchema);
