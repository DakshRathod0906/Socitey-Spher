import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    
    receiptNumber: { type: String, required: true }, // e.g., RCPT-SOC123-202607-000001
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CHEQUE", "UPI", "BANK_TRANSFER", "ONLINE"],
      required: true,
    },
    referenceNumber: { type: String, default: null }, // Transaction ID, Cheque Number
    paymentDate: { type: Date, required: true },
    paymentProofUrl: { type: String, default: null }, // S3/Cloudinary link
    
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "SUCCESS",
    },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin who recorded offline
  },
  { timestamps: true }
);

paymentSchema.index({ societyId: 1, billId: 1 });
paymentSchema.index({ societyId: 1, paymentDate: -1 });
paymentSchema.index({ receiptNumber: 1 });

export default mongoose.model("Payment", paymentSchema);
