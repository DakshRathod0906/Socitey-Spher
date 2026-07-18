import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const fixSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateOne(
      { role: "super_admin" },
      { $set: { accountStatus: "ACTIVE", canLogin: true } }
    );
    console.log("Updated super admin:", result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixSuperAdmin();
