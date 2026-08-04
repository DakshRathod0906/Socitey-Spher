import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, getExpense, createExpense, updateExpenseStatus } from "../api/expenseApi";
import { toast } from "sonner";

export const useExpenses = (filters) => {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => getExpenses(filters),
  });
};

export const useExpense = (id) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense recorded successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to record expense");
    },
  });
};

export const useUpdateExpenseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateExpenseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update expense status");
    },
  });
};
