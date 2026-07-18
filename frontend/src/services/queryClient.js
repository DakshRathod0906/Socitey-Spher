import { QueryClient } from "@tanstack/react-query";

/**
 * Global QueryClient configuration.
 * Shared across the entire application via QueryClientProvider.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Data considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000,           // Garbage collect unused data after 10 minutes
      retry: 1,                          // Retry failed queries once
      refetchOnWindowFocus: false,       // Don't refetch every time user switches tabs
      refetchOnReconnect: true,          // Refetch when network reconnects
    },
    mutations: {
      retry: 0,                          // Don't retry mutations (POST/PUT/DELETE)
    },
  },
});
