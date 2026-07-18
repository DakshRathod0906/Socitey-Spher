import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    residentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    purpose: { type: String }, // e.g. "Food Delivery", "Meeting"
    
    approvalMode: {
      type: String,
      enum: ["AUTO", "MANUAL", "NONE"],
      required: true
    },
    
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "REJECTED", "EXPIRED", "CANCELLED"],
      default: "PENDING"
    },
    
    qrTokenHash: { type: String }, // Store hashed token for security
    passCode: { type: String }, // Optional human readable code
    
    expectedArrival: { type: Date },
    validUntil: { type: Date, required: true },
    
    securityCheckInUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    securityCheckOutUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    
    gate: { type: String }, // e.g. "Main Gate", "Gate 2"

    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes
visitSchema.index({ societyId: 1, flatId: 1 });
visitSchema.index({ societyId: 1, qrTokenHash: 1 });
visitSchema.index({ societyId: 1, passCode: 1 });

export default mongoose.model("Visit", visitSchema);
