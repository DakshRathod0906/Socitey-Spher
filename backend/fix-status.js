import mongoose from "mongoose";
import dotenv from "dotenv";
import Society from "./models/Society.js";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const fixStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Fix Society statuses
    const result = await Society.updateMany(
      { status: "PENDING" },
      { $set: { status: "SUBMITTED" } }
    );
    console.log(`Updated ${result.modifiedCount} societies from PENDING to SUBMITTED`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixStatus();
