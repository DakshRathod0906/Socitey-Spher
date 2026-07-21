import * as VehicleService from "../services/parking/VehicleService.js";
import * as ParkingSlotService from "../services/parking/ParkingSlotService.js";

export const registerVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleService.registerVehicle(req.body, req.societyId, req.user._id);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listVehicles = async (req, res) => {
  try {
    const filters = {};
    if (req.user.role === "resident") filters.ownerUserId = req.user._id;

    const vehicles = await VehicleService.listVehicles(req.societyId, filters);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSlot = async (req, res) => {
  try {
    const slot = await ParkingSlotService.createSlot(req.body, req.societyId);
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const allocateSlot = async (req, res) => {
  try {
    const slot = await ParkingSlotService.allocateSlot(
      req.params.id,
      req.body.userId,
      req.body.vehicleId,
      req.societyId
    );
    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOccupancy = async (req, res) => {
  try {
    const slot = await ParkingSlotService.updateOccupancy(
      req.params.id,
      req.body.isOccupied,
      req.societyId
    );
    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listSlots = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.user.role === "resident") {
       // Residents might only see their own slots or all available? Typically all, but let's just return all for simplicity
    }
    const slots = await ParkingSlotService.listSlots(req.societyId, filters);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
