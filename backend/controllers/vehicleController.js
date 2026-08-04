import * as vehicleService from "../services/resident/VehicleService.js";

// @desc   Add a vehicle
// @route  POST /api/vehicles
export const addVehicle = async (req, res, next) => {
  try {
    const ownerUserId = req.body.ownerUserId || req.user._id;

    if (!ownerUserId) {
      res.status(400);
      throw new Error("Owner user ID is required");
    }

    // Map user-friendly type string to backend enum if needed
    let type = req.body.type || "FOUR_WHEELER";
    const typeMap = {
      "4 Wheeler": "FOUR_WHEELER",
      "2 Wheeler": "TWO_WHEELER",
      "EV (4W)": "EV_FOUR_WHEELER",
      "EV (2W)": "EV_TWO_WHEELER",
      "Bicycle": "BICYCLE",
      "Other": "OTHER"
    };

    if (typeMap[type]) {
      type = typeMap[type];
    }

    const payload = {
      ...req.body,
      type
    };

    const vehicle = await vehicleService.addVehicle(req.societyId, ownerUserId, payload);
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
    const targetUserId = req.params.userId || (req.user.role === "resident" ? req.user._id : null);

    if (req.user.role === "resident" && targetUserId && targetUserId.toString() !== req.user._id.toString()) {
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

export const registerVehicle = addVehicle;
export const listVehicles = getVehicles;
