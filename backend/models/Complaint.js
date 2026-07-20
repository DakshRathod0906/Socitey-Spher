import mongoose from "mongoose";
import { COMPLAINT_STATUS, COMPLAINT_CATEGORIES } from "../constants/complaintStatus.js";

const complaintSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },

    // Human-readable tracking number (CMP-2026-000123)
    complaintNumber: { type: String, required: true },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },

    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      default: "OTHER",
    },

    // Priority is system-assigned only (default rules or future ML)
    // Residents cannot set this
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.OPEN,
    },

    // Resident-uploaded photos at creation time
    attachments: [
      {
        url: { type: String, required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Reopen request details
    reopenReason: { type: String, default: null },

    // Post-resolution feedback (only after RESOLVED → CLOSED)
    residentRating: { type: Number, min: 1, max: 5, default: null },
    residentFeedback: { type: String, default: "" },

    // SLA tracking
    expectedResolutionAt: { type: Date, default: null },
    actualResolutionAt: { type: Date, default: null },

    // Soft delete
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },

    // ML Integration Fields (future hooks — Python analytics service)
    predictionStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "SKIPPED"],
      default: "PENDING",
    },
    aiCategory: { type: String, default: null },
    aiPriority: { type: String, default: null },
    aiConfidence: { type: Number, default: null },
    aiOverridden: { type: Boolean, default: false },
    modelVersion: { type: String, default: null },
    predictedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes (per user refinement #8)
complaintSchema.index({ societyId: 1, status: 1 });
complaintSchema.index({ societyId: 1, residentId: 1 });
complaintSchema.index({ societyId: 1, category: 1 });
complaintSchema.index({ societyId: 1, createdAt: -1 });
complaintSchema.index({ societyId: 1, complaintNumber: 1 }, { unique: true });

export default mongoose.model("Complaint", complaintSchema);
