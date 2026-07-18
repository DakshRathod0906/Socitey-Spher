import * as towerService from "../services/society/TowerService.js";

// @desc   Add a tower
// @route  POST /api/societies/towers
export const addTower = async (req, res, next) => {
  try {
    const tower = await towerService.createTower(req.societyId, req.body);
    res.status(201).json(tower);
  } catch (err) {
    next(err);
  }
};

// @desc   Edit a tower
// @route  PUT /api/societies/towers/:id
export const editTower = async (req, res, next) => {
  try {
    const tower = await towerService.editTower(req.societyId, req.params.id, req.body);
    res.json(tower);
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a tower
// @route  DELETE /api/societies/towers/:id
export const deleteTower = async (req, res, next) => {
  try {
    const result = await towerService.deleteTower(req.societyId, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc   List towers
// @route  GET /api/societies/towers
export const listTowers = async (req, res, next) => {
  try {
    const towers = await towerService.getTowers(req.societyId);
    res.json(towers);
  } catch (err) {
    next(err);
  }
};
