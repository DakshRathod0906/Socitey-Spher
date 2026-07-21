import { useState } from "react";
import { Coffee, Calendar as CalendarIcon, XCircle } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Tabs, Card } from "../../components/ui";
import { useAmenities } from "./hooks/useAmenities";
import AmenityCard from "./components/AmenityCard";
import BookingModal from "./components/BookingModal";
import BookingStatusBadge from "./components/BookingStatusBadge";

export default function MyAmenities() {
  const {
    amenities,
    bookings,
    isLoadingAmenities,
    isAmenitiesError,
    isLoadingBookings,
    isBookingsError,
    createBooking,
    cancelBooking,
    refetchAmenities,
    refetchBookings
  } = useAmenities();

  const [bookingModalData, setBookingModalData] = useState(null);

  const handleBookingSubmit = (formData) => {
    createBooking.mutate(formData, {
      onSuccess: () => setBookingModalData(null)
    });
  };

  const renderCatalogEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
      <Coffee className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-medium text-slate-700">No amenities available.</h3>
      <p className="text-sm text-slate-500 mt-1">There are currently no active amenities in your society.</p>
    </div>
  );

  const renderBookingsEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
      <CalendarIcon className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-medium text-slate-700">You haven't made any bookings yet.</h3>
      <p className="text-sm text-slate-500 mt-1">Browse the catalog to book an amenity.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {amenities.map(amenity => (
          <AmenityCard
            key={amenity._id}
            amenity={amenity}
            onBookClick={(a) => setBookingModalData(a)}
          />
        ))}
      </div>
    );
  };

  const renderBookings = () => {
    if (isLoadingBookings) return <div className="p-8 text-center text-slate-500">Loading your bookings...</div>;
    if (isBookingsError) return (
      <div className="p-8 text-center text-red-500">
        Failed to load bookings. <button onClick={() => refetchBookings()} className="underline">Retry</button>
      </div>
    );
    if (!bookings.length) return renderBookingsEmptyState();

    return (
      <div className="space-y-4 max-w-4xl">
        {bookings.map(booking => (
          <Card key={booking._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h4 className="font-semibold text-slate-800">{booking.amenityId?.name || "Unknown Amenity"}</h4>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-slate-500">
                {new Date(booking.bookingDate).toLocaleDateString()} &middot; {booking.startTime} - {booking.endTime}
              </p>
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
      label: "Amenity Catalog",
      icon: Coffee,
      content: renderCatalog(),
    },
    {
      value: "my_bookings",
      label: "My Bookings",
      icon: CalendarIcon,
      content: renderBookings(),
    }
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader 
        title="Amenities" 
        subtitle="Browse and book facilities in your society."
      />

      <div className="bg-white rounded-xl shadow-sm border border-border mt-6 overflow-hidden min-h-[400px]">
        <Tabs 
          tabs={tabsData} 
          defaultValue="catalog"
          className="p-4 sm:p-6"
        />
      </div>

      {bookingModalData && (
        <BookingModal
          isOpen={!!bookingModalData}
          onClose={() => setBookingModalData(null)}
          amenity={bookingModalData}
          onSubmit={handleBookingSubmit}
          isSubmitting={createBooking.isPending}
        />
      )}
    </div>
  );
}
