import * as WorkOrderService from "../services/service/WorkOrderService.js";
import { processUploadedFile } from "../services/uploadService.js";

// @desc   Admin assigns work order
// @route  POST /api/work-orders
export const assignWorkOrder = async (req, res, next) => {
  try {
    const { complaintId, assignedTo, assignedDepartment } = req.body;
    if (!complaintId || !assignedTo) {
      res.status(400);
      throw new Error("Complaint ID and Staff ID are required");
    }

    const workOrder = await WorkOrderService.assignWorkOrder({
      societyId: req.societyId,
      complaintId,
      assignedTo,
      assignedBy: req.user._id,
      assignedDepartment,
    });

    res.status(201).json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
};

// @desc   Staff lists their active work orders
// @route  GET /api/work-orders/active
export const getActiveWorkOrders = async (req, res, next) => {
  try {
    const orders = await WorkOrderService.getActiveWorkOrders(req.societyId, req.user._id);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// @desc   Staff starts work
// @route  PATCH /api/work-orders/:id/start
export const startWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrderService.startWorkOrder(req.params.id, req.user._id);
    res.json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
};

// @desc   Staff resolves work
// @route  PATCH /api/work-orders/:id/resolve
export const resolveWorkOrder = async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;
    let completionPhotos = [];

    if (req.files && req.files.length > 0) {
      completionPhotos = req.files.map(file => ({
        url: processUploadedFile(file).url,
      }));
    }

    const workOrder = await WorkOrderService.resolveWorkOrder(req.params.id, req.user._id, {
      resolutionNotes,
      completionPhotos,
    });

    res.json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin cancels work order
// @route  PATCH /api/work-orders/:id/cancel
export const cancelWorkOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const workOrder = await WorkOrderService.cancelWorkOrder(req.params.id, req.user._id, reason);
    res.json({ success: true, data: workOrder });
  } catch (err) {
    next(err);
  }
};
