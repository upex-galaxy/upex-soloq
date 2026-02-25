'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator, type OnboardingStep } from './progress-indicator';

interface OnboardingContainerProps {
  steps: OnboardingStep[];
  currentStep: number;
  title: string;
  description?: string;
  tip?: string;
  children: React.ReactNode;
}

export function OnboardingContainer({
  steps,
  currentStep,
  title,
  description,
  tip,
  children,
}: OnboardingContainerProps) {
  return (
    <div className="w-full max-w-2xl space-y-6" data-testid="onboarding-container">
      {/* Progress indicator */}
      <ProgressIndicator steps={steps} currentStep={currentStep} />

      {/* Main card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription className="text-base">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tip box */}
          {tip && (
            <div
              className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground"
              data-testid="onboarding-tip"
            >
              <span className="font-medium">Tip:</span> {tip}
            </div>
          )}

          {/* Step content */}
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
