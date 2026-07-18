import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const fixUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: "daksh.ra090607@gmail.com" });
    if (user && user.pendingSocietyId && !user.societyId) {
      user.societyId = user.pendingSocietyId;
      user.pendingSocietyId = undefined;
      await user.save();
      console.log("Fixed user: migrated pendingSocietyId to societyId");
    } else {
      console.log("No fix needed");
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixUser();
