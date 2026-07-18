import WorkOrder from "../models/WorkOrder.js";
import Complaint from "../models/Complaint.js";
import Notification from "../models/Notification.js";
import { processUploadedFile } from "../services/uploadService.js";
import { SERVICE_ORDER_STATUS } from "../constants/serviceOrderStatus.js";
import { COMPLAINT_STATUS } from "../constants/complaintStatus.js";

// @desc   List work orders assigned to the logged-in service staff (or all, for admin)
// @route  GET /api/service-orders
export const listWorkOrders = async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.user.role === "service_staff") filter.assignedTo = req.user._id;

    const orders = await WorkOrder.find(filter)
      .populate({
        path: "complaintId",
        select: "title description category priority status timeline",
      })
      .populate("assignedTo", "name serviceCategory")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc   Accept work order
// @route  PUT /api/service-orders/:id/accept
export const acceptWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findOne({
      _id: req.params.id,
      societyId: req.societyId,
      assignedTo: req.user._id,
    });
    if (!workOrder) {
      res.status(404);
      throw new Error("Work order not found or not assigned to you");
    }

    workOrder.status = SERVICE_ORDER_STATUS.ACCEPTED;
    await workOrder.save();

    res.json(workOrder);
  } catch (err) {
    next(err);
  }
};

// @desc   Update work order progress
// @route  PUT /api/service-orders/:id/progress
export const updateProgress = async (req, res, next) => {
  try {
    const { note } = req.body;

    const workOrder = await WorkOrder.findOne({
      _id: req.params.id,
      societyId: req.societyId,
      assignedTo: req.user._id,
    });
    if (!workOrder) {
      res.status(404);
      throw new Error("Work order not found or not assigned to you");
    }

    if (!workOrder.startedAt && workOrder.status !== SERVICE_ORDER_STATUS.IN_PROGRESS) {
      workOrder.startedAt = new Date();
    }
    workOrder.status = SERVICE_ORDER_STATUS.IN_PROGRESS;
    if (note) workOrder.progressNotes.push({ note });
    await workOrder.save();

    const complaint = await Complaint.findById(workOrder.complaintId);
    if (complaint && complaint.status !== COMPLAINT_STATUS.IN_PROGRESS) {
      complaint.status = COMPLAINT_STATUS.IN_PROGRESS;
      complaint.timeline.push({
        status: COMPLAINT_STATUS.IN_PROGRESS,
        actor: "Service Staff"
      });
      await complaint.save();
    }

    res.json(workOrder);
  } catch (err) {
    next(err);
  }
};

// @desc   Upload completion photo
// @route  PUT /api/service-orders/:id/photo
// NOTE: This endpoint now expects multipart/form-data with field name "photo".
//       The uploadServicePhoto multer middleware must be applied in the route.
export const uploadCompletionPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Photo file is required");
    }

    const workOrder = await WorkOrder.findOne({
      _id: req.params.id,
      societyId: req.societyId,
      assignedTo: req.user._id,
    });
    if (!workOrder) {
      res.status(404);
      throw new Error("Work order not found or not assigned to you");
    }

    const fileMetadata = processUploadedFile(req.file);
    workOrder.completionPhotos.push(fileMetadata.url);
    await workOrder.save();

    res.json(workOrder);
  } catch (err) {
    next(err);
  }
};

// @desc   Mark work order (and complaint) as complete
// @route  PUT /api/service-orders/:id/complete
export const completeWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findOne({
      _id: req.params.id,
      societyId: req.societyId,
      assignedTo: req.user._id,
    });
    if (!workOrder) {
      res.status(404);
      throw new Error("Work order not found or not assigned to you");
    }

    workOrder.status = SERVICE_ORDER_STATUS.COMPLETED;
    workOrder.completedAt = new Date();
    
    if (workOrder.startedAt) {
      const diffMs = workOrder.completedAt.getTime() - workOrder.startedAt.getTime();
      workOrder.actualDuration = Math.round(diffMs / 60000); // in minutes
    }
    await workOrder.save();

    const complaint = await Complaint.findById(workOrder.complaintId);
    if (complaint) {
      complaint.status = COMPLAINT_STATUS.COMPLETED;
      complaint.resolvedAt = new Date();
      complaint.timeline.push({
        status: COMPLAINT_STATUS.COMPLETED,
        actor: "Service Staff"
      });
      await complaint.save();

      await Notification.create({
        societyId: req.societyId,
        userId: complaint.residentId,
        title: "Complaint resolved",
        message: `Your complaint "${complaint.title}" has been marked resolved. Please share your feedback.`,
        type: "complaint",
        linkId: complaint._id,
      });
    }

    res.json({ workOrder, complaint });
  } catch (err) {
    next(err);
  }
};
