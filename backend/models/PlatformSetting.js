import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    appName: { type: String, default: "SocietySphere" },
    supportEmail: { type: String, default: "support@societysphere.com" },
    supportPhone: { type: String, default: "+91 1800-123-4567" },
    autoApproveSociety: { type: Boolean, default: false },
    enableAnalyticsML: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformSetting", platformSettingSchema);
