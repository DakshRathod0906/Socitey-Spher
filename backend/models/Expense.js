import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    category: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
