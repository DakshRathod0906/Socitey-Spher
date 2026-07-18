import * as SetupService from "../services/admin/SetupService.js";
import Society from "../models/Society.js";
import Tower from "../models/Tower.js";
import Flat from "../models/Flat.js";

export const getStatus = async (req, res) => {
  try {
    const societyId = req.user.societyId || req.user.pendingSocietyId;
    if (!societyId) {
      return res.status(400).json({ message: "No society associated with user" });
    }

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    // Determine current step based on progress
    let currentStep = "complete"; // default to complete if loop finishes
    const steps = Object.keys(SetupService.STEP_DEPENDENCIES);
    
    for (let i = 0; i < steps.length; i++) {
      if (!society.setupProgress[steps[i]]) {
        currentStep = steps[i];
        break;
      }
    }

    res.status(200).json({
      currentStep,
      progress: society.setupProgress,
      completed: society.setupProgress.completed || false,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const society = await SetupService.updateProfile(societyId, req.body);
    res.status(200).json({ message: "Profile updated successfully", progress: society.setupProgress });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getTowers = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const towers = await Tower.find({ societyId }).sort({ sortOrder: 1 });
    res.status(200).json(towers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveTowers = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const { towers } = req.body; // Array of { name, floorsCount, flatsPerFloor }
    
    if (!towers || !Array.isArray(towers)) {
      return res.status(400).json({ message: "towers array is required" });
    }

    const society = await SetupService.saveTowers(societyId, towers);
    res.status(200).json({ message: "Towers saved successfully", progress: society.setupProgress });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getFlats = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const flats = await Flat.find({ societyId }).populate("towerId", "name");
    res.status(200).json(flats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateFlats = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const society = await SetupService.generateFlats(societyId);
    res.status(200).json({ message: "Flats generated successfully", progress: society.setupProgress });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const saveAmenities = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const { amenities } = req.body;
    const society = await SetupService.saveAmenities(societyId, amenities);
    res.status(200).json({ message: "Amenities saved successfully", progress: society.setupProgress });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const saveStaff = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const { staff } = req.body;
    const society = await SetupService.saveStaff(societyId, staff);
    res.status(200).json({ message: "Staff invitations sent successfully", progress: society.setupProgress });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const completeSetup = async (req, res) => {
  try {
    const societyId = req.user.pendingSocietyId || req.user.societyId;
    const society = await SetupService.activateSociety(societyId);
    res.status(200).json({ message: "Society activated successfully", society });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
