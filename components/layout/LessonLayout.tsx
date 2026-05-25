import type { ReactNode } from "react";

interface LessonLayoutProps {
  sidebar: ReactNode;
  simulator: ReactNode;
  guide: ReactNode;
}

export function LessonLayout({ sidebar, simulator, guide }: LessonLayoutProps) {
  return (
    <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <div className="hidden lg:block">{sidebar}</div>
      <div className="grid min-h-[720px] gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <section className="min-w-0">{simulator}</section>
        <section className="min-w-0">{guide}</section>
      </div>
    </div>
  );
}
