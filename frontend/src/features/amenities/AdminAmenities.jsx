import { useState } from "react";
import { Coffee, Calendar as CalendarIcon, XCircle, Plus } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Tabs, Card } from "../../components/ui";
import { useAdminAmenities } from "./hooks/useAdminAmenities";
import AdminAmenityCard from "./components/AdminAmenityCard";
import CreateAmenityModal from "./components/CreateAmenityModal";
import BookingStatusBadge from "./components/BookingStatusBadge";

export default function AdminAmenities() {
  const {
    amenities,
    allBookings,
    isLoadingAmenities,
    isAmenitiesError,
    isLoadingBookings,
    isBookingsError,
    createAmenity,
    updateAmenity,
    toggleAmenityStatus,
    cancelBooking,
    refetchAmenities,
    refetchBookings
  } = useAdminAmenities();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);

  const handleCreateSubmit = (formData) => {
    createAmenity.mutate(formData, {
      onSuccess: () => setIsCreateModalOpen(false)
    });
  };

  const handleEditSubmit = (formData) => {
    if (editingAmenity) {
      updateAmenity.mutate({ id: editingAmenity._id, payload: formData }, {
        onSuccess: () => setEditingAmenity(null)
      });
    }
  };

  const handleToggleStatus = (amenity) => {
    if (window.confirm(`Are you sure you want to ${amenity.isActive ? 'disable' : 'enable'} ${amenity.name}?`)) {
      toggleAmenityStatus.mutate({ id: amenity._id, isActive: !amenity.isActive });
    }
  };

  const renderCatalogEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
      <Coffee className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-medium text-slate-700">No amenities created yet.</h3>
      <p className="text-sm text-slate-500 mt-1 mb-4">Click "Add Amenity" to create your first facility.</p>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Amenity
      </button>
    </div>
  );

  const renderBookingsEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
      <CalendarIcon className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-medium text-slate-700">No bookings have been made yet.</h3>
      <p className="text-sm text-slate-500 mt-1">Bookings from residents will appear here.</p>
    </div>
  );

  const renderCatalog = () => {
    if (isLoadingAmenities) return <div className="p-8 text-center text-slate-500">Loading catalog...</div>;
    if (isAmenitiesError) return (
      <div className="p-8 text-center text-red-500">
        Failed to load catalog. <button onClick={() => refetchAmenities()} className="underline">Retry</button>
      </div>
    );
    if (!amenities.length) return renderCatalogEmptyState();

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Amenity
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {amenities.map(amenity => (
            <AdminAmenityCard
              key={amenity._id}
              amenity={amenity}
              onEditClick={(a) => setEditingAmenity(a)}
              onToggleStatus={handleToggleStatus}
              isToggling={toggleAmenityStatus.isPending && toggleAmenityStatus.variables?.id === amenity._id}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    if (isLoadingBookings) return <div className="p-8 text-center text-slate-500">Loading bookings...</div>;
    if (isBookingsError) return (
      <div className="p-8 text-center text-red-500">
        Failed to load bookings. <button onClick={() => refetchBookings()} className="underline">Retry</button>
      </div>
    );
    if (!allBookings.length) return renderBookingsEmptyState();

    return (
      <div className="space-y-4 max-w-5xl">
        {allBookings.map(booking => (
          <Card key={booking._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h4 className="font-semibold text-slate-800">{booking.amenityId?.name || "Unknown Amenity"}</h4>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-slate-500">
                {new Date(booking.bookingDate).toLocaleDateString()} &middot; {booking.startTime} - {booking.endTime}
              </p>
              <div className="mt-2 text-sm text-slate-600 flex items-center space-x-2">
                <span className="font-medium">Resident:</span>
                <span>{booking.residentId?.name || "Unknown"}</span>
                {booking.residentId?.email && (
                  <span className="text-slate-400">({booking.residentId.email})</span>
                )}
              </div>
            </div>
            {booking.status === "CONFIRMED" && (
              <button
                onClick={() => {
                  if(window.confirm("Are you sure you want to cancel this booking?")) {
                    cancelBooking.mutate(booking._id);
                  }
                }}
                disabled={cancelBooking.isPending}
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center shrink-0"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Cancel Booking
              </button>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const tabsData = [
    {
      value: "catalog",
      label: "Manage Amenities",
      icon: Coffee,
      content: renderCatalog(),
    },
    {
      value: "all_bookings",
      label: "All Bookings",
      icon: CalendarIcon,
      content: renderBookings(),
    }
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader 
        title="Admin Amenities" 
        subtitle="Manage society amenities and oversee bookings."
      />

      <div className="bg-white rounded-xl shadow-sm border border-border mt-6 overflow-hidden min-h-[400px]">
        <Tabs 
          tabs={tabsData} 
          defaultValue="catalog"
          className="p-4 sm:p-6"
        />
      </div>

      {isCreateModalOpen && (
        <CreateAmenityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          isSubmitting={createAmenity.isPending}
        />
      )}

      {editingAmenity && (
        <CreateAmenityModal
          isOpen={!!editingAmenity}
          onClose={() => setEditingAmenity(null)}
          amenity={editingAmenity}
          onSubmit={handleEditSubmit}
          isSubmitting={updateAmenity.isPending}
        />
      )}
    </div>
  );
}
