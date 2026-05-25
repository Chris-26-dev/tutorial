"use client";

import { useMemo } from "react";
import type { TutorialLesson } from "@/types/tutorial";

export function useLessonSteps(lesson: TutorialLesson, activeStepIndex: number) {
  return useMemo(() => {
    const steps = [...lesson.steps].sort((first, second) => first.order - second.order);
    const activeStep = steps[activeStepIndex] ?? steps[0];
    const isLastStep = activeStepIndex >= steps.length - 1;

    return {
      steps,
      activeStep,
      isLastStep,
      totalSteps: steps.length,
      stepNumber: Math.min(activeStepIndex + 1, steps.length)
    };
  }, [activeStepIndex, lesson]);
}
