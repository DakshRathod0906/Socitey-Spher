import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      societyId: user.societyId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export default generateToken;
