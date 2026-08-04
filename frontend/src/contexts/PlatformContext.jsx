import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const PlatformContext = createContext(null);

const DEFAULT_PLATFORM_CONFIG = {
  appName: "SocietySphere",
  supportEmail: "support@societysphere.com",
  supportPhone: "+91 1800-123-4567",
  autoApproveSociety: false,
  enableAnalyticsML: true,
  maintenanceMode: false,
};

export const PlatformProvider = ({ children }) => {
  const [platformConfig, setPlatformConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("ss_platform_config");
      return stored ? { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(stored) } : DEFAULT_PLATFORM_CONFIG;
    } catch {
      return DEFAULT_PLATFORM_CONFIG;
    }
  });

  useEffect(() => {
    api
      .get("/settings/platform")
      .then((res) => {
        if (res.data) {
          setPlatformConfig((prev) => {
            const merged = { ...prev, ...res.data };
            localStorage.setItem("ss_platform_config", JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const updatePlatformConfig = async (newConfig) => {
    setPlatformConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem("ss_platform_config", JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await api.put("/settings/platform", newConfig);
      if (res.data?.settings) {
        setPlatformConfig((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error("Failed to sync platform settings with backend:", err);
    }
  };

  useEffect(() => {
    if (platformConfig.appName) {
      document.title = `${platformConfig.appName} - Smart Society Management`;
    }
  }, [platformConfig.appName]);

  return (
    <PlatformContext.Provider value={{ platformConfig, updatePlatformConfig }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatformSettings = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    return {
      platformConfig: DEFAULT_PLATFORM_CONFIG,
      updatePlatformConfig: () => {},
    };
  }
  return context;
};
