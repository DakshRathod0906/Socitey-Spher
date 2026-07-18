import Visitor from "../../models/Visitor.js";
import Visit from "../../models/Visit.js";
import User from "../../models/User.js";
import Society from "../../models/Society.js";
import crypto from "crypto";
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
  const activeResident = await User.findOne({ societyId, flatId, role: "resident", accountStatus: "ACTIVE" });
  if (!activeResident) {
    throw new Error("No active resident found for this flat.");
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

export const cancelVisit = async (societyId, residentUserId, visitId) => {
  const visit = await Visit.findOne({ _id: visitId, societyId, residentUserId });
  if (!visit) {
    throw new Error("Visit not found");
  }

  if (visit.status === "CHECKED_IN") {
    throw new Error("Cannot cancel a visit that is already checked in.");
  }

  visit.status = "CANCELLED";
  await visit.save();
  return visit;
};

export const verifyToken = async (societyId, qrToken) => {
  if (!qrToken) throw new Error("QR Token is required");

  const hash = hashToken(qrToken);
  let visit = await Visit.findOne({ societyId, qrTokenHash: hash })
    .populate("visitorId")
    .populate("flatId", "flatNumber towerId")
    .populate("residentUserId", "name");
  
  if (!visit) {
    visit = await Visit.findOne({ societyId, passCode: qrToken })
      .populate("visitorId")
      .populate("flatId", "flatNumber towerId")
      .populate("residentUserId", "name");
  }

  if (!visit) {
    throw new Error("Invalid or revoked QR code.");
  }

  // 3. Society ACTIVE
  const society = await Society.findById(societyId);
  if (!society || society.status !== "ACTIVE") {
    throw new Error("Society is inactive or suspended.");
  }

  // 4. Resident ACTIVE
  const resident = await User.findById(visit.residentUserId);
  if (!resident || resident.accountStatus !== "ACTIVE") {
    throw new Error("Resident account is inactive.");
  }

  // 5. Not expired
  if (new Date() > visit.validUntil) {
    if (visit.status !== "EXPIRED") {
      visit.status = "EXPIRED";
      await visit.save();
    }
    throw new Error("This pass has expired.");
  }

  return visit;
};

export const processCheckIn = async (societyId, qrToken, securityUserId, gate = "Main Gate") => {
  const visit = await verifyToken(societyId, qrToken);

  // 5. Status APPROVED
  if (visit.status !== "APPROVED") {
    throw new Error(`Visit cannot be checked in. Current status: ${visit.status}`);
  }

  // 7. Not checked in (redundant with #5, but explicit)
  if (visit.checkInTime) {
    throw new Error("Already checked in.");
  }

  // 8. Check in
  visit.status = "CHECKED_IN";
  visit.checkInTime = new Date();
  visit.securityCheckInUserId = securityUserId;
  visit.gate = gate; // Assuming we add this to schema
  await visit.save();

  await NotificationService.notifyResident(
    visit.residentUserId._id || visit.residentUserId,
    "Visitor Arrived",
    `${visit.visitorId.name} has checked in at the ${gate}.`
  );

  return visit;
};

export const processCheckOut = async (societyId, visitId, securityUserId) => {
  const visit = await Visit.findOne({ _id: visitId, societyId });
  if (!visit) {
    throw new Error("Visit not found");
  }

  if (visit.status !== "CHECKED_IN") {
    throw new Error(`Cannot checkout. Current status: ${visit.status}`);
  }

  visit.status = "CHECKED_OUT";
  visit.checkOutTime = new Date();
  visit.securityCheckOutUserId = securityUserId;
  await visit.save();

  return visit;
};

// Reporting/Query Helpers
export const getVisits = async (societyId, filters = {}) => {
  // Can filter by residentUserId, flatId, status, etc.
  return await Visit.find({ societyId, ...filters })
    .populate("visitorId")
    .populate("flatId", "flatNumber towerId")
    .populate("residentUserId", "name")
    .sort({ createdAt: -1 });
};
