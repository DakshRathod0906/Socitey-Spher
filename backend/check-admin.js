import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const checkSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ role: "super_admin" });
    console.log("Super admin in DB:", user);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkSuperAdmin();
