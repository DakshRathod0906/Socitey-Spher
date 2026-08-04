import * as ParkingSlotService from "../services/parking/ParkingSlotService.js";

export const createSlot = async (req, res) => {
  try {
    const { slotNumber, slotType } = req.body;
    const slot = await ParkingSlotService.createSlot({
      societyId: req.societyId,
      slotNumber,
      slotType,
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const allocateSlot = async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    const slot = await ParkingSlotService.allocateSlot(
      req.params.id,
      userId,
      vehicleId,
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

export const unassignSlot = async (req, res) => {
  try {
    const slot = await ParkingSlotService.unassignSlot(req.params.id, req.societyId);
    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const result = await ParkingSlotService.deleteSlot(req.params.id, req.societyId);
    res.json(result);
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
