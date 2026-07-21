import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["MAINTENANCE", "UTILITIES", "SALARY", "SECURITY", "EVENT", "ADMINISTRATION", "REPAIR", "OTHER"],
      required: true,
    },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, required: true },
    vendorName: { type: String, default: null },
    receiptUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ societyId: 1, expenseDate: -1 });
expenseSchema.index({ societyId: 1, category: 1 });

export default mongoose.model("Expense", expenseSchema);
