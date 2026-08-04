import * as analyticsService from "../services/analyticsService.js";

// @desc   Get unified dashboard analytics payload
// @route  GET /api/analytics/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardData(req.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get complaints analytics summary
// @route  GET /api/analytics/complaints
export const getComplaintsSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getComplaintSummary(req.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get expenses analytics summary
// @route  GET /api/analytics/expenses
export const getExpensesSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getExpenseSummary(req.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get visitors analytics summary
// @route  GET /api/analytics/visitors
export const getVisitorsSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getVisitorSummary(req.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get vehicles analytics summary
// @route  GET /api/analytics/vehicles
export const getVehiclesSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getVehicleSummary(req.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get users analytics summary
// @route  GET /api/analytics/users
export const getUsersSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getUserSummary(req.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get ML pipeline status
// @route  GET /api/analytics/pipeline
export const getPipelineStatus = async (req, res, next) => {
  try {
    const dashboard = await analyticsService.getDashboardData(req.societyId);
    res.json(dashboard.pipeline);
  } catch (err) {
    next(err);
  }
};

// @desc   Trigger ML retraining via Python FastAPI microservice
// @route  POST /api/analytics/train
export const trainML = async (req, res, next) => {
  try {
    const result = await analyticsService.triggerMLTrain();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc   Get consolidated AI & ML predictions based on live MongoDB numbers
// @route  GET /api/analytics/predictions
export const getPredictions = async (req, res, next) => {
  try {
    const { category, priority } = req.query;
    const predictions = await analyticsService.getMLPredictions(req.societyId, category, priority);
    res.json(predictions);
  } catch (err) {
    next(err);
  }
};
