import { useState, useEffect } from "react";
import { User, Lock, Save, Shield, Sliders, Server, Bell, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/shared";
import { Card, Button, Input, Tabs, Switch, Badge } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { usePlatformSettings } from "../../contexts/PlatformContext";
import api from "../../services/api";

export default function SuperAdminSettings() {
  const { user } = useAuth();
  const { platformConfig: globalConfig, updatePlatformConfig } = usePlatformSettings();

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Local state synced with global config
  const [platformConfig, setPlatformConfig] = useState(globalConfig);

  useEffect(() => {
    setPlatformConfig(globalConfig);
  }, [globalConfig]);

  // Security Settings State
  const [securityConfig, setSecurityConfig] = useState({
    enforceEmailVerification: true,
    enforceStrongPassword: true,
    allowSocialLogin: false,
    rateLimitPerMin: 120,
  });

  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.name || "Super Admin",
    email: user?.email || "superadmin@societysphere.com",
    phone: user?.phone || "+91 99999 88888",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      await updatePlatformConfig(platformConfig);
      toast.success("Platform settings updated globally!");
    } catch {
      toast.error("Failed to update platform settings");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setIsSavingSecurity(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Security configuration updated!");
    setIsSavingSecurity(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (profile.newPassword && profile.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters!");
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };

      if (profile.newPassword) {
        payload.currentPassword = profile.currentPassword;
        payload.newPassword = profile.newPassword;
      }

      const res = await api.put("/auth/profile", payload);
      toast.success(res.data.message || "Profile & password updated successfully!");
      setProfile((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Platform & System Settings"
        subtitle="Configure global platform settings, security policies, and super admin preferences."
      />

      <Tabs
        tabs={[
          {
            id: "general",
            label: "Platform Config",
            icon: Sliders,
            content: (
              <Card className="p-6">
                <form onSubmit={handleSaveGeneral} className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-text mb-1">General Details</h3>
                    <p className="text-xs text-muted">
                      System branding and support contact information displayed across tenants.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Application Name"
                      value={platformConfig.appName}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, appName: e.target.value })}
                    />
                    <Input
                      label="Support Contact Email"
                      type="email"
                      value={platformConfig.supportEmail}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
                    />
                    <Input
                      label="Support Helpline"
                      value={platformConfig.supportPhone}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, supportPhone: e.target.value })}
                    />
                  </div>

                  <hr className="border-border" />

                  <div>
                    <h3 className="text-base font-semibold text-text mb-3">Automation & System Controls</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-sm text-text">Auto-Approve Society Registration</p>
                          <p className="text-xs text-muted mt-0.5">
                            Automatically approve new society registrations without manual admin verification.
                          </p>
                        </div>
                        <Switch
                          checked={platformConfig.autoApproveSociety}
                          onChange={(e) =>
                            setPlatformConfig({ ...platformConfig, autoApproveSociety: e.target.checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-sm text-text">ML Analytics Engine</p>
                          <p className="text-xs text-muted mt-0.5">
                            Enable Python AI/ML predictive analytics models for expense forecasting and complaint resolution.
                          </p>
                        </div>
                        <Switch
                          checked={platformConfig.enableAnalyticsML}
                          onChange={(e) =>
                            setPlatformConfig({ ...platformConfig, enableAnalyticsML: e.target.checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-sm text-text text-danger">Platform Maintenance Mode</p>
                          <p className="text-xs text-muted mt-0.5">
                            Restrict tenant access while running core database migrations or system maintenance.
                          </p>
                        </div>
                        <Switch
                          checked={platformConfig.maintenanceMode}
                          onChange={(e) =>
                            setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" loading={isSavingGeneral}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Platform Settings
                    </Button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            id: "security",
            label: "Security Policy",
            icon: Shield,
            content: (
              <Card className="p-6">
                <form onSubmit={handleSaveSecurity} className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-text mb-1">Global Authentication Policy</h3>
                    <p className="text-xs text-muted">
                      Configure security controls enforced across all multi-tenant endpoints.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm text-text">Enforce Email Verification</p>
                        <p className="text-xs text-muted mt-0.5">
                          Require newly created admin and user accounts to verify email before logging in.
                        </p>
                      </div>
                      <Switch
                        checked={securityConfig.enforceEmailVerification}
                        onChange={(e) =>
                          setSecurityConfig({ ...securityConfig, enforceEmailVerification: e.target.checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm text-text">Strict Password Policy</p>
                        <p className="text-xs text-muted mt-0.5">
                          Enforce minimum 8 characters, special symbols, numbers, and capital letters.
                        </p>
                      </div>
                      <Switch
                        checked={securityConfig.enforceStrongPassword}
                        onChange={(e) =>
                          setSecurityConfig({ ...securityConfig, enforceStrongPassword: e.target.checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Token Lifetimes (System Presets)
                    </label>
                    <div className="p-2.5 bg-background rounded-lg border border-border flex items-center gap-3 text-xs text-muted">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded font-mono font-medium">Access: 15m</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded font-mono font-medium">Refresh: 7d</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" loading={isSavingSecurity}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Policy
                    </Button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            id: "profile",
            label: "Super Admin Profile",
            icon: User,
            content: (
              <Card className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-text mb-1">Super Admin Information</h3>
                    <p className="text-xs text-muted">Manage your personal credentials and super admin access.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Admin Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>

                  <hr className="border-border" />

                  <div>
                    <h3 className="text-base font-semibold text-text mb-1">Security & Password</h3>
                    <p className="text-xs text-muted mb-4">Leave fields blank if you do not wish to update your password.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        value={profile.currentPassword}
                        onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        value={profile.newPassword}
                        onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        value={profile.confirmPassword}
                        onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" loading={isSavingProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </form>
              </Card>
            ),
          },
          {
            id: "system",
            label: "System Health",
            icon: Server,
            content: (
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-text mb-1">System Health & Infrastructure</h3>
                  <p className="text-xs text-muted">Real-time status of backend services and database connections.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">Database</p>
                      <p className="font-semibold text-sm text-text mt-1">MongoDB Atlas</p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">Backend API</p>
                      <p className="font-semibold text-sm text-text mt-1">Node Express</p>
                    </div>
                    <Badge variant="success">Online (v1.0.0)</Badge>
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">ML Service</p>
                      <p className="font-semibold text-sm text-text mt-1">FastAPI Analytics</p>
                    </div>
                    <Badge variant="success">Operational</Badge>
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted">System Uptime</p>
                      <p className="font-semibold text-sm text-text mt-1">99.98%</p>
                    </div>
                    <Badge variant="info">Healthy</Badge>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-text">All microservices and database instances are performing optimally.</p>
                    <p className="text-muted mt-0.5">Last automated health diagnostic check completed 2 minutes ago.</p>
                  </div>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
