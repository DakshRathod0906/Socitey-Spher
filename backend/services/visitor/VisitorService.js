import Visitor from "../../models/Visitor.js";
import Visit from "../../models/Visit.js";
import User from "../../models/User.js";
import Society from "../../models/Society.js";
import Flat from "../../models/Flat.js";
import Notification from "../../models/Notification.js";
import crypto from "crypto";
import mongoose from "mongoose";
import * as NotificationService from "../notification/NotificationService.js";

const generateTokenAndHash = () => {
  const rawToken = crypto.randomUUID();
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hash };
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

import Occupancy from "../../models/Occupancy.js";

// Internal helper to validate resident and get their primary flatId if not provided
const validateResident = async (societyId, flatId, residentUserId) => {
  const resident = await User.findOne({
    _id: residentUserId,
    societyId,
    role: "resident",
    accountStatus: "ACTIVE",
    canLogin: true
  });
  if (!resident) {
    throw new Error("Resident is not authorized.");
  }

  // Check occupancy
  const occupancyQuery = { userId: residentUserId, societyId, status: "ACTIVE" };
  if (flatId) occupancyQuery.flatId = flatId;

  const occupancy = await Occupancy.findOne(occupancyQuery);
  if (!occupancy) {
    if (flatId || resident.flatId) {
      return { resident, finalFlatId: flatId || resident.flatId };
    }
    throw new Error("Resident does not have an active occupancy for this flat.");
  }

  return { resident, finalFlatId: occupancy.flatId };
};

// Internal helper to find or create visitor
const getOrCreateVisitor = async (societyId, data, createdByUserId) => {
  if (data.phone) {
    const existing = await Visitor.findOne({ societyId, name: data.name, phone: data.phone });
    if (existing) {
      // Potentially update visitorType if it's different? For now just return
      return existing;
    }
  }
  return await Visitor.create({
    societyId,
    name: data.name,
    phone: data.phone,
    visitorType: data.visitorType || "GUEST",
    createdByUserId
  });
};

export const createPreApprovedVisit = async (societyId, flatId, residentUserId, visitorData, visitData) => {
  const { finalFlatId } = await validateResident(societyId, flatId, residentUserId);

  const visitor = await getOrCreateVisitor(societyId, visitorData, residentUserId);
  const { rawToken, hash } = generateTokenAndHash();

  const visit = await Visit.create({
    societyId,
    visitorId: visitor._id,
    flatId: finalFlatId,
    residentUserId,
    purpose: visitData.purpose || "Guest Visit",
    approvalMode: "AUTO",
    status: "APPROVED",
    qrTokenHash: hash,
    passCode: Math.floor(100000 + Math.random() * 900000).toString(), // 6 digit passcode fallback
    expectedArrival: visitData.expectedArrival,
    validUntil: visitData.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
    createdByUserId: residentUserId
  });

  return { visit, rawToken, visitor };
};

export const createGateRequest = async (societyId, flatId, securityUserId, visitorData, visitData) => {
  // Ensure we are linking to a valid active resident (can be any active primary/family in flat)
  let activeResident = await User.findOne({ societyId, flatId, role: "resident", accountStatus: "ACTIVE" });
  if (!activeResident) {
    const occupancy = await Occupancy.findOne({ societyId, flatId, status: "ACTIVE" }).populate("userId");
    if (occupancy && occupancy.userId) {
      activeResident = occupancy.userId;
    }
  }
  if (!activeResident) {
    const err = new Error("No active resident found for this flat.");
    err.statusCode = 400;
    throw err;
  }

  const visitor = await getOrCreateVisitor(societyId, visitorData, securityUserId);

  const visit = await Visit.create({
    societyId,
    visitorId: visitor._id,
    flatId,
    residentUserId: activeResident._id, // Assign to the first active resident to approve
    purpose: visitData.purpose,
    approvalMode: "MANUAL",
    status: "PENDING",
    validUntil: new Date(Date.now() + 30 * 60 * 1000), // Pending expires in 30 mins
    createdByUserId: securityUserId
  });

  await NotificationService.notifyResident(
    activeResident._id,
    "Gate Request",
    `${visitor.name} is at the gate. Approve or Reject?`
  );

  return { visit, visitor };
};

