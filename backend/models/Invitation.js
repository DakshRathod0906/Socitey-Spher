import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat" }, // Optional for staff
    role: { 
      type: String, 
      enum: ["super_admin", "society_admin", "resident", "security", "service_staff"],
      required: true 
    },
    occupancyType: { type: String, enum: ["OWNER", "TENANT"] },
    residentType: { type: String, enum: ["PRIMARY", "FAMILY"] },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"],
      default: "PENDING",
    },
    expiresAt: { type: Date, required: true },
    invitedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    acceptedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
// Automatically remove expired invitations after 90 days
// Assuming 90 days = 7776000 seconds
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model("Invitation", invitationSchema);
