'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingStep {
  id: number;
  name: string;
  title: string;
  required: boolean;
}

interface ProgressIndicatorProps {
  steps: OnboardingStep[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 bg-background text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  data-testid={`onboarding-step-${step.id}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                {/* Step title - hidden on mobile, visible on md+ */}
                <span
                  className={cn(
                    'mt-1 hidden text-xs md:block',
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-8 md:w-12 transition-colors',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
