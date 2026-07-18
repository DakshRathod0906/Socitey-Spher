import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "../services/queryClient";
import { AuthProvider } from "../contexts/AuthContext";

/**
 * Global Providers — wraps the entire application.
 * Order matters:
 *   BrowserRouter (routing context)
 *     → QueryClientProvider (data fetching)
 *       → AuthProvider (authentication state)
 *         → Toaster (notifications)
 */
export default function Providers({ children }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
