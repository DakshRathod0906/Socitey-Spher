import * as invitationService from "../services/resident/InvitationService.js";
import * as residentService from "../services/resident/ResidentService.js";

// @desc   Invite a resident (or staff)
// @route  POST /api/residents/invite
export const inviteResident = async (req, res, next) => {
  try {
    const { invitation, rawToken } = await invitationService.inviteResident(
      req.societyId,
      req.body,
      req.user._id
    );

    // Mock sending email
    console.log(`\n==========================================`);
    console.log(`[MOCK EMAIL] Invitation sent to: ${invitation.email}`);
    console.log(`[MOCK EMAIL] Join Link: http://localhost:5173/accept-invite?token=${rawToken}`);
    console.log(`==========================================\n`);

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
