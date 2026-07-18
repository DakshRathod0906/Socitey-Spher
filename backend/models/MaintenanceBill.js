import mongoose from "mongoose";

const maintenanceBillSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    billMonth: { type: Number, required: true }, // 1-12
    billYear: { type: Number, required: true },
    amount: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["unpaid", "paid", "overdue"], default: "unpaid" },
    paidAt: { type: Date, default: null },
    paymentMode: { type: String, enum: ["cash", "online", "upi", "card", "bank_transfer"], default: null },
    receiptNumber: { type: String, default: null },
  },
  { timestamps: true }
);

maintenanceBillSchema.index({ flatId: 1, billMonth: 1, billYear: 1 }, { unique: true });

export default mongoose.model("MaintenanceBill", maintenanceBillSchema);
