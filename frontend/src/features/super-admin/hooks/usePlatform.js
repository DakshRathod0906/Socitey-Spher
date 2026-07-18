import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../services/queryKeys";
import {
  fetchPendingSocieties,
  fetchSocietyById,
  approveSociety,
  rejectSociety,
  suspendSociety,
  reactivateSociety,
} from "../api/platform.api";
import { toast } from "sonner";

export const usePendingSocieties = () => {
  return useQuery({
    queryKey: ["pending-societies"],
    queryFn: fetchPendingSocieties,
  });
};

export const useSocietyDetails = (id) => {
  return useQuery({
    queryKey: ["society", id],
    queryFn: () => fetchSocietyById(id),
    enabled: !!id,
  });
};

export const useManageSociety = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: ["pending-societies"] });
    queryClient.invalidateQueries({ queryKey: ["society"] });
  };

  const approve = useMutation({
    mutationFn: approveSociety,
    onSuccess: () => {
      toast.success("Society approved successfully");
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve society")
  });

  const reject = useMutation({
    mutationFn: rejectSociety,
    onSuccess: () => {
      toast.success("Society rejected successfully");
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject society")
  });

  const suspend = useMutation({
    mutationFn: suspendSociety,
    onSuccess: () => {
      toast.success("Society suspended successfully");
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to suspend society")
  });

  const reactivate = useMutation({
    mutationFn: reactivateSociety,
    onSuccess: () => {
      toast.success("Society reactivated successfully");
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reactivate society")
  });

  return { approve, reject, suspend, reactivate };
};
