import * as invitationService from "../services/resident/InvitationService.js";
import * as residentService from "../services/resident/ResidentService.js";
import { sendEmail } from "../utils/emailService.js";

// @desc   Invite a resident (or staff)
// @route  POST /api/residents/invite
export const inviteResident = async (req, res, next) => {
  try {
    const { invitation, rawToken } = await invitationService.inviteResident(
      req.societyId,
      req.body,
      req.user._id
    );

    const joinUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/accept-invite?token=${rawToken}`;

    await sendEmail({
      to: invitation.email,
      subject: `Invitation to join SocietySphere`,
      text: `You have been invited to join SocietySphere. Click the link below to accept the invitation:\n${joinUrl}`,
      html: `
        <h2>Welcome to SocietySphere!</h2>
        <p>You have been invited to join the society platform. Please click the link below to accept your invitation:</p>
        <a href="${joinUrl}">${joinUrl}</a>
      `
    });

    res.status(201).json({ message: "Invitation sent successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc   Get pending invitations
// @route  GET /api/residents/invitations
export const getInvitations = async (req, res, next) => {
  try {
    const invitations = await invitationService.getInvitations(req.societyId);
    res.json(invitations);
  } catch (err) {
    next(err);
  }
};

// @desc   Revoke an invitation
// @route  PATCH /api/residents/invitations/:id/revoke
export const revokeInvitation = async (req, res, next) => {
  try {
    await invitationService.revokeInvitation(req.societyId, req.params.id);
    res.json({ message: "Invitation revoked" });
  } catch (err) {
    next(err);
  }
};

// @desc   Get residents directory
// @route  GET /api/residents
export const getResidents = async (req, res, next) => {
  try {
    const residents = await residentService.getResidents(req.societyId, req.query);
    res.json(residents);
  } catch (err) {
    next(err);
  }
};
