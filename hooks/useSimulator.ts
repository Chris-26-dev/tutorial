"use client";

import { useCallback } from "react";
import type { SimulatorActionPhase, TutorialStep } from "@/types/tutorial";

function normalize(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function useSimulator(step: TutorialStep | undefined, onCorrect: () => void, onIncorrect: () => void) {
  const handleAction = useCallback(
    (target: string, value?: string, phase: SimulatorActionPhase = "commit") => {
      if (!step) {
        onIncorrect();
        return;
      }

      const expectedValue = step.action.expectedValue;
      const targetMatches = target === step.action.target;

      if (!targetMatches) {
        return;
      }

      const valueMatches = expectedValue ? normalize(value) === normalize(expectedValue) : true;

      if (valueMatches) {
        onCorrect();
        return;
      }

      if (phase === "change") {
        return;
      }

      onIncorrect();
    },
    [onCorrect, onIncorrect, step]
  );

  return { handleAction };
}
