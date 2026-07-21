import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MAINTENANCE", "WATER", "PARKING", "SINKING_FUND", "PENALTY", "OTHER"],
    required: true,
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
});

const billSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    occupancyId: { type: mongoose.Schema.Types.ObjectId, ref: "Occupancy", required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    billNumber: { type: String, required: true }, // e.g. BILL-SOC123-202607-001
    billingCycle: { type: Date, required: true }, // usually 1st of the month
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    
    items: [billItemSchema],
    
    subTotal: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"],
      default: "PENDING",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent generating duplicate bills for the same flat in the same billing cycle
billSchema.index({ societyId: 1, flatId: 1, billingCycle: 1 }, { unique: true });
billSchema.index({ societyId: 1, status: 1 });
billSchema.index({ societyId: 1, residentId: 1 });
billSchema.index({ societyId: 1, billingCycle: -1 });

export default mongoose.model("Bill", billSchema);
