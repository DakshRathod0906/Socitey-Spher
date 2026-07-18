import * as invitationService from "../services/resident/InvitationService.js";
import Invitation from "../models/Invitation.js";

// @desc   Create invitation
// @route  POST /api/invitations
export const createInvitation = async (req, res, next) => {
  try {
    const { email, flatId, role, occupancyType } = req.body;
    const invitation = await invitationService.inviteUser(req.societyId, flatId, email, role, req.user._id, occupancyType);
    res.status(201).json({ message: "Invitation created successfully", invitation });
  } catch (err) {
    next(err);
  }
};

// @desc   Get invitations
// @route  GET /api/invitations
export const getInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({ societyId: req.societyId }).sort({ createdAt: -1 });
    res.json(invitations);
  } catch (err) {
    next(err);
  }
};

// @desc   Resend invitation
// @route  POST /api/invitations/:id/resend
export const resendInvitation = async (req, res, next) => {
  try {
    const invitation = await invitationService.resendInvitation(req.societyId, req.params.id, req.user._id);
    res.json({ message: "Invitation resent successfully", invitation });
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel invitation
// @route  POST /api/invitations/:id/cancel
export const cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await invitationService.cancelInvitation(req.societyId, req.params.id);
    res.json({ message: "Invitation cancelled successfully", invitation });
  } catch (err) {
    next(err);
  }
};

// @desc   Validate token (Public)
// @route  GET /api/invitations/validate/:token
export const validateToken = async (req, res, next) => {
  try {
    const invitation = await invitationService.validateToken(req.params.token);
    res.json({ message: "Token is valid", email: invitation.email, role: invitation.role, flatId: invitation.flatId });
  } catch (err) {
    next(err);
  }
};

// @desc   Accept invitation (Public)
// @route  POST /api/invitations/accept
export const acceptInvitation = async (req, res, next) => {
  try {
    const { token, password, name, phone } = req.body;
    const user = await invitationService.acceptInvitation(token, password, name, phone);
    res.status(201).json({ message: "Account created successfully. You can now log in.", userId: user._id });
  } catch (err) {
    next(err);
  }
};
