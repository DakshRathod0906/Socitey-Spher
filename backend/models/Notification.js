import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["visitor", "complaint", "billing", "notice", "booking", "general"],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    linkId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
