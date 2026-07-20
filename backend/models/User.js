import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["super_admin", "society_admin", "resident", "security", "service_staff"],
      required: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: function () {
        return this.role !== "super_admin" && this.role !== "society_admin";
      },
    },
    pendingSocietyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
    },

    accountStatus: { 
      type: String, 
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"],
      default: "ACTIVE",
    },
    verificationToken: {
      type: String,
    },
    canLogin: {
      type: Boolean,
      default: true,
    },
    phone: { type: String },
    serviceCategory: {
      type: String,
      enum: ["electrician", "plumber", "carpenter", "gardener", "housekeeping", "lift_technician", "other"],
    },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ societyId: 1, role: 1, accountStatus: 1 });

export default mongoose.model("User", userSchema);
