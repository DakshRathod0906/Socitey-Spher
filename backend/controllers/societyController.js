import Society from "../models/Society.js";
import Tower from "../models/Tower.js";
import Flat from "../models/Flat.js";
import User from "../models/User.js";
import { generateCode } from "../utils/idGenerator.js";

// @desc   Create a new society (After admin registers)
// @route  POST /api/societies
export const createSociety = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode } = req.body;
    
    if (!name || !address || !city || !state || !pincode) {
      res.status(400);
      throw new Error("All society fields are required");
    }

    if (req.user.societyId || req.user.pendingSocietyId) {
      res.status(400);
      throw new Error("User already belongs to a society or has a pending application");
    }

    const societyCode = generateCode("SOC");

    const society = await Society.create({
      societyCode,
      name,
      address,
      city,
      state,
      pincode,
    });

    // Link the pending society to the current admin
    req.user.pendingSocietyId = society._id;
    await req.user.save();

    res.status(201).json({
      message: "Society created and pending approval",
      society
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get pending society profile
// @route  GET /api/societies/pending-application
export const getPendingSociety = async (req, res, next) => {
  try {
    if (!req.user.pendingSocietyId) {
      res.status(404);
      throw new Error("No pending application found");
    }
    const society = await Society.findById(req.user.pendingSocietyId);
    res.json(society);
  } catch (err) {
    next(err);
  }
};

// @desc   Update pending society profile (e.g. resubmit after rejection)
// @route  PUT /api/societies/pending-application
export const updatePendingSociety = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode } = req.body;
    if (!req.user.pendingSocietyId) {
      res.status(404);
      throw new Error("No pending application found");
    }
    const society = await Society.findById(req.user.pendingSocietyId);
    
    if (society.status !== "REJECTED" && society.status !== "SUBMITTED" && society.status !== "UNDER_REVIEW") {
      res.status(400);
      throw new Error("Cannot update society in this state");
    }
    
    society.name = name;
    society.address = address;
    society.city = city;
    society.state = state;
    society.pincode = pincode;
    society.status = "SUBMITTED"; // Resubmit
    await society.save();
    
    res.json(society);
  } catch (err) {
    next(err);
  }
};

// @desc   Get current society profile
// @route  GET /api/societies/me
export const getMySociety = async (req, res, next) => {
  try {
    const society = await Society.findById(req.societyId);
    if (!society) {
      res.status(404);
      throw new Error("Society not found");
    }
    res.json(society);
  } catch (err) {
    next(err);
  }
};

// @desc   Update society profile
// @route  PUT /api/societies/me
export const updateMySociety = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode } = req.body;
    const society = await Society.findByIdAndUpdate(
      req.societyId,
      { name, address, city, state, pincode },
      { new: true, runValidators: true }
    );
    res.json(society);
  } catch (err) {
    next(err);
  }
};

// @desc   List staff (security + service staff) for the society
// @route  GET /api/societies/staff
export const listStaff = async (req, res, next) => {
  try {
    const staff = await User.find({
      societyId: req.societyId,
      role: { $in: ["security", "service_staff"] },
    }).select("-password");
    res.json(staff);
  } catch (err) {
    next(err);
  }
};

// @desc   Mark society setup as completed
// @route  PUT /api/societies/complete-setup
export const completeSetup = async (req, res, next) => {
  try {
    const society = await Society.findByIdAndUpdate(
      req.societyId,
      { setupCompleted: true },
      { new: true }
    );
    res.json(society);
  } catch (err) {
    next(err);
  }
};

// --- Super Admin platform-level controls ---
import * as platformService from "../services/admin/PlatformService.js";

// @desc   List pending societies
// @route  GET /api/societies/pending
export const listPendingSocieties = async (req, res, next) => {
  try {
    const societies = await platformService.getPendingSocieties();
    res.json(societies);
  } catch (err) {
    next(err);
  }
};

// @desc   Get society by ID (Super Admin)
// @route  GET /api/societies/:id
export const getSocietyById = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id);
    if (!society) {
      res.status(404);
      throw new Error("Society not found");
    }
    res.json(society);
  } catch (err) {
    next(err);
  }
};

// @desc   Approve a society
// @route  PATCH /api/societies/:id/approve
export const approveSociety = async (req, res, next) => {
  try {
    const society = await platformService.approveSociety(req.params.id, req.user._id);
    res.json({ message: "Society approved successfully", society });
  } catch (err) {
    next(err);
  }
};

export const rejectSociety = async (req, res, next) => {
  try {
    const society = await platformService.rejectSociety(req.params.id, req.user._id, req.body.reason);
    res.json({ message: "Society rejected successfully", society });
  } catch (err) {
    next(err);
  }
};

// @desc   Suspend a society
// @route  PATCH /api/societies/:id/suspend
export const suspendSociety = async (req, res, next) => {
  try {
    const society = await platformService.suspendSociety(req.params.id);
    res.json({ message: "Society suspended successfully", society });
  } catch (err) {
    next(err);
  }
};

// @desc   Reactivate a society
// @route  PATCH /api/societies/:id/reactivate
export const reactivateSociety = async (req, res, next) => {
  try {
    const society = await platformService.reactivateSociety(req.params.id);
    res.json({ message: "Society reactivated successfully", society });
  } catch (err) {
    next(err);
  }
};
