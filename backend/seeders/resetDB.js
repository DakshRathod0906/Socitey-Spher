import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const resetDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log("Database dropped successfully.");

    // Seed the super admin
    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@societysphere.com",
      password: "SuperPassword123!",
      role: "super_admin",
      accountStatus: "ACTIVE",
      canLogin: true,
    });

    console.log("Super Admin created successfully:", superAdmin.email);
    console.log("Database renewal complete.");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

resetDB();
