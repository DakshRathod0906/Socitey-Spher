import { useState } from "react";
import { User, Lock, Save, Camera } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/shared";
import { Card, Button, Input, Tabs } from "../../components/ui";

export default function ResidentProfile() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Profile updated successfully!");
    setIsLoading(false);
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
                        <User className="h-12 w-12 text-muted" />
                      </div>
                      <button className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg border-2 border-background">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted text-center max-w-[140px]">
                      Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3.1 MB
                    </p>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleSave} className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="First Name" defaultValue="Rahul" />
                      <Input label="Last Name" defaultValue="Sharma" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Email Address" type="email" defaultValue="rahul.s@example.com" />
                      <Input label="Phone Number" type="tel" defaultValue="+91 98765 43210" />
                    </div>
                    <div>
                      <Input label="Flat Number" defaultValue="A-101" disabled />
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
                <form onSubmit={handleSave} className="space-y-4 max-w-md">
                  <Input label="Current Password" type="password" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm New Password" type="password" />
                  <div className="pt-4">
                    <Button type="submit" loading={isLoading}>Update Password</Button>
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
