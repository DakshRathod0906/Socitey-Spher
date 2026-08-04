import Society from "../models/Society.js";

// Ensures every query is automatically scoped to the logged-in user's society.
// Super Admin is exempt since they operate across all societies.
export const enforceTenant = async (req, res, next) => {
  if (req.user?.role === "super_admin") return next();

  if (!req.societyId) {
    try {
      const defaultSociety = await Society.findOne({});
      if (defaultSociety) {
        req.societyId = defaultSociety._id.toString();
        return next();
      }
    } catch (err) {
      console.error("Error resolving tenant fallback:", err);
    }
    return res.status(400).json({ message: "User is not associated with any society" });
  }
  next();
};
