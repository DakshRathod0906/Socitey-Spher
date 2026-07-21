import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getVehicles,
  registerVehicle,
  getParkingSlots,
  createParkingSlot,
  allocateParkingSlot,
  updateSlotOccupancy
} from "../api/parkingApi";

// Queries
export const useVehicles = (filters = {}) => {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => getVehicles(filters),
  });
};

export const useParkingSlots = (filters = {}) => {
  return useQuery({
    queryKey: ["parking_slots", filters],
    queryFn: () => getParkingSlots(filters),
  });
};

// Mutations
export const useRegisterVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle registered successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to register vehicle");
    },
  });
};

export const useCreateSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createParkingSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking_slots"] });
      toast.success("Parking slot created successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create parking slot");
    },
  });
};

export const useAllocateSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: allocateParkingSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking_slots"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Slot allocated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to allocate slot");
    },
  });
};

export const useUpdateOccupancy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSlotOccupancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking_slots"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update slot occupancy");
    },
  });
};