export const respondToGateRequest = async (societyId, residentUserId, visitId, status) => {
  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Invalid response status");
  }

  const visit = await Visit.findOne({ _id: visitId, societyId, status: "PENDING" });
  if (!visit) {
    throw new Error("Pending visit not found or has expired");
  }

  if (new Date() > visit.validUntil) {
    visit.status = "EXPIRED";
    await visit.save();
    throw new Error("This gate request has expired.");
  }

  await validateResident(societyId, visit.flatId, residentUserId);

  visit.status = status;
  let approvalRawToken = null;
  // If approved, generate QR for check-in and extend validity
  if (status === "APPROVED") {
    const { rawToken, hash } = generateTokenAndHash();
    visit.qrTokenHash = hash;
    visit.passCode = Math.floor(100000 + Math.random() * 900000).toString();
    visit.validUntil = new Date(Date.now() + 4 * 60 * 60 * 1000);
    approvalRawToken = rawToken;
  }
  await visit.save();

  await NotificationService.notifySecurity(
    societyId,
    "Gate Response",
    `Resident has ${status} the visit for ${visitId}`
  );

  return { visit, rawToken: approvalRawToken };
};

export const cancelVisit = async (societyId, userId, visitId) => {
  const query = buildQuery(societyId, { _id: visitId });
  const visit = await Visit.findOne(query);
  if (!visit) {
    const err = new Error("Visit not found");
    err.statusCode = 404;
    throw err;
  }

  if (visit.status === "CHECKED_IN") {
    const err = new Error("Cannot cancel a checked-in visit");
    err.statusCode = 400;
    throw err;
  }

  visit.status = "CANCELLED";
  await visit.save();
  return visit;
};

const buildQuery = (societyId, baseQuery) => {
  return societyId ? { ...baseQuery, societyId } : { ...baseQuery };
};

export const verifyToken = async (societyId, qrToken) => {
  if (!qrToken) {
    const err = new Error("QR Token is required");
    err.statusCode = 400;
    throw err;
  }

  const hash = hashToken(qrToken);
  let visit = await Visit.findOne(buildQuery(societyId, { qrTokenHash: hash }))
    .populate("visitorId")
    .populate("flatId", "flatNumber towerId")
    .populate("residentUserId", "name");
  
  if (!visit) {
    visit = await Visit.findOne(buildQuery(societyId, { passCode: qrToken }))
      .populate("visitorId")
      .populate("flatId", "flatNumber towerId")
      .populate("residentUserId", "name");
  }

  if (!visit) {
    const err = new Error("Invalid or revoked QR code.");
    err.statusCode = 404;
    throw err;
  }

  // 3. Society ACTIVE
  if (societyId) {
    const society = await Society.findById(societyId);
    if (!society || society.status !== "ACTIVE") {
      const err = new Error("Society is inactive or suspended.");
      err.statusCode = 400;
      throw err;
    }
  }

  // 4. Resident ACTIVE
  const resident = await User.findById(visit.residentUserId);
  if (!resident || resident.accountStatus !== "ACTIVE") {
    const err = new Error("Resident account is inactive.");
    err.statusCode = 400;
    throw err;
  }

  // 5. Not expired
  if (new Date() > visit.validUntil) {
    if (visit.status !== "EXPIRED") {
      visit.status = "EXPIRED";
      await visit.save();
    }
    const err = new Error("This pass has expired.");
    err.statusCode = 400;
    throw err;
  }

  return visit;
};

