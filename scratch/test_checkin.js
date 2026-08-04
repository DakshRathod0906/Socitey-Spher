import mongoose from "mongoose";
import dotenv from "dotenv";
import Visit from "../backend/models/Visit.js";
import User from "../backend/models/User.js";
import * as visitorService from "../backend/services/visitor/VisitorService.js";

dotenv.config({ path: "../backend/.env" });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const visits = await Visit.find().limit(5);
    console.log(`Found ${visits.length} visits in DB.`);
    
    if (visits.length > 0) {
      const v = visits[0];
      console.log("Testing processCheckIn on Visit:", v._id, "status:", v.status, "societyId:", v.societyId);
      
      const admin = await User.findOne({ role: "society_admin" });
      const adminId = admin ? admin._id : v.residentUserId;

      try {
        const result = await visitorService.processCheckIn(v.societyId, v._id.toString(), adminId, "Main Gate");
        console.log("processCheckIn SUCCESS:", result);
      } catch (err) {
        console.error("processCheckIn ERROR:", err);
      }
    }
  } catch (e) {
    console.error("Script error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
