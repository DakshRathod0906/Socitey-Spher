import mongoose from "mongoose";
import dotenv from "dotenv";
import Visit from "../models/Visit.js";
import User from "../models/User.js";
import * as visitorService from "../services/visitor/VisitorService.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const checkedOutVisit = await Visit.findOne({ status: "CHECKED_OUT" });
    if (checkedOutVisit) {
      console.log("Testing processCheckIn on a CHECKED_OUT Visit:", checkedOutVisit._id);
      const admin = await User.findOne({ role: "society_admin" });
      const res = await visitorService.processCheckIn(checkedOutVisit.societyId, checkedOutVisit._id.toString(), admin._id, "Main Gate");
      console.log("processCheckIn on CHECKED_OUT SUCCESS:", res.status, "checkInTime:", res.checkInTime);
    }
  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
