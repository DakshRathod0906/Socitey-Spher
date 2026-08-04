import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`SocietySphere API running on port ${PORT}`));
};

startServer();
