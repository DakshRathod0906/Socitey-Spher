import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WIZARD_STEPS, getStepIndex, getStepByKey, getStepByPath } from "../constants/wizardSteps";
import * as setupService from "../services/setupService";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";

export const useSetupWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Derive current step key from URL
  const pathParts = location.pathname.split("/");
  const stepPathFromUrl = pathParts[pathParts.length - 1];

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const status = await setupService.getStatus();
      setProgress(status.progress);
      
      const currentStepObj = getStepByPath(stepPathFromUrl);
      const stepIndex = currentStepObj ? getStepIndex(currentStepObj.key) : -1;
      const activeStepIndex = getStepIndex(status.currentStep);
      
      if (stepPathFromUrl === "setup" || stepIndex === -1 || stepIndex > activeStepIndex) {
        const activeRoute = getStepByKey(status.currentStep).route;
        navigate(activeRoute, { replace: true });
        setCurrentStep(status.currentStep);
      } else {
        setCurrentStep(currentStepObj.key);
      }
    } catch (error) {
      toast.error("Failed to load setup progress");
    } finally {
      setLoading(false);
    }
  }, [stepPathFromUrl, navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const goTo = (stepKey) => {
    const targetStepIndex = getStepIndex(stepKey);
    const maxAllowedIndex = getStepIndex(currentStep); // or based on progress object
    // Simple enforcement: allow going back, but only allow going forward if progress allows
    if (targetStepIndex <= maxAllowedIndex || progress[WIZARD_STEPS[targetStepIndex].dependency]) {
      navigate(getStepByKey(stepKey).route);
    }
  };

  const next = async () => {
    await refresh();
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      navigate(WIZARD_STEPS[currentIndex + 1].route);
    } else {
      navigate("/admin/setup/complete");
    }
  };

  const previous = () => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      navigate(WIZARD_STEPS[currentIndex - 1].route);
    }
  };

  const save = async (apiCall, data) => {
    try {
      setSaving(true);
      const res = await apiCall(data);
      setProgress(res.progress);
      toast.success(res.message || "Saved successfully");
      await next();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save step");
    } finally {
      setSaving(false);
    }
  };

  const complete = async () => {
    try {
      setSaving(true);
      await setupService.completeSetup();
      await refreshUser(); // This triggers the ProtectedRoute to redirect to /admin
      toast.success("Society activated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete setup");
    } finally {
      setSaving(false);
    }
  };

  return {
    currentStep,
    progress,
    loading,
    saving,
    next,
    previous,
    goTo,
    save,
    complete,
    refresh
  };
};
