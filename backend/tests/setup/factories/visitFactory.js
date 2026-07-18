import { randomUUID } from "crypto";
import Visitor from "../../../models/Visitor.js";
import Visit from "../../../models/Visit.js";

export const createVisitor = async (societyId, overrides = {}) => {
  return await Visitor.create({
    societyId,
    name: "Test Visitor",
    phone: `+9199999${Math.floor(10000 + Math.random() * 90000)}`,
    visitorType: "GUEST",
    ...overrides
  });
};

export const createVisit = async (societyId, visitorId, flatId, residentUserId, overrides = {}) => {
  return await Visit.create({
    societyId,
    visitorId,
    flatId,
    residentUserId,
    status: "PENDING",
    approvalMode: "MANUAL",
    qrToken: randomUUID(),
    expectedArrival: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    ...overrides
  });
};

// Convenient wrappers
export const createApprovedVisit = async (societyId, visitorId, flatId, residentUserId, overrides = {}) => {
  return await createVisit(societyId, visitorId, flatId, residentUserId, {
    status: "APPROVED",
    ...overrides
  });
};

export const createCheckedInVisit = async (societyId, visitorId, flatId, residentUserId, overrides = {}) => {
  return await createVisit(societyId, visitorId, flatId, residentUserId, {
    status: "CHECKED_IN",
    checkInTime: new Date(),
    ...overrides
  });
};
