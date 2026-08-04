import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

import Complaint from "./backend/models/Complaint.js";
import User from "./backend/models/User.js";
import * as WorkOrderService from "./backend/services/service/WorkOrderService.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/societysphere");
  console.log("Connected to Mongo");

  const complaint = await Complaint.findOne({});
  console.log("Found complaint:", complaint?._id, "Status:", complaint?.status, "Society:", complaint?.societyId);

  const staff = await User.findOne({ role: { $in: ["service_staff", "security", "society_admin"] } });
  console.log("Found staff:", staff?._id, "Name:", staff?.name);

  const admin = await User.findOne({ role: "society_admin" }) || staff;

  try {
    const wo = await WorkOrderService.assignWorkOrder({
      societyId: complaint?.societyId || admin?.societyId,
      complaintId: complaint._id,
      assignedTo: staff._id,
      assignedBy: admin._id,
      assignedDepartment: "CLEANING"
    });
    console.log("SUCCESS! Work order created:", wo._id);
  } catch (err) {
    console.error("ERROR in assignWorkOrder:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
