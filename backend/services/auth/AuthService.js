import crypto from "crypto";
import Society from "../../models/Society.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import * as invitationService from "../resident/InvitationService.js";
import * as residentService from "../resident/ResidentService.js";

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

  // MOCK SMTP EMAIL SEND
  console.log(`\n\n==========================================`);
  console.log(`[MOCK EMAIL] Verification Email Sent to: ${email}`);
  console.log(`[MOCK EMAIL] Click the link below to verify your account:`);
  console.log(`http://localhost:5173/verify-email?token=${verificationToken}`);
  console.log(`==========================================\n\n`);

  return {
    message: "Admin registered successfully. Please check your email to verify your account.",
  };
};

export const verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    const error = new Error("Invalid or expired verification token.");
    error.status = 400;
    throw error;
  }

  user.accountStatus = "ACTIVE";
  user.verificationToken = undefined;
  await user.save();

  return { message: "Email verified successfully." };
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

  const existingUser = await User.findOne({ email: invitation.email.toLowerCase() });
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email: invitation.email,
    password,
    phone,
    role: invitation.role,
    societyId: invitation.societyId,
    accountStatus: "ACTIVE",
    canLogin: true,
  });

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

  return { message: "Account created successfully. You can now log in." };
};
