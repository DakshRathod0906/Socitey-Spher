import Stepper from "./Stepper";

export default function SetupLayout({ children, currentStep, progress }) {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text">Society Setup</h1>
          <p className="text-muted mt-2">
            Complete these steps to activate your society platform.
          </p>
        </div>

        <div className="bg-surface border border-border shadow-sm rounded-xl p-8 mb-6">
          <Stepper currentStep={currentStep} progress={progress} />
          
          <div className="mt-8 border-t border-border pt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
