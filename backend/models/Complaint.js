import mongoose from "mongoose";
import { COMPLAINT_STATUS } from "../constants/complaintStatus.js";

const complaintSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["electrical", "plumbing", "carpentry", "cleaning", "lift", "security", "parking", "other"],
      default: "other",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.CREATED,
    },
    
    // Timeline event history
    timeline: [
      {
        status: { type: String, enum: Object.values(COMPLAINT_STATUS) },
        timestamp: { type: Date, default: Date.now },
        actor: { type: String }, // "Resident", "System", "Admin", "Service Staff"
      }
    ],

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    
    // Analytics & Metrics
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    
    residentRating: { type: Number, min: 1, max: 5, default: null },
    residentFeedback: { type: String, default: "" },

    // Resource specific attachments
    attachments: [{ type: String }],

    // ML Integration Fields
    predictionStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    aiCategory: { type: String, default: null },
    aiPriority: { type: String, default: null },
    aiConfidence: { type: Number, default: null },
    aiOverridden: { type: Boolean, default: false },
    modelVersion: { type: String, default: null },
    predictedAt: { type: Date, default: null },
    predictionTimeMs: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
