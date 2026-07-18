import ParkingSlot from "../models/ParkingSlot.js";
import Vehicle from "../models/Vehicle.js";

// @desc   Register a resident vehicle
// @route  POST /api/parking/vehicles
export const registerVehicle = async (req, res, next) => {
  try {
    const { vehicleNumber, vehicleType } = req.body;
    if (!vehicleNumber) {
      res.status(400);
      throw new Error("Vehicle number is required");
    }

    const vehicle = await Vehicle.create({
      societyId: req.societyId,
      residentId: req.user._id,
      flatId: req.user.flatId,
      vehicleNumber,
      vehicleType,
    });

    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// @desc   List vehicles (own for resident, all for admin)
// @route  GET /api/parking/vehicles
export const listVehicles = async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "resident") filter.residentId = req.user._id;

    const vehicles = await Vehicle.find(filter).populate("flatId", "flatNumber");
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// @desc   Create a parking slot (admin config)
// @route  POST /api/parking/slots
export const createSlot = async (req, res, next) => {
  try {
    const { slotNumber, slotType } = req.body;
    if (!slotNumber) {
      res.status(400);
      throw new Error("Slot number is required");
    }

    const slot = await ParkingSlot.create({ societyId: req.societyId, slotNumber, slotType });
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
};

// @desc   List parking slots
// @route  GET /api/parking/slots
export const listSlots = async (req, res, next) => {
  try {
    const slots = await ParkingSlot.find({ societyId: req.societyId }).sort({ slotNumber: 1 });
    res.json(slots);
  } catch (err) {
    next(err);
  }
};

// @desc   Allocate a slot to a resident's vehicle
// @route  PUT /api/parking/slots/:id/allocate
export const allocateSlot = async (req, res, next) => {
  try {
    const { userId, vehicleId } = req.body;

    const slot = await ParkingSlot.findOne({ _id: req.params.id, societyId: req.societyId });
    if (!slot) {
      res.status(404);
      throw new Error("Parking slot not found");
    }
    if (slot.isOccupied) {
      res.status(400);
      throw new Error("This slot is already occupied");
    }

    slot.isOccupied = true;
    slot.allocatedTo = userId;
    slot.vehicleId = vehicleId || null;
    slot.occupiedAt = new Date();
    await slot.save();

    res.json(slot);
  } catch (err) {
    next(err);
  }
};

// @desc   Release a parking slot (e.g., visitor exit)
// @route  PUT /api/parking/slots/:id/release
export const releaseSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findOne({ _id: req.params.id, societyId: req.societyId });
    if (!slot) {
      res.status(404);
      throw new Error("Parking slot not found");
    }

    slot.isOccupied = false;
    slot.allocatedTo = null;
    slot.vehicleId = null;
    slot.occupiedAt = null;
    await slot.save();

    res.json(slot);
  } catch (err) {
    next(err);
  }
};
