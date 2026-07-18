import * as flatService from "../services/society/FlatService.js";

// @desc   Add a single flat
// @route  POST /api/societies/flats
export const addFlat = async (req, res, next) => {
  try {
    const flat = await flatService.addFlat(req.societyId, req.body);
    res.status(201).json(flat);
  } catch (err) {
    next(err);
  }
};

// @desc   Auto generate flats for a tower
// @route  POST /api/societies/towers/:towerId/flats/auto-generate
export const autoGenerateFlats = async (req, res, next) => {
  try {
    const { flatsPerFloor, type, baseMaintenanceAmount } = req.body;
    const result = await flatService.autoGenerateFlats(
      req.societyId, 
      req.params.towerId, 
      flatsPerFloor, 
      type, 
      baseMaintenanceAmount
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc   List flats
// @route  GET /api/societies/flats
export const listFlats = async (req, res, next) => {
  try {
    const flats = await flatService.getFlats(req.societyId, req.query.towerId);
    res.json(flats);
  } catch (err) {
    next(err);
  }
};
