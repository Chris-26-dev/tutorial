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
  return getLessonRoutes("quickbooks").map((route) => ({ moduleId: route.moduleId, lessonId: route.lessonId }));
}

export default async function QuickBooksLessonPage({ params }: PageProps) {
  const { moduleId, lessonId } = await params;
  const platformInfo = getPlatform("quickbooks");
  const modules = getModules("quickbooks");
  const module = getModule("quickbooks", moduleId);
  const lesson = getLesson("quickbooks", moduleId, lessonId);

  if (!module || !lesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav platform={platformInfo} title={lesson.title} backHref={`/learn/quickbooks/${module.id}`} />
      <LessonClient platform="quickbooks" moduleId={module.id} lesson={lesson} modules={modules} />
    </main>
  );
}
