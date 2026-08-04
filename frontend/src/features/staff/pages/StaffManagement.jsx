import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../../../components/shared";
import { Button } from "../../../components/ui";
import StaffStats from "../components/StaffStats";
import StaffFilters from "../components/StaffFilters";
import StaffTable from "../components/StaffTable";
import StaffFormModal from "../components/StaffFormModal";
import StaffDetailsDrawer from "../components/StaffDetailsDrawer";
import { useStaff } from "../hooks/useStaff";
import { LoadingScreen } from "../../../components/feedback";

export default function StaffManagement() {
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "ALL",
    department: "",
    shift: "",
    page: 1,
    limit: 10,
  });

  const { staff, isLoading, createStaff, updateStaff, toggleStatus, isCreating, isUpdating, isToggling } = useStaff(filters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null); // For edit
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState(null); // For drawer

  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setSelectedStaff(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenView = (staffMember) => {
    setViewStaff(staffMember);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (staffMember) => {
    const newStatus = staffMember.accountStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "INACTIVE" ? "deactivate" : "activate";
    
    if (confirm(`Are you sure you want to ${action} ${staffMember.name}?`)) {
      toggleStatus({ id: staffMember._id, status: newStatus });
    }
  };

  const handleFormSubmit = (data) => {
    setFormError("");
    if (selectedStaff) {
      updateStaff({ id: selectedStaff._id, data }, {
        onSuccess: () => setIsModalOpen(false),
        onError: (err) => setFormError(err.response?.data?.message || "Failed to update staff")
      });
    } else {
      createStaff(data, {
        onSuccess: () => setIsModalOpen(false),
        onError: (err) => setFormError(err.response?.data?.message || "Failed to create staff")
      });
    }
  };

  if (isLoading && !staff?.length) {
    return <LoadingScreen message="Loading staff data..." />;
  }

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader
        title="Staff & Guards"
        description="Manage security guards and service staff across the society."
        action={
          <Button onClick={handleOpenCreate} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        }
      />

      <StaffStats staffList={staff} />
      
      <StaffFilters filters={filters} onFilterChange={setFilters} />

      <StaffTable 
        staffList={staff} 
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
      />

      {isModalOpen && (
        <StaffFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staff={selectedStaff}
          onSubmit={handleFormSubmit}
          isSubmitting={isCreating || isUpdating}
          apiError={formError}
        />
      )}

      {isDrawerOpen && (
        <StaffDetailsDrawer 
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          staff={viewStaff}
        />
      )}
    </div>
  );
}
