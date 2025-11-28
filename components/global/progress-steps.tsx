import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { num: 1, label: "Start" },
  { num: 2, label: "Upload" },
  { num: 3, label: "Edit" },
  { num: 4, label: "Review" },
  { num: 5, label: "Pay & Print" },
];

export const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  return (
    <div className="bg-white border-b border-border py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center">
                <div
                  className={`
        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
        transition-all duration-300
        ${
          step.num <= currentStep
            ? "bg-primary text-white"
            : "bg-[#F4F4F5] text-[#71717A]"
        }
      `}
                >
                  {step.num < currentStep ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`
        mt-2 text-sm font-medium whitespace-nowrap
        ${step.num <= currentStep ? "text-foreground" : "text-[#71717A]"}
      `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`
        w-12 h-0.5 mx-3 mb-6 transition-all duration-300
        ${step.num < currentStep ? "bg-primary" : "bg-[#F4F4F5]"}
      `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
