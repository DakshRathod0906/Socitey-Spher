import PlatformSetting from "../models/PlatformSetting.js";

// Helper to get or initialize single platform settings document
export const getOrCreateSettings = async () => {
  let settings = await PlatformSetting.findOne();
  if (!settings) {
    settings = await PlatformSetting.create({});
  }
  return settings;
};

// @desc   Get global platform settings
// @route  GET /api/settings/platform
// @access Public / Private
export const getPlatformSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// @desc   Update global platform settings
// @route  PUT /api/settings/platform
// @access Private (Super Admin)
export const updatePlatformSettings = async (req, res, next) => {
  try {
    let settings = await getOrCreateSettings();

    const {
      appName,
      supportEmail,
      supportPhone,
      autoApproveSociety,
      enableAnalyticsML,
      maintenanceMode,
    } = req.body;

    if (appName !== undefined) settings.appName = appName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;
    if (autoApproveSociety !== undefined) settings.autoApproveSociety = Boolean(autoApproveSociety);
    if (enableAnalyticsML !== undefined) settings.enableAnalyticsML = Boolean(enableAnalyticsML);
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);

    await settings.save();

    res.json({
      message: "Platform settings updated successfully",
      settings,
    });
  } catch (err) {
    next(err);
  }
};
