import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { checkHealth as checkMLHealth } from "./services/ai/aiProvider.js";
import { initSocietyEventHandlers } from "./events/handlers/societyEventHandler.js";

import authRoutes from "./routes/authRoutes.js";
import societyRoutes from "./routes/societyRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import amenityRoutes from "./routes/amenityRoutes.js";
import setupRoutes from "./routes/setupRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Event Bus Handlers
initSocietyEventHandlers();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check — includes ML service reachability
app.get("/api/health", async (req, res) => {
  let mlStatus = "unknown";
  try {
    await checkMLHealth();
    mlStatus = "healthy";
  } catch {
    mlStatus = "unreachable";
  }
  res.json({ status: "ok", service: "SocietySphere API", ml: mlStatus });
});

app.use("/api/auth", authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/visits", visitorRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/service-orders", serviceRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/amenities", amenityRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
