import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAmenities,
  getAllBookings,
  createAmenity as createAmenityApi,
  updateAmenity as updateAmenityApi,
  cancelBooking as cancelBookingApi,
} from "../api/amenityApi";
import { toast } from "sonner";
import { AMENITY_KEYS } from "./useAmenities";

// Admin Query Keys
export const ADMIN_AMENITY_KEYS = {
  catalog: AMENITY_KEYS.catalog, // Share the same catalog cache key
  allBookings: ["bookings", "all"],
};

// Helper for Error Matrix mapping
const handleApiError = (err, fallbackMessage) => {
  const status = err.response?.status;
  const dataMessage = err.response?.data?.message;

  if (status === 400) {
    toast.error(dataMessage || "Invalid details provided.");
  } else if (status === 401) {
    toast.error("Session expired. Please log in again.");
  } else if (status === 403) {
    toast.error("Permission denied to perform this action.");
  } else if (status === 404) {
    toast.error("Resource not found or removed.");
  } else if (status === 409) {
    toast.error(dataMessage || "Conflict detected.");
  } else {
    toast.error(fallbackMessage || "An unexpected server error occurred.");
  }
};

export const useAdminAmenities = () => {
  const queryClient = useQueryClient();

  // Queries
  const amenitiesQuery = useQuery({
    queryKey: ADMIN_AMENITY_KEYS.catalog,
    queryFn: getAmenities,
  });

  const allBookingsQuery = useQuery({
    queryKey: ADMIN_AMENITY_KEYS.allBookings,
    queryFn: getAllBookings,
  });

  // Mutations
  const createAmenityMutation = useMutation({
    mutationFn: createAmenityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_AMENITY_KEYS.catalog });
      toast.success("Amenity created successfully.");
    },
    onError: (err) => {
      handleApiError(err, "Failed to create amenity.");
    },
  });

  const updateAmenityMutation = useMutation({
    mutationFn: ({ id, payload }) => updateAmenityApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_AMENITY_KEYS.catalog });
      toast.success("Amenity updated successfully.");
    },
    onError: (err) => {
      handleApiError(err, "Failed to update amenity.");
    },
  });

  const toggleAmenityStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateAmenityApi(id, { isActive }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_AMENITY_KEYS.catalog });
      toast.success(`Amenity marked as ${variables.isActive ? "Active" : "Inactive"}.`);
    },
    onError: (err) => {
      handleApiError(err, "Failed to change amenity status.");
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: cancelBookingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_AMENITY_KEYS.allBookings });
      queryClient.invalidateQueries({ queryKey: ADMIN_AMENITY_KEYS.catalog });
      toast.success("Booking cancelled successfully.");
    },
    onError: (err) => {
      handleApiError(err, "Failed to cancel booking.");
    },
  });

  return {
    amenities: amenitiesQuery.data || [],
    allBookings: allBookingsQuery.data || [],
    isLoadingAmenities: amenitiesQuery.isLoading,
    isAmenitiesError: amenitiesQuery.isError,
    isLoadingBookings: allBookingsQuery.isLoading,
    isBookingsError: allBookingsQuery.isError,
    refetchAmenities: amenitiesQuery.refetch,
    refetchBookings: allBookingsQuery.refetch,
    createAmenity: createAmenityMutation,
    updateAmenity: updateAmenityMutation,
    toggleAmenityStatus: toggleAmenityStatusMutation,
    cancelBooking: cancelBookingMutation,
  };
};
