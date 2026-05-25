"use client";

import { create } from "zustand";
import type { FeedbackMessage } from "@/types/tutorial";

interface TutorialStore {
  activeStepIndex: number;
  completedStepIds: string[];
  feedback?: FeedbackMessage;
  quizComplete: boolean;
  setActiveStepIndex: (stepIndex: number) => void;
  completeStep: (stepId: string) => void;
  setFeedback: (feedback?: FeedbackMessage) => void;
  setQuizComplete: (complete: boolean) => void;
  resetLessonState: (stepIndex?: number, completedStepIds?: string[]) => void;
}

export const useTutorialStore = create<TutorialStore>((set) => ({
  activeStepIndex: 0,
  completedStepIds: [],
  feedback: undefined,
  quizComplete: false,
  setActiveStepIndex: (stepIndex) => set({ activeStepIndex: stepIndex, feedback: undefined }),
  completeStep: (stepId) =>
    set((state) => ({
      completedStepIds: state.completedStepIds.includes(stepId)
        ? state.completedStepIds
        : [...state.completedStepIds, stepId]
    })),
  setFeedback: (feedback) => set({ feedback }),
  setQuizComplete: (quizComplete) => set({ quizComplete }),
  resetLessonState: (stepIndex = 0, completedStepIds = []) =>
    set({
      activeStepIndex: stepIndex,
      completedStepIds,
      feedback: undefined,
      quizComplete: false
    })
}));
