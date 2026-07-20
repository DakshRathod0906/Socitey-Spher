import * as userService from "../services/user/UserService.js";

// @desc   Get all users in the society
// @route  GET /api/users
// @access Private (Society Admin)
export const getUsers = async (req, res, next) => {
  try {
    const status = req.query.status || "ACTIVE"; // Filter by ACTIVE or INACTIVE
    const users = await userService.getSocietyUsers(req.societyId, status);
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
