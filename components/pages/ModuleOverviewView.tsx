import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { LessonCard } from "@/components/tutorial/LessonCard";
import type { PlatformInfo, TutorialModule } from "@/types/tutorial";

interface ModuleOverviewViewProps {
  platform: PlatformInfo;
  modules: TutorialModule[];
  module: TutorialModule;
}

export function ModuleOverviewView({ platform, modules, module }: ModuleOverviewViewProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav platform={platform} title={module.title} backHref={`/learn/${platform.id}`} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <Sidebar platform={platform.id} modules={modules} activeModuleId={module.id} />
        <section className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{module.lessons.length} lessons • {module.estimatedMinutes} minutes</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{module.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{module.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {module.lessons.map((lesson) => (
              <LessonCard key={lesson.id} platform={platform.id} moduleId={module.id} lesson={lesson} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
