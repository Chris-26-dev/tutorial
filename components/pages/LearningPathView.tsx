import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ModuleCard } from "@/components/tutorial/ModuleCard";
import { ProgressBar } from "@/components/tutorial/ProgressBar";
import type { PlatformInfo, TutorialModule } from "@/types/tutorial";

interface LearningPathViewProps {
  platform: PlatformInfo;
  modules: TutorialModule[];
}

export function LearningPathView({ platform, modules }: LearningPathViewProps) {
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const totalMinutes = modules.reduce((total, module) => total + module.estimatedMinutes, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav platform={platform} title="Learning path" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <Sidebar platform={platform.id} modules={modules} />
        <section className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_240px] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{totalLessons} lessons • {totalMinutes} minutes</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{platform.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{platform.description}</p>
              </div>
              <ProgressBar value={0} label="Start learning" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard key={module.id} platform={platform.id} module={module} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
