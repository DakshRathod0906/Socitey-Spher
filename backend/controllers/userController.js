import * as userService from "../services/user/UserService.js";

// @desc   Get all users in the society
// @route  GET /api/users
// @access Private (Society Admin)
export const getUsers = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status, // Can be ACTIVE, INACTIVE, or ALL
      role: req.query.role,
      department: req.query.department,
      shift: req.query.shift,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };
    
    // Normalize if it's an array (e.g. ?role=security&role=service_staff)
    if (Array.isArray(filters.role)) {
      filters.role = filters.role.join(",");
    }

    const users = await userService.getSocietyUsers(req.societyId, filters);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @desc   Deactivate (Soft Delete) a user
// @route  DELETE /api/users/:id
// @access Private (Society Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deactivateUser(
      req.societyId, 
      req.params.id,
      req.user._id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc   Get all society admins (Super Admin)
// @route  GET /api/users/admins
// @access Private (Super Admin)
export const getSocietyAdmins = async (req, res, next) => {
  try {
    const admins = await userService.getAllSocietyAdmins();
    res.json(admins);
  } catch (err) {
    next(err);
  }
};

// @desc   Create a new user (Staff/Security)
// @route  POST /api/users
// @access Private (Society Admin)
export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.societyId, req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.societyId, req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.societyId, req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.societyId, req.params.id, req.body.accountStatus, req.user._id);
    res.json({ message: "Status updated successfully", user });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};
