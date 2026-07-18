import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { inviteResident } from "./services/resident/InvitationService.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const testInvite = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await User.findOne({ email: "daksh.ra090607@gmail.com" });
    if (!admin) {
      console.log("Admin not found");
      process.exit(1);
    }
    const societyId = admin.societyId;
    
    // We need a flatId. Let's find one.
    const Flat = (await import("./models/Flat.js")).default;
    const flat = await Flat.findOne({ societyId });
    if (!flat) {
      console.log("No flat found");
      process.exit(1);
    }

    console.log("Calling inviteResident...");
    const result = await inviteResident(
      societyId, 
      {
        email: "test_resident@example.com",
        role: "resident",
        flatId: flat._id.toString(),
        occupancyType: "OWNER",
        residentType: "PRIMARY"
      },
      admin._id
    );

    console.log("Success:", result);
    process.exit(0);
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
};

testInvite();
