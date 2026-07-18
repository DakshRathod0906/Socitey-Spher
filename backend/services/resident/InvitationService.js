import Invitation from "../../models/Invitation.js";
import crypto from "crypto";
import { validateOccupancyConstraints } from "./ResidentService.js";

const generateToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const inviteResident = async (societyId, data, invitedByUserId) => {
  const { email, role, flatId, occupancyType, residentType } = data;

  // Validate constraints if it's a resident invite
  if (role === "resident") {
    await validateOccupancyConstraints(societyId, flatId, occupancyType, residentType);
  }

  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const invitation = new Invitation({
    email,
    societyId,
    flatId: role === "resident" ? flatId : undefined,
    role,
    occupancyType,
    residentType,
    token: hashedToken,
    expiresAt,
    invitedByUserId
  });

  await invitation.save();

  return { invitation, rawToken };
};

export const getInvitations = async (societyId) => {
  return await Invitation.find({ societyId, status: "PENDING" })
    .populate("flatId", "flatNumber")
    .sort({ createdAt: -1 });
};

export const revokeInvitation = async (societyId, invitationId) => {
  const invitation = await Invitation.findOne({ _id: invitationId, societyId });
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.status !== "PENDING") throw new Error("Can only revoke pending invitations");

  invitation.status = "REVOKED";
  invitation.revokedAt = new Date();
  await invitation.save();

  return invitation;
};

export const validateAndConsumeToken = async (rawToken) => {
  const hashedToken = hashToken(rawToken);
  const invitation = await Invitation.findOne({ token: hashedToken, status: "PENDING" });

  if (!invitation) {
    throw new Error("Invalid or already consumed invitation token");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "EXPIRED";
    await invitation.save();
    throw new Error("Invitation token has expired");
  }

  return invitation;
};

export const markInvitationAccepted = async (invitationId, userId) => {
  await Invitation.findByIdAndUpdate(invitationId, {
    status: "ACCEPTED",
    acceptedUserId: userId,
    acceptedAt: new Date()
  });
};
