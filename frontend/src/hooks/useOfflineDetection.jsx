import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WifiOff } from "lucide-react";

/**
 * Hook to detect online/offline status and show a global toast.
 */
export function useOfflineDetection() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    let toastId;

    const handleOffline = () => {
      setIsOffline(true);
      toastId = toast("You are offline", {
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
        style: {
          background: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        },
        action: {
          label: "Retry",
          onClick: () => {
            if (navigator.onLine) {
              toast.dismiss(toastId);
              setIsOffline(false);
            }
          },
        },
      });
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (toastId) {
        toast.dismiss(toastId);
      }
      toast.success("Back online!");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Initial check in case they loaded the app while offline
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return isOffline;
}
