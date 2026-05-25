"use client";

import { ArrowLeft, ArrowRight, Lightbulb, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/tutorial/ProgressBar";
import { cn } from "@/lib/utils";
import type { FeedbackMessage, TutorialStep } from "@/types/tutorial";

interface StepGuideProps {
  steps: TutorialStep[];
  activeStep: TutorialStep;
  stepNumber: number;
  totalSteps: number;
  completedStepIds: string[];
  feedback?: FeedbackMessage;
  canAdvance: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepGuide({
  steps,
  activeStep,
  stepNumber,
  totalSteps,
  completedStepIds,
  feedback,
  canAdvance,
  isLastStep,
  onBack,
  onNext,
  onSkip
}: StepGuideProps) {
  const progressValue = Math.round(((stepNumber - 1 + (canAdvance ? 1 : 0)) / totalSteps) * 100);

  return (
    <Card className="h-full rounded-lg">
      <CardHeader className="space-y-4">
        <ProgressBar value={progressValue} label={`Step ${stepNumber} of ${totalSteps}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{activeStep.action.type} action</p>
          <CardTitle className="mt-1 text-xl">{activeStep.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex h-[calc(100%-132px)] flex-col gap-5">
        <div className="rounded-lg border bg-slate-50 p-4">
          <div className="flex gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <p className="text-sm leading-6 text-slate-700">{activeStep.instruction}</p>
          </div>
        </div>

        {feedback ? (
          <div className={cn("rounded-md border p-3 text-sm", feedback.kind === "correct" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : feedback.kind === "incorrect" ? "border-red-200 bg-red-50 text-red-900" : "border-sky-200 bg-sky-50 text-sky-900")}>
            {feedback.message}
          </div>
        ) : null}

        <div className="space-y-2">
          {steps.map((step) => {
            const completed = completedStepIds.includes(step.id);
            const active = step.id === activeStep.id;

            return (
              <div key={step.id} className={cn("flex items-center gap-3 rounded-md border px-3 py-2 text-sm", active ? "border-sky-300 bg-sky-50 text-sky-950" : "bg-white text-slate-600", completed && "border-emerald-200 bg-emerald-50 text-emerald-950")}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm">{step.order}</span>
                <span className="truncate">{step.title}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-auto grid gap-2">
          <Button type="button" onClick={onNext} disabled={!canAdvance}>
            {isLastStep ? "Go to quiz" : "Next step"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={stepNumber === 1}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="button" variant="ghost" onClick={onSkip}>
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
