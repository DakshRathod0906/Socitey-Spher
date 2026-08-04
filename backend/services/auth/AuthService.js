import crypto from "crypto";
import bcrypt from "bcryptjs";
import Society from "../../models/Society.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import * as invitationService from "../resident/InvitationService.js";
import * as residentService from "../resident/ResidentService.js";
import { sendEmail } from "../../utils/emailService.js";

// Helper to generate tokens
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    societyId: user.societyId || null,
    pendingSocietyId: user.pendingSocietyId || null,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", // Short lived
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};

export const registerAdmin = async (data) => {
  const { name, email, password, phone } = data;

  if (!name || !email || !password || !phone) {
    throw new Error("All fields are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  // Generate a mock verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: "society_admin",
    accountStatus: "PENDING_VERIFICATION",
    verificationToken,
    canLogin: true,
  });

  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your SocietySphere Admin Account",
    text: `Click the link below to verify your account:\n${verificationUrl}`,
    html: `
      <h2>Welcome to SocietySphere!</h2>
      <p>Please click the link below to verify your admin account:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
  });

  return {
    message: "Admin registered successfully. Please check your email to verify your account.",
  };
};

export const verifyEmail = async (token) => {
  if (!token) {
    const error = new Error("Verification token is required.");
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    const error = new Error("Invalid or expired verification token.");
    error.status = 400;
    throw error;
  }

  if (user.accountStatus !== "ACTIVE") {
    user.accountStatus = "ACTIVE";
    await user.save();
  }

  return { message: "Email verified successfully. You can now log in!" };
};

export const resendVerificationEmail = async (email) => {
  if (!email) {
    throw new Error("Email address is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (user.accountStatus === "ACTIVE") {
    return { message: "Your email is already verified. You can log in directly." };
  }

  if (!user.verificationToken) {
    user.verificationToken = crypto.randomBytes(32).toString("hex");
    await user.save();
  }

  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${user.verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your SocietySphere Account",
    text: `Click the link below to verify your account:\n${verificationUrl}`,
    html: `
      <h2>Welcome to SocietySphere!</h2>
      <p>Please click the link below to verify your account:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  });

  return { message: "Verification link sent! Please check your email inbox." };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (user.accountStatus === "PENDING_VERIFICATION") {
    const error = new Error("Please verify your email address before logging in.");
    error.status = 403;
    throw error;
  }

  if (user.accountStatus !== "ACTIVE") {
    const error = new Error(`This account is currently ${user.accountStatus.toLowerCase()}`);
    error.status = 403;
    throw error;
  }

  if (!user.canLogin) {
    const error = new Error("This account does not have login permissions");
    error.status = 403;
    throw error;
  }

  if (user.societyId) {
    const society = await Society.findById(user.societyId);
    if (society) {
      if (society.status !== "ACTIVE" && society.status !== "APPROVED") {
        const error = new Error(`Your society is currently ${society.status.toLowerCase()}.`);
        error.status = 403;
        throw error;
      }
    }
  }

  const tokens = generateTokens(user);
  const context = await getUserContext(user);

  return {
    tokens,
    ...context
  };
};

export const getUserContext = async (user) => {
  let tenant = {
    status: "DRAFT",
    setupProgress: {},
    societyId: null,
    pendingSocietyId: null,
  };

  if (user.societyId || user.pendingSocietyId) {
    const societyId = user.societyId || user.pendingSocietyId;
    const society = await Society.findById(societyId).select("status setupProgress _id");
    
    if (society) {
      tenant = {
        status: society.status,
        setupProgress: society.setupProgress || {},
        societyId: user.societyId ? society._id : null,
        pendingSocietyId: user.pendingSocietyId ? society._id : null,
      };
    }
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      societyId: user.societyId,
      pendingSocietyId: user.pendingSocietyId,
    },
    tenant,
  };
};

export const refreshToken = async (token) => {
  if (!token) {
    throw new Error("Refresh token required");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.accountStatus !== "ACTIVE") {
      throw new Error("User not found or inactive");
    }

    const tokens = generateTokens(user);
    return tokens;
  } catch (err) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }
};

export const createUser = async (data, requestSocietyId) => {
  const { name, email, password, role, phone, flatId, serviceCategory } = data;

  if (!["resident", "security", "service_staff"].includes(role)) {
    throw new Error("Invalid role for user creation");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password: password || "Welcome@123",
    role,
    phone,
    flatId: role === "resident" ? flatId : undefined,
    serviceCategory: role === "service_staff" ? serviceCategory : undefined,
    societyId: requestSocietyId,
    accountStatus: "ACTIVE",
    canLogin: true,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const acceptInvitation = async (data) => {
  const { token, name, password, phone } = data;

  const invitation = await invitationService.validateAndConsumeToken(token);

  let user = await User.findOne({ email: invitation.email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name,
      email: invitation.email,
      password,
      phone,
      role: invitation.role,
      societyId: invitation.societyId,
      accountStatus: "ACTIVE",
      canLogin: true,
    });
  } else {
    // If user already exists, update phone/name if provided and link societyId if missing
    if (phone && !user.phone) user.phone = phone;
    if (!user.societyId) user.societyId = invitation.societyId;
    await user.save();
  }

  if (invitation.role === "resident" && invitation.flatId) {
    await residentService.createOccupancy(
      invitation.societyId,
      invitation.flatId,
      user._id,
      invitation.occupancyType,
      invitation.residentType
    );
  }

  await invitationService.markInvitationAccepted(invitation._id, user._id);

  return { message: "Invitation accepted successfully", userId: user._id };
};

export const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const { name, phone, email, currentPassword, newPassword } = data;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing._id.toString() !== userId.toString()) {
      throw new Error("Email address is already in use");
    }
    user.email = email.toLowerCase();
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new Error("Current password is required to set a new password");
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Current password is incorrect");
      error.status = 400;
      throw error;
    }
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    user.password = newPassword;
  }

  await user.save();
  return {
    message: "Profile updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

export const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Email address is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return { message: "If an account with that email exists, a password reset link has been sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request - SocietySphere",
    text: `You requested a password reset. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`,
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Click the button or link below to choose a new password:</p>
      <p><a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>Or copy this link into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link is valid for 1 hour.</p>
    `,
  });

  return { message: "If an account with that email exists, a password reset link has been sent." };
};

export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new Error("Token and new password are required");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Invalid or expired password reset token");
    error.status = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: "Password reset successful. You can now log in with your new password." };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.status = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};
