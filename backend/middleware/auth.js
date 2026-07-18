import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");
      if (!user || user.accountStatus !== "ACTIVE") {
        return res.status(401).json({ message: "Not authorized, user inactive or not found" });
      }

      req.user = user;
      // societyId used everywhere for tenant isolation
      req.societyId = user.societyId ? user.societyId.toString() : null;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Restrict access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user?.role}' is not authorized for this action` });
    }
    next();
  };
};
