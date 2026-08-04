import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import * as WorkOrderService from "../services/service/WorkOrderService.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/societysphere");
  console.log("Connected to Mongo");

  const complaint = await Complaint.findOne({ title: "dfv" });
  console.log("Found complaint:", complaint?._id, "Status:", complaint?.status, "Society:", complaint?.societyId);

  const staff = await User.findOne({ name: /rajkumar/i });
  console.log("Found staff:", staff?._id, "Name:", staff?.name);

  const admin = await User.findOne({ role: "society_admin" });
  console.log("Found admin:", admin?._id, "Society:", admin?.societyId);

  try {
    const wo = await WorkOrderService.assignWorkOrder({
      societyId: admin?.societyId,
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
