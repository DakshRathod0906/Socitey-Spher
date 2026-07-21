import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotices, createNotice, updateNotice, deleteNotice, archiveNotice } from "../api/noticeApi";
import { toast } from "sonner";

export const useNotices = (filters) => {
  return useQuery({
    queryKey: ["notices", filters],
    queryFn: () => getNotices(filters),
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice broadcasted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create notice");
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update notice");
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete notice");
    },
  });
};

export const useArchiveNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice archived successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to archive notice");
    },
  });
};
