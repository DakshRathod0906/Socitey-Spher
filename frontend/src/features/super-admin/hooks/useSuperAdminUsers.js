import { useQuery } from "@tanstack/react-query";
import * as superAdminUserApi from "../api/superAdminUserApi";

export const useSocietyAdmins = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["super-admin", "society-admins"],
    queryFn: superAdminUserApi.fetchSocietyAdmins,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    refetch,
  };
};
