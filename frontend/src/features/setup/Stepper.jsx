import { WIZARD_STEPS, getStepIndex } from "./constants/wizardSteps";

export default function Stepper({ currentStep, progress }) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isCompleted = progress[step.key];
          const isCurrent = step.key === currentStep;
          // Step is accessible if previous step is completed (or it's the first step)
          const isAccessible = index === 0 || progress[WIZARD_STEPS[index - 1].key];

          let stateClass = "border-border text-muted bg-surface";
          if (isCurrent) stateClass = "border-primary text-primary bg-primary/10";
          else if (isCompleted) stateClass = "border-success bg-success text-white";
          else if (isAccessible) stateClass = "border-border text-text bg-surface hover:bg-surface-hover";

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Connector Line */}
              {index !== 0 && (
                <div className="absolute top-4 -left-1/2 w-full h-[2px] -z-10">
                  <div className={`h-full w-full ${isAccessible ? 'bg-success/50' : 'bg-border'}`} />
                </div>
              )}

              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors z-10 ${stateClass}`}>
                {isCompleted && !isCurrent ? "✓" : index + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-text' : 'text-muted'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
