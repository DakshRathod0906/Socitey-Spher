import * as authService from "../services/auth/AuthService.js";

// @desc   Register a new admin user
// @route  POST /api/auth/register-admin
export const registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.registerAdmin(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes("exists")) res.status(409);
    else res.status(400);
    next(err);
  }
};

// @desc   Verify email
// @route  GET /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Login for all roles
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      message: "Login successful",
      ...result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const tokens = await authService.refreshToken(token);
    res.json({
      message: "Token refreshed successfully",
      tokens
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const context = await authService.getUserContext(req.user);
    res.json(context);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a staff/resident account (Society Admin invites users)
// @route   POST /api/auth/create-user
// @access  Private (Society Admin)
export const createUser = async (req, res, next) => {
  try {
    const user = await authService.createUser(req.body, req.societyId);
    res.status(201).json({
      message: `${req.body.role} account created successfully`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const result = await authService.acceptInvitation(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes("exists")) res.status(409);
    else res.status(400);
    next(err);
  }
};
