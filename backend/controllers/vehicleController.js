import * as vehicleService from "../services/resident/VehicleService.js";

// @desc   Add a vehicle
// @route  POST /api/vehicles
export const addVehicle = async (req, res, next) => {
  try {
    // If resident is adding for themselves, use req.user._id
    // If admin is adding, they must provide ownerUserId in body
    const ownerUserId = req.user.role === "resident" ? req.user._id : req.body.ownerUserId;

    if (!ownerUserId) {
      res.status(400);
      throw new Error("Owner user ID is required");
    }

    const vehicle = await vehicleService.addVehicle(req.societyId, ownerUserId, req.body);
    res.status(201).json({ message: "Vehicle added successfully", vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc   Get vehicles for a user
// @route  GET /api/vehicles/:userId
// Or if resident fetches their own: GET /api/vehicles
export const getVehicles = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;

    if (req.user.role === "resident" && targetUserId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only view your own vehicles");
    }

    const vehicles = await vehicleService.getVehiclesByUser(req.societyId, targetUserId);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// @desc   Update vehicle status
// @route  PATCH /api/vehicles/:id/status
export const updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vehicle = await vehicleService.updateVehicleStatus(req.societyId, req.params.id, status);
    res.json({ message: "Vehicle status updated", vehicle });
  } catch (err) {
    next(err);
  }
};
