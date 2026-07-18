import jwt from "jsonwebtoken";

export const generateAuthToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    societyId: user.societyId || null,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "testsecret", {
    expiresIn: "15m",
  });
};
