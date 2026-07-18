import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const existingSuperAdmin = await User.findOne({ role: "super_admin" });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists in the database.");
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@societysphere.com",
      password: "SuperPassword123!", // Enforce strong password
      role: "super_admin",
      accountStatus: "ACTIVE",
      canLogin: true,
      // No societyId because super_admin spans across the platform
    });

    console.log("Super Admin created successfully:", superAdmin.email);
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedSuperAdmin();
