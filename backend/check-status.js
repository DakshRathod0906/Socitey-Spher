import mongoose from "mongoose";
import dotenv from "dotenv";
import Society from "./models/Society.js";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const checkStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "daksh.ra090607@gmail.com" });
    if (!user) return console.log("User not found");
    const societyId = user.societyId || user.pendingSocietyId;
    const society = await Society.findById(societyId);
    console.log("Society Status:", society.status);
    console.log("Setup Progress:", JSON.stringify(society.setupProgress, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkStatus();
