import * as visitorService from "../services/visitor/VisitorService.js";

// @desc   Resident creates a pre-approved pass
// @route  POST /api/visits
export const createVisit = async (req, res, next) => {
  try {
    const { flatId, visitorData, visitData } = req.body;
    const result = await visitorService.createPreApprovedVisit(
      req.societyId,
      flatId,
      req.user._id,
      visitorData,
      visitData
    );
    res.status(201).json({ message: "Visit created successfully", ...result });
  } catch (err) {
    next(err);
  }
};

// @desc   Get today's visitor metrics for security dashboard
// @route  GET /api/visits/today
export const getTodayMetrics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visits = await visitorService.getVisits(req.societyId, {
      createdAt: { $gte: today }
    });

    const expected = visits.filter(v => v.status === "APPROVED").length;
    const inside = visits.filter(v => v.status === "CHECKED_IN").length;
    const checkedOut = visits.filter(v => v.status === "CHECKED_OUT").length;
    const walkIns = visits.filter(v => v.approvalMode === "MANUAL" && v.status === "PENDING").length;
    
    // Recent activity: Limit to 5 most recent actions
    const recentVisits = await visitorService.getVisits(req.societyId, {});
    const recentActivity = recentVisits
      .filter(v => v.status === "CHECKED_IN" || v.status === "CHECKED_OUT" || v.status === "REJECTED")
      .slice(0, 5)
      .map(v => ({
        id: v._id,
        name: v.visitorId?.name || "Unknown",
        time: v.checkOutTime || v.checkInTime || v.updatedAt,
        status: v.status
      }));

    res.json({
      expected,
      inside,
      checkedOut,
      walkIns,
      recentActivity
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get visits based on role
// @route  GET /api/visits
export const getVisits = async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role === "resident") {
      filters.residentUserId = req.user._id;
    }
    // Security/Admin sees all (can pass filters via req.query later)
    
    const visits = await visitorService.getVisits(req.societyId, filters);
    res.json(visits);
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel a visit
// @route  PATCH /api/visits/:id/cancel
export const cancelVisit = async (req, res, next) => {
  try {
    const visit = await visitorService.cancelVisit(req.societyId, req.user._id, req.params.id);
    res.json({ message: "Visit cancelled", visit });
  } catch (err) {
    next(err);
  }
};

// @desc   Security creates walk-in gate request
// @route  POST /api/visits/gate-request
export const createGateRequest = async (req, res, next) => {
  try {
    const { flatId, visitorData, visitData } = req.body;
    const result = await visitorService.createGateRequest(
      req.societyId,
      flatId,
      req.user._id, // security user
      visitorData,
      visitData
    );
    res.status(201).json({ message: "Gate request sent to resident", ...result });
  } catch (err) {
    next(err);
  }
};

// @desc   Resident responds to gate request
// @route  PATCH /api/visits/:id/respond
export const respondToGateRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { visit, rawToken } = await visitorService.respondToGateRequest(
      req.societyId,
      req.user._id,
      req.params.id,
      status
    );
    const response = { message: `Visit ${status}`, visit };
    if (rawToken) response.rawToken = rawToken;
    res.json(response);
  } catch (err) {
    next(err);
  }
};

// @desc   Security verifies visitor using QR token
// @route  POST /api/visits/verify
export const verifyVisit = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    const visit = await visitorService.verifyToken(req.societyId, qrToken);
    res.json({ message: "Token verified", visit });
  } catch (err) {
    next(err);
  }
};

// @desc   Security checks in visitor using QR token
// @route  POST /api/visits/check-in
export const checkIn = async (req, res, next) => {
  try {
    const { qrToken, visitId, gate } = req.body;
    const checkInKey = qrToken || visitId;
    const visit = await visitorService.processCheckIn(req.societyId, checkInKey, req.user._id, gate);
    res.json({ message: "Check-in successful", visit });
  } catch (err) {
    next(err);
  }
};

// @desc   Security checks out visitor
// @route  POST /api/visits/:id/check-out
export const checkOut = async (req, res, next) => {
  try {
    const visit = await visitorService.processCheckOut(req.societyId, req.params.id, req.user._id);
    res.json({ message: "Check-out successful", visit });
  } catch (err) {
    next(err);
  }
};
