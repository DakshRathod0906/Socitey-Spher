import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getParkingSlots,
  createParkingSlot,
  registerVehicle,
  getVehicles,
  allocateParkingSlot,
  updateSlotOccupancy,
  unassignParkingSlot,
  deleteParkingSlot,
} from "../api/parkingApi";

export const useParkingSlots = (filters = {}) => {
  return useQuery({
    queryKey: ["parking_slots", filters],
    queryFn: () => getParkingSlots(filters),
  });
};

export const useVehicles = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
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

export const useUnassignSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unassignParkingSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking_slots"] });
      toast.success("Parking slot unassigned successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to unassign slot");
    },
  });
};

export const useDeleteSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteParkingSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parking_slots"] });
      toast.success("Parking slot deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete slot");
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
