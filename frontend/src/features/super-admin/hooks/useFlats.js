import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../services/queryKeys";
import { fetchFlats } from "../api/flat.api";

export const useFlats = (options = {}) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.flats || ["flats"], // Fallback if queryKeys.flats isn't defined yet
    queryFn: fetchFlats,
    ...options,
  });

  // Transform flats into { value, label } options for Select component
  const flatOptions = data?.map((flat) => {
    let label = "";
    if (flat.towerId && flat.towerId.name) {
      label = `${flat.towerId.name} • ${flat.flatNumber}`;
    } else {
      label = flat.flatNumber;
    }

    return {
      value: flat.id || flat._id,
      label,
    };
  }) || [];

  return {
    data,
    flatOptions,
    isLoading,
    isError,
    error,
    refetch,
  };
};
