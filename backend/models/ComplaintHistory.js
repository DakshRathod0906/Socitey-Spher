import mongoose from "mongoose";
import { COMPLAINT_ACTIONS } from "../constants/complaintStatus.js";

const complaintHistorySchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    action: {
      type: String,
      enum: Object.values(COMPLAINT_ACTIONS),
      required: true,
    },
    previousStatus: { type: String, default: null },
    newStatus: { type: String, default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    performedRole: { type: String, required: true }, // "resident", "society_admin", "service_staff", "system"
    remarks: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Flexible payload for future needs
  },
  { timestamps: true } // createdAt serves as event timestamp
);

// Indexes (per user refinement #8)
complaintHistorySchema.index({ complaintId: 1, createdAt: 1 });

export default mongoose.model("ComplaintHistory", complaintHistorySchema);
