import * as ComplaintService from "../services/complaint/ComplaintService.js";
import { processUploadedFile } from "../services/uploadService.js";
import Complaint from "../models/Complaint.js";

// @desc   Resident creates a complaint
// @route  POST /api/complaints
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        url: processUploadedFile(file).url,
        uploadedBy: req.user._id,
      }));
    }

    const complaint = await ComplaintService.createComplaint({
      societyId: req.societyId,
      residentId: req.user._id,
      flatId: req.user.flatId,
      title,
      description,
      category,
      attachments,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   List complaints
// @route  GET /api/complaints
export const listComplaints = async (req, res, next) => {
  try {
    const { status, category, page, limit } = req.query;
    
    const result = await ComplaintService.listComplaints({
      societyId: req.societyId,
      role: req.user.role,
      userId: req.user._id,
      status,
      category,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single complaint details
// @route  GET /api/complaints/:id
export const getComplaint = async (req, res, next) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id, req.societyId);
    
    // Auth check: Resident can only view their own
    if (req.user.role === "resident" && complaint.residentId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this complaint");
    }

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   Resident cancels complaint
// @route  POST /api/complaints/:id/cancel
export const cancelComplaint = async (req, res, next) => {
  try {
    const complaint = await ComplaintService.cancelComplaint(req.params.id, req.user._id);
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin rejects complaint
// @route  POST /api/complaints/:id/reject
export const rejectComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = await ComplaintService.rejectComplaint(req.params.id, req.user._id, reason);
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   Resident requests reopen
// @route  POST /api/complaints/:id/request-reopen
export const requestReopen = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      res.status(400);
      throw new Error("Reason is required to request reopen");
    }
    const complaint = await ComplaintService.requestReopen(req.params.id, req.user._id, reason);
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin approves reopen
// @route  POST /api/complaints/:id/approve-reopen
export const approveReopen = async (req, res, next) => {
  try {
    const complaint = await ComplaintService.approveReopen(req.params.id, req.user._id);
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin rejects reopen
// @route  POST /api/complaints/:id/reject-reopen
export const rejectReopen = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const complaint = await ComplaintService.rejectReopen(req.params.id, req.user._id, reason);
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc   Resident closes complaint and leaves feedback
// @route  POST /api/complaints/:id/close
export const closeComplaint = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await ComplaintService.closeComplaint(req.params.id, req.user._id, { rating, feedback });
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};
