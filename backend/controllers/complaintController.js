import Complaint from "../models/Complaint.js";
import WorkOrder from "../models/WorkOrder.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { predictComplaint } from "../services/ai/predictionService.js";
import { processUploadedFile } from "../services/uploadService.js";
import { COMPLAINT_STATUS } from "../constants/complaintStatus.js";

// @desc   Resident creates a complaint
// @route  POST /api/complaints
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title || !description) {
      res.status(400);
      throw new Error("Title and description are required");
    }

    // Create the complaint first with user-provided or default values
    const complaint = await Complaint.create({
      societyId: req.societyId,
      residentId: req.user._id,
      flatId: req.user.flatId,
      title,
      description,
      category: category || "other",
      priority: priority || "medium",
      status: COMPLAINT_STATUS.CREATED,
      predictionStatus: "PENDING",
      timeline: [
        {
          status: COMPLAINT_STATUS.CREATED,
          actor: "Resident",
        }
      ]
    });

    // Call ML service asynchronously — don't block the response on failure
    try {
      const prediction = await predictComplaint(title, description);

      complaint.predictionStatus = prediction.predictionStatus;
      if (prediction.predictionStatus === "COMPLETED") {
        complaint.aiCategory = prediction.aiCategory;
        complaint.aiPriority = prediction.aiPriority;
        complaint.aiConfidence = prediction.aiConfidence;
        complaint.modelVersion = prediction.modelVersion;
        complaint.predictedAt = prediction.predictedAt;
        complaint.predictionTimeMs = prediction.predictionTimeMs;
        
        complaint.timeline.push({
          status: COMPLAINT_STATUS.AI_PREDICTED,
          actor: "System"
        });
      }
      await complaint.save();
    } catch (mlError) {
      // ML failure is non-blocking — complaint is already saved with PENDING status
      console.error(`[ML_FALLBACK] Complaint ${complaint._id} saved without prediction:`, mlError.message);
      complaint.predictionStatus = "FAILED";
      await complaint.save();
    }

    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
};

// @desc   List complaints (scoped by role)
// @route  GET /api/complaints
export const listComplaints = async (req, res, next) => {
  try {
    const filter = { societyId: req.societyId };

    if (req.user.role === "resident") filter.residentId = req.user._id;
    if (req.user.role === "service_staff") filter.assignedTo = req.user._id;

    const complaints = await Complaint.find(filter)
      .populate("residentId", "name")
      .populate("flatId", "flatNumber")
      .populate("assignedTo", "name serviceCategory")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

// @desc   Assign a complaint to service staff (creates a Work Order)
// @route  PUT /api/complaints/:id/assign
export const assignComplaint = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    if (!staffId) {
      res.status(400);
      throw new Error("Service staff must be selected");
    }

    const staff = await User.findOne({ _id: staffId, societyId: req.societyId, role: "service_staff" });
    if (!staff) {
      res.status(404);
      throw new Error("Service staff member not found in your society");
    }

    const complaint = await Complaint.findOne({ _id: req.params.id, societyId: req.societyId });
    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found");
    }

    complaint.status = COMPLAINT_STATUS.ASSIGNED;
    complaint.assignedTo = staffId;
    complaint.assignedAt = new Date();
    complaint.timeline.push({
      status: COMPLAINT_STATUS.ASSIGNED,
      actor: "Admin",
    });
    await complaint.save();

    const workOrder = await WorkOrder.create({
      societyId: req.societyId,
      complaintId: complaint._id,
      assignedTo: staffId,
    });

    await Notification.create({
      societyId: req.societyId,
      userId: staffId,
      title: "New work order assigned",
      message: `You have been assigned: ${complaint.title}`,
      type: "complaint",
      linkId: complaint._id,
    });

    await Notification.create({
      societyId: req.societyId,
      userId: complaint.residentId,
      title: "Complaint assigned",
      message: `Your complaint "${complaint.title}" has been assigned to staff.`,
      type: "complaint",
      linkId: complaint._id,
    });

    res.json({ complaint, workOrder });
  } catch (err) {
    next(err);
  }
};

// @desc   Resident submits feedback/rating after resolution
// @route  PUT /api/complaints/:id/feedback
export const submitFeedback = async (req, res, next) => {
  try {
    const { residentRating, residentFeedback } = req.body;

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      societyId: req.societyId,
      residentId: req.user._id,
    });
    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found");
    }
    if (complaint.status !== COMPLAINT_STATUS.COMPLETED) {
      res.status(400);
      throw new Error("Feedback can only be submitted after the complaint is completed");
    }

    complaint.residentRating = residentRating;
    complaint.residentFeedback = residentFeedback;
    complaint.status = COMPLAINT_STATUS.CLOSED;
    complaint.closedAt = new Date();
    complaint.timeline.push({
      status: COMPLAINT_STATUS.CLOSED,
      actor: "Resident"
    });
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

// @desc   Upload complaint attachment
// @route  POST /api/complaints/:id/attachments
export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Attachment file is required");
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      societyId: req.societyId,
      residentId: req.user._id,
    });
    if (!complaint) {
      res.status(404);
      throw new Error("Complaint not found");
    }

    const fileMetadata = processUploadedFile(req.file);
    complaint.attachments.push(fileMetadata.url);
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    next(err);
  }
};
