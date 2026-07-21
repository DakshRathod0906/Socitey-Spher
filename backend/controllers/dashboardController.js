import Visitor from "../models/Visitor.js";
import Complaint from "../models/Complaint.js";
import Bill from "../models/Bill.js";
import User from "../models/User.js";
import Flat from "../models/Flat.js";
import Notification from "../models/Notification.js";
import Society from "../models/Society.js";

// @desc   Society Admin dashboard summary + basic analytics
// @route  GET /api/dashboard/admin
export const adminDashboard = async (req, res, next) => {
  try {
    const societyId = req.societyId;

    const [totalResidents, totalFlats, openComplaints, todayVisitors, unpaidBills] = await Promise.all([
      User.countDocuments({ societyId, role: "resident" }),
      Flat.countDocuments({ societyId }),
      Complaint.countDocuments({ societyId, status: { $in: ["open", "assigned", "in_progress"] } }),
      Visitor.countDocuments({
        societyId,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Bill.countDocuments({ societyId, status: { $in: ["PENDING", "PARTIAL", "OVERDUE"] } }),
    ]);

    // Complaint category breakdown (for trend/analytics charts)
    const complaintsByCategory = await Complaint.aggregate([
      { $match: { societyId: req.user.societyId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Monthly revenue trend (last 6 months of paid bills)
    // Monthly revenue trend (last 6 months of paid bills)
    const revenueTrend = await Bill.aggregate([
      { $match: { societyId: req.user.societyId, status: "PAID" } },
      {
        $group: {
          _id: { month: { $month: "$billingCycle" }, year: { $year: "$billingCycle" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    res.json({
      totalResidents,
      totalFlats,
      openComplaints,
      todayVisitors,
      unpaidBills,
      complaintsByCategory,
      revenueTrend,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Resident dashboard summary
// @route  GET /api/dashboard/resident
export const residentDashboard = async (req, res, next) => {
  try {
    const [myComplaints, myUnpaidBills, myVisitorsToday] = await Promise.all([
      Complaint.countDocuments({ residentId: req.user._id, status: { $ne: "closed" } }),
      Bill.countDocuments({ residentId: req.user._id, status: { $in: ["PENDING", "PARTIAL", "OVERDUE"] } }),
      Visitor.countDocuments({
        residentId: req.user._id,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    res.json({ myComplaints, myUnpaidBills, myVisitorsToday });
  } catch (err) {
    next(err);
  }
};

// @desc   Super Admin platform dashboard
// @route  GET /api/dashboard/super-admin
export const superAdminDashboard = async (req, res, next) => {
  try {
    const [totalSocieties, approved, pending, suspended, totalUsers, societiesList] = await Promise.all([
      Society.countDocuments(),
      Society.countDocuments({ status: "ACTIVE" }),
      Society.countDocuments({ status: { $in: ["SUBMITTED", "UNDER_REVIEW"] } }),
      Society.countDocuments({ status: "SUSPENDED" }),
      User.countDocuments({ role: "society_admin" }),
      Society.find().sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    // Format societies for the frontend
    const formattedSocieties = societiesList.map(soc => ({
      id: soc._id,
      name: soc.name,
      location: `${soc.city}, ${soc.state}`,
      users: soc.totalFlats || 0, // Using totalFlats as a proxy for size until users are aggregated
      status: soc.status === 'ACTIVE' ? 'Active' : 
              soc.status === 'APPROVED' ? 'Approved' :
              (soc.status === 'SUBMITTED' || soc.status === 'UNDER_REVIEW') ? 'Pending' : 
              soc.status === 'SUSPENDED' ? 'Suspended' : 'Rejected',
      joinDate: new Date(soc.createdAt).toISOString().split('T')[0]
    }));

    res.json({ totalSocieties, approved, pending, suspended, totalUsers, societies: formattedSocieties });
  } catch (err) {
    next(err);
  }
};

// @desc   Get logged-in user's notifications
// @route  GET /api/dashboard/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// @desc   Mark a notification as read
// @route  PUT /api/dashboard/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    next(err);
  }
};
