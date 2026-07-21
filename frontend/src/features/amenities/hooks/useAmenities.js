import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAmenities,
  getMyBookings,
  createBooking,
  cancelBooking,
} from "../api/amenityApi";
import { toast } from "sonner";

// Query Keys
export const AMENITY_KEYS = {
  catalog: ["amenities", "catalog"],
  residentBookings: ["bookings", "resident"],
};

// Helper for Error Matrix mapping
const handleApiError = (err, fallbackMessage) => {
  const status = err.response?.status;
  const dataMessage = err.response?.data?.message;

  if (status === 400) {
    toast.error(dataMessage || "Invalid booking details. Please check your input.");
  } else if (status === 401) {
    toast.error("Session expired. Please log in again.");
  } else if (status === 403) {
    toast.error("Permission denied to perform this action.");
  } else if (status === 404) {
    toast.error("Amenity not found or removed.");
  } else if (status === 409) {
    toast.error(dataMessage || "Fully booked or time conflict for this slot.");
  } else {
    toast.error(fallbackMessage || "An unexpected server error occurred.");
  }
};

export const useAmenities = () => {
  const queryClient = useQueryClient();

  // Queries
  const amenitiesQuery = useQuery({
    queryKey: AMENITY_KEYS.catalog,
    queryFn: getAmenities,
  });

  const bookingsQuery = useQuery({
    queryKey: AMENITY_KEYS.residentBookings,
    queryFn: getMyBookings,
  });

  // Mutations
  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMENITY_KEYS.catalog });
      queryClient.invalidateQueries({ queryKey: AMENITY_KEYS.residentBookings });
      toast.success("Booking confirmed successfully.");
    },
    onError: (err) => {
      handleApiError(err, "Failed to create booking.");
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMENITY_KEYS.residentBookings });
      queryClient.invalidateQueries({ queryKey: AMENITY_KEYS.catalog });
      toast.success("Booking cancelled successfully.");
    },
    onError: (err) => {
      handleApiError(err, "Failed to cancel booking.");
    },
  });

  return {
    amenities: amenitiesQuery.data || [],
    bookings: bookingsQuery.data || [],
    isLoadingAmenities: amenitiesQuery.isLoading,
    isAmenitiesError: amenitiesQuery.isError,
    isLoadingBookings: bookingsQuery.isLoading,
    isBookingsError: bookingsQuery.isError,
    refetchAmenities: amenitiesQuery.refetch,
    refetchBookings: bookingsQuery.refetch,
    createBooking: createBookingMutation,
    cancelBooking: cancelBookingMutation,
  };
};
