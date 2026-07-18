import { Routes, Route, Navigate } from "react-router-dom";
import { useSetupWizard } from "./hooks/useSetupWizard";
import SetupLayout from "./SetupLayout";
import { LoadingScreen } from "../../components/feedback";

import SocietyProfileStep from "./steps/SocietyProfileStep";
import TowerStep from "./steps/TowerStep";
import FlatStep from "./steps/FlatStep";
import AmenityStep from "./steps/AmenityStep";
import StaffStep from "./steps/StaffStep";
import CompletionStep from "./steps/CompletionStep";

export default function SetupWizard() {
  const { currentStep, progress, loading, save, complete, saving, previous } = useSetupWizard();

  if (loading || !currentStep) {
    return <LoadingScreen fullScreen={true} message="Loading setup..." />;
  }

  // Pass down standard props to all steps
  const stepProps = {
    progress,
    saving,
    save,
    complete,
    previous
  };

  return (
    <SetupLayout currentStep={currentStep} progress={progress}>
      <Routes>
        <Route path="profile" element={<SocietyProfileStep {...stepProps} />} />
        <Route path="towers" element={<TowerStep {...stepProps} />} />
        <Route path="flats" element={<FlatStep {...stepProps} />} />
        <Route path="amenities" element={<AmenityStep {...stepProps} />} />
        <Route path="staff" element={<StaffStep {...stepProps} />} />
        <Route path="complete" element={<CompletionStep {...stepProps} />} />
        <Route path="*" element={<Navigate to={currentStep === "complete" ? "complete" : currentStep} replace />} />
      </Routes>
    </SetupLayout>
  );
}
