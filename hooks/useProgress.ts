"use client";

import { useEffect, useMemo } from "react";
import { useProgressStore } from "@/stores/progressStore";
import type { PlatformId, TutorialModule } from "@/types/tutorial";

export function useProgress() {
  const hydrated = useProgressStore((state) => state.hydrated);
  const hydrate = useProgressStore((state) => state.hydrate);
  const progress = useProgressStore((state) => state.progress);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  return { hydrated, progress };
}

export function useModuleProgress(platform: PlatformId, module: TutorialModule) {
  const { progress } = useProgress();

  return useMemo(() => {
    const lessons = module.lessons;
    const moduleProgress = progress[platform][module.id] ?? {};
    const completedLessons = lessons.filter((lesson) => moduleProgress[lesson.id]?.completed).length;
    const percent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

    return {
      completedLessons,
      totalLessons: lessons.length,
      percent
    };
  }, [module, platform, progress]);
}

export function usePlatformProgress(platform: PlatformId, modules: TutorialModule[]) {
  const { progress } = useProgress();

  return useMemo(() => {
    const lessons = modules.flatMap((module) => module.lessons.map((lesson) => ({ moduleId: module.id, lessonId: lesson.id })));
    const completedLessons = lessons.filter(({ moduleId, lessonId }) => progress[platform][moduleId]?.[lessonId]?.completed).length;
    const percent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

    return {
      completedLessons,
      totalLessons: lessons.length,
      percent
    };
  }, [modules, platform, progress]);
}