export const processCheckIn = async (societyId, checkInKey, securityUserId, gate = "Main Gate") => {
  let visit = null;

  if (checkInKey && mongoose.Types.ObjectId.isValid(checkInKey)) {
    visit = await Visit.findOne(buildQuery(societyId, { _id: checkInKey }))
      .populate("visitorId")
      .populate("flatId", "flatNumber towerId")
      .populate("residentUserId", "name");
  }

  if (!visit && checkInKey) {
    visit = await verifyToken(societyId, checkInKey);
  }

  if (!visit) {
    const err = new Error("Visit pass not found or invalid QR/Pass code.");
    err.statusCode = 404;
    throw err;
  }

  if (visit.status === "CHECKED_IN") {
    const err = new Error("Visitor is already checked in.");
    err.statusCode = 400;
    throw err;
  }

  if (visit.status === "CHECKED_OUT") {
    const err = new Error("Visit has already been completed and checked out.");
    err.statusCode = 400;
    throw err;
  }

  if (visit.status === "PENDING") {
    const err = new Error("Visit is pending resident approval and cannot be checked in yet.");
    err.statusCode = 400;
    throw err;
  }

  if (visit.status === "EXPIRED" || (visit.validUntil && new Date() > new Date(visit.validUntil))) {
    if (visit.status !== "EXPIRED") {
      visit.status = "EXPIRED";
      await visit.save();
    }
    const err = new Error("This visit pass has expired.");
    err.statusCode = 400;
    throw err;
  }

  if (["REJECTED", "CANCELLED"].includes(visit.status)) {
    const err = new Error(`Visit cannot be checked in. Current status: ${visit.status}`);
    err.statusCode = 400;
    throw err;
  }

  visit.status = "CHECKED_IN";
  visit.checkInTime = new Date();
  visit.checkOutTime = undefined;
  visit.securityCheckInUserId = securityUserId;
  visit.gate = gate;
  await visit.save();

  try {
    const residentId = visit.residentUserId?._id || visit.residentUserId;
    const visitorName = visit.visitorId?.name || "Visitor";
    if (residentId) {
      await Notification.create({
        societyId: visit.societyId,
        userId: residentId,
        title: "Visitor Arrived",
        message: `${visitorName} has checked in at the ${gate}.`,
        type: "visitor",
        linkId: visit._id
      });
    }
  } catch (notifErr) {
    console.error("Failed to send check-in notification:", notifErr);
  }

  return visit;
};

export const processCheckOut = async (societyId, visitId, securityUserId) => {
  const visit = await Visit.findOne(buildQuery(societyId, { _id: visitId }));
  if (!visit) {
    const err = new Error("Visit not found");
    err.statusCode = 404;
    throw err;
  }

  if (visit.status !== "CHECKED_IN") {
    const err = new Error(`Cannot checkout. Current status: ${visit.status}`);
    err.statusCode = 400;
    throw err;
  }

  visit.status = "CHECKED_OUT";
  visit.checkOutTime = new Date();
  visit.securityCheckOutUserId = securityUserId;
  await visit.save();

  return visit;
};

// Reporting/Query Helpers
export const getVisits = async (societyId, filters = {}, options = {}) => {
  const query = buildQuery(societyId, filters);
  let visits = await Visit.find(query)
    .populate("visitorId")
    .populate("flatId", "flatNumber towerId")
    .populate("residentUserId", "name")
    .sort({ createdAt: -1 });

  if (options.type && options.type !== "ALL") {
    const targetType = options.type.toUpperCase();
    visits = visits.filter((v) => v.visitorId?.visitorType?.toUpperCase() === targetType);
  }

  if (options.search && options.search.trim()) {
    const term = options.search.trim().toLowerCase();
    visits = visits.filter((v) => {
      const vName = v.visitorId?.name?.toLowerCase() || "";
      const vPhone = v.visitorId?.phone || "";
      const flatNo = v.flatId?.flatNumber?.toLowerCase() || "";
      return vName.includes(term) || vPhone.includes(term) || flatNo.includes(term);
    });
  }

  return visits;
};
