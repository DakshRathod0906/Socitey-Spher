import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Button, Tabs } from "../../components/ui";
import ResidentDirectory from "./ResidentDirectory";
import PendingInvitations from "./PendingInvitations";
import InviteResidentModal from "./InviteResidentModal";
import { canManageResidents } from "../../lib/permissions";
import { useAuth } from "../../contexts/AuthContext";

export default function ResidentsLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("directory");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const tabs = [
    { id: "directory", label: "Resident Directory" },
    { id: "invitations", label: "Pending Invitations" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader 
          title="Resident Management" 
          subtitle="Manage all owners, tenants, and family members in the society."
          className="mb-0"
        />
        {canManageResidents(user) && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="shrink-0 flex items-center gap-2">
            <UserPlus size={18} />
            Invite Resident
          </Button>
        )}
      </div>

      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      <div className="mt-6">
        {activeTab === "directory" && <ResidentDirectory />}
        {activeTab === "invitations" && <PendingInvitations />}
      </div>

      <InviteResidentModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
}
