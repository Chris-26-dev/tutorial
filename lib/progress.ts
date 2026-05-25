import type { LessonProgress, PlatformId, UserProgress } from "@/types/tutorial";

export const progressStorageKey = "accounting-tutorial-progress";

export const emptyProgress: UserProgress = {
  quickbooks: {},
  xero: {}
};

function cloneEmptyProgress(): UserProgress {
  return {
    quickbooks: {},
    xero: {}
  };
}

export function readProgress(): UserProgress {
  if (typeof window === "undefined") {
    return cloneEmptyProgress();
  }

  const rawValue = window.localStorage.getItem(progressStorageKey);

  if (!rawValue) {
    return cloneEmptyProgress();
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<UserProgress>;

    return {
      quickbooks: parsed.quickbooks ?? {},
      xero: parsed.xero ?? {}
    };
  } catch {
    return cloneEmptyProgress();
  }
}

export function writeProgress(progress: UserProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
}

export function getLessonProgress(
  progress: UserProgress,
  platform: PlatformId,
  moduleId: string,
  lessonId: string
): LessonProgress | undefined {
  return progress[platform][moduleId]?.[lessonId];
}

export function setLessonProgress(
  progress: UserProgress,
  platform: PlatformId,
  moduleId: string,
  lessonId: string,
  lessonProgress: LessonProgress
): UserProgress {
  return {
    ...progress,
    [platform]: {
      ...progress[platform],
      [moduleId]: {
        ...(progress[platform][moduleId] ?? {}),
        [lessonId]: lessonProgress
      }
    }
  };
}

export function resetProgress(): UserProgress {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(progressStorageKey);
  }

  return cloneEmptyProgress();
}
