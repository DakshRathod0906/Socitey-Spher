import mongoose from "mongoose";
import dotenv from "dotenv";
import Society from "./models/Society.js";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const resetSetup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: "daksh.ra090607@gmail.com" });
    if (user && user.societyId) {
      const society = await Society.findById(user.societyId);
      
      // Reset status to APPROVED so they can access the setup wizard
      society.status = "APPROVED";
      society.setupCompleted = false;
      
      // Optionally reset setupProgress if it exists
      if (society.setupProgress) {
        society.setupProgress = {
          societyProfile: false,
          towers: false,
          floors: false,
          flats: false,
          amenities: false,
          staff: false,
          completed: false
        };
      }
      
      await society.save();
      console.log(`Reset society '${society.name}' to APPROVED state for Setup Wizard testing`);
    } else {
      console.log("Could not find user or user has no societyId");
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetSetup();
