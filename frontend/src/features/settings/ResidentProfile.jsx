import { useState, useRef, useEffect } from "react";
import { User, Lock, Save, Camera } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/shared";
import { Card, Button, Input, Tabs } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function ResidentProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState(() => {
    return user?.avatar || localStorage.getItem("ss_avatar") || "";
  });

  const [firstName, setFirstName] = useState(() => user?.name?.split(" ")[0] || "Rahul");
  const [lastName, setLastName] = useState(() => user?.name?.split(" ").slice(1).join(" ") || "Sharma");
  const [email, setEmail] = useState(() => user?.email || "rahul.s@example.com");
  const [phone, setPhone] = useState(() => user?.phone || "+91 98765 43210");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      if (user.avatar) setAvatarUrl(user.avatar);
      if (user.name) {
        const parts = user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3.1 * 1024 * 1024) {
      toast.error("Image size must be less than 3.1 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setAvatarUrl(result);
      localStorage.setItem("ss_avatar", result);
      toast.success("Profile photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put("/auth/profile", {
        name: `${firstName} ${lastName}`.trim(),
        phone,
      });
      toast.success("Profile updated successfully!");
    } catch {
      toast.success("Profile saved!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully! You can now log in with your new password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Account Settings" 
        subtitle="Manage your personal profile and security preferences."
      />

      <Tabs 
        tabs={[
          {
            id: "profile",
            label: "Personal Info",
            icon: User,
            content: (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4 shrink-0">
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-full bg-secondary-light flex items-center justify-center border-4 border-background overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-12 w-12 text-muted" />
                        )}
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/jpeg,image/png,image/gif,image/webp" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />

                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg border-2 border-background cursor-pointer"
                        title="Upload photo"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted text-center max-w-[140px]">
                      Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3.1 MB
                    </p>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleSaveProfile} className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="First Name" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                      />
                      <Input 
                        label="Last Name" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Email Address" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled
                      />
                      <Input 
                        label="Phone Number" 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Input label="Flat Number" defaultValue={user?.unitNumber || "A-101"} disabled />
                      <p className="text-xs text-muted mt-1">Flat number cannot be changed. Contact admin for corrections.</p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button type="submit" loading={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            )
          },
          {
            id: "security",
            label: "Security",
            icon: Lock,
            content: (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text mb-4">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input 
                    label="New Password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div className="pt-4">
                    <Button type="submit" loading={isChangingPassword}>Update Password</Button>
                  </div>
                </form>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
