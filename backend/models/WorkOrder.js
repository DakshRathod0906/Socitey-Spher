import mongoose from "mongoose";
import { WORK_ORDER_STATUS } from "../constants/workOrderStatus.js";

const workOrderSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },

    // Assignment snapshot
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedDepartment: { type: String, default: "General" },

    status: {
      type: String,
      enum: Object.values(WORK_ORDER_STATUS),
      default: WORK_ORDER_STATUS.ASSIGNED,
    },

    // Progress tracking
    progressNotes: [
      {
        note: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Resolution
    resolutionNotes: { type: String, default: "" },
    completionPhotos: [
      {
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Explicit timestamps
    assignedAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Cost tracking (future)
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },

    // Soft delete
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes (per user refinement #8)
workOrderSchema.index({ complaintId: 1, status: 1 });
workOrderSchema.index({ assignedTo: 1, status: 1 });
workOrderSchema.index({ societyId: 1, createdAt: -1 });

export default mongoose.model("WorkOrder", workOrderSchema);
