"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/tutorial/ProgressBar";
import { usePlatformProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import type { PlatformId, TutorialModule } from "@/types/tutorial";

interface SidebarProps {
  platform: PlatformId;
  modules: TutorialModule[];
  activeModuleId?: string;
  activeLessonId?: string;
}

export function Sidebar({ platform, modules, activeModuleId, activeLessonId }: SidebarProps) {
  const platformProgress = usePlatformProgress(platform, modules);

  return (
    <aside className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Overall progress</p>
        <ProgressBar value={platformProgress.percent} />
        <p className="text-sm text-slate-500">{platformProgress.completedLessons} of {platformProgress.totalLessons} lessons complete</p>
      </div>
      <nav className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="space-y-2">
            <Link href={`/learn/${platform}/${module.id}`} className={cn("block rounded-md px-2 py-1 text-sm font-semibold", activeModuleId === module.id ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-50")}>{module.title}</Link>
            <div className="space-y-1 pl-2">
              {module.lessons.map((lesson) => {
                const active = activeLessonId === lesson.id;

                return (
                  <Link key={lesson.id} href={`/learn/${platform}/${module.id}/${lesson.id}`} className={cn("flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm", active ? "bg-sky-50 text-sky-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
                    <span className="truncate">{lesson.title}</span>
                    {active ? <Badge variant="outline">Now</Badge> : <CheckCircle2 className="h-3.5 w-3.5 opacity-30" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
