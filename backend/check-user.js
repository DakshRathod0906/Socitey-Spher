import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Society from "./models/Society.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email: "daksh.ra090607@gmail.com" });
    console.log("User:", {
      role: user.role,
      societyId: user.societyId,
      pendingSocietyId: user.pendingSocietyId
    });

    if (user.societyId) {
      const society = await Society.findById(user.societyId);
      console.log("Society:", {
        status: society.status,
        name: society.name
      });
    } else if (user.pendingSocietyId) {
      const society = await Society.findById(user.pendingSocietyId);
      console.log("Pending Society:", {
        status: society.status,
        name: society.name
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUser();
