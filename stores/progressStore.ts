"use client";

import { create } from "zustand";
import {
  getLessonProgress,
  readProgress,
  resetProgress as resetStoredProgress,
  setLessonProgress,
  writeProgress
} from "@/lib/progress";
import type { LessonProgress, PlatformId, UserProgress } from "@/types/tutorial";

interface ProgressStore {
  hydrated: boolean;
  progress: UserProgress;
  hydrate: () => void;
  getLesson: (platform: PlatformId, moduleId: string, lessonId: string) => LessonProgress | undefined;
  saveLesson: (platform: PlatformId, moduleId: string, lessonId: string, progress: LessonProgress) => void;
  markStep: (platform: PlatformId, moduleId: string, lessonId: string, stepIndex: number, totalSteps: number) => void;
  completeLesson: (platform: PlatformId, moduleId: string, lessonId: string, totalSteps: number, score: number) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  hydrated: false,
  progress: {
    quickbooks: {},
    xero: {}
  },
  hydrate: () => {
    set({ progress: readProgress(), hydrated: true });
  },
  getLesson: (platform, moduleId, lessonId) => getLessonProgress(get().progress, platform, moduleId, lessonId),
  saveLesson: (platform, moduleId, lessonId, lessonProgress) => {
    const nextProgress = setLessonProgress(get().progress, platform, moduleId, lessonId, lessonProgress);
    writeProgress(nextProgress);
    set({ progress: nextProgress });
  },
  markStep: (platform, moduleId, lessonId, stepIndex, totalSteps) => {
    const current = getLessonProgress(get().progress, platform, moduleId, lessonId);
    const stepsCompleted = Math.max(current?.stepsCompleted ?? 0, Math.min(stepIndex + 1, totalSteps));
    const nextLessonProgress: LessonProgress = {
      completed: current?.completed ?? false,
      completedAt: current?.completedAt,
      score: current?.score,
      stepsCompleted,
      totalSteps,
      lastStepIndex: Math.min(stepIndex + 1, Math.max(totalSteps - 1, 0))
    };

    get().saveLesson(platform, moduleId, lessonId, nextLessonProgress);
  },
  completeLesson: (platform, moduleId, lessonId, totalSteps, score) => {
    get().saveLesson(platform, moduleId, lessonId, {
      completed: true,
      completedAt: new Date().toISOString(),
      score,
      stepsCompleted: totalSteps,
      totalSteps,
      lastStepIndex: Math.max(totalSteps - 1, 0)
    });
  },
  resetProgress: () => {
    set({ progress: resetStoredProgress(), hydrated: true });
  }
}));
