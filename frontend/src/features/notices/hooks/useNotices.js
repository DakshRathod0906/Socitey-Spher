import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../../services/queryKeys.js";
import { 
  fetchNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice,
  archiveNotice,
  uploadNoticeAttachment
} from "./notice.api.js";
import { cacheHelpers } from "../../../lib/cacheHelpers.js";

export function useNotices(filters = {}) {
  return useQuery({
    queryKey: [...queryKeys.notices, filters],
    queryFn: () => fetchNotices(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      toast.success("Notice created successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.notices);
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create notice");
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotice,
    onSuccess: (data, variables) => {
      toast.success("Notice updated successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.notices);
      cacheHelpers.invalidate(queryClient, queryKeys.notice(variables.id));
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update notice");
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      toast.success("Notice deleted");
      cacheHelpers.invalidate(queryClient, queryKeys.notices);
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notice");
    },
  });
}

export function useArchiveNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveNotice,
    onSuccess: (data, id) => {
      toast.success("Notice archived");
      cacheHelpers.invalidate(queryClient, queryKeys.notices);
      cacheHelpers.invalidate(queryClient, queryKeys.notice(id));
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive notice");
    },
  });
}

export function useUploadNoticeAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadNoticeAttachment,
    onSuccess: (data, variables) => {
      toast.success("Attachment uploaded successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.notices);
      cacheHelpers.invalidate(queryClient, queryKeys.notice(variables.id));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload attachment");
    },
  });
}
