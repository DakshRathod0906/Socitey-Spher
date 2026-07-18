import mongoose from "mongoose";
import { NOTICE_PRIORITY } from "../constants/noticePriority.js";

const noticeSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    
    priority: { 
      type: String, 
      enum: Object.values(NOTICE_PRIORITY),
      default: NOTICE_PRIORITY.LOW 
    },
    category: { type: String, default: "General" },
    audience: [{ type: String, enum: ["owner", "tenant", "service_staff", "all"], default: ["all"] }],
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null },
    pinUntil: { type: Date, default: null },
    
    attachmentUrl: { type: String, default: null },
    attachments: [{ type: String }], // Future proof multiple
  },
  { timestamps: true }
);

export default mongoose.model("Notice", noticeSchema);
