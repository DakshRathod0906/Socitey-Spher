// Ensures every query is automatically scoped to the logged-in user's society.
// Super Admin is exempt since they operate across all societies.
export const enforceTenant = (req, res, next) => {
  if (req.user.role === "super_admin") return next();

  if (!req.societyId) {
    return res.status(400).json({ message: "User is not associated with any society" });
  }
  next();
};
