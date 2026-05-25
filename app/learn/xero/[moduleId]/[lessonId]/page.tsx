import { notFound } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { LessonClient } from "@/components/tutorial/LessonClient";
import { getLesson, getLessonRoutes, getModule, getModules, getPlatform } from "@/lib/tutorial";

interface PageProps {
  params: Promise<{
    moduleId: string;
    lessonId: string;
  }>;
}

export function generateStaticParams() {
  return getLessonRoutes("xero").map((route) => ({ moduleId: route.moduleId, lessonId: route.lessonId }));
}

export default async function XeroLessonPage({ params }: PageProps) {
  const { moduleId, lessonId } = await params;
  const platformInfo = getPlatform("xero");
  const modules = getModules("xero");
  const module = getModule("xero", moduleId);
  const lesson = getLesson("xero", moduleId, lessonId);

  if (!module || !lesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav platform={platformInfo} title={lesson.title} backHref={`/learn/xero/${module.id}`} />
      <LessonClient platform="xero" moduleId={module.id} lesson={lesson} modules={modules} />
    </main>
  );
}
