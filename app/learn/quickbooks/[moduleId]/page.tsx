import { notFound } from "next/navigation";
import { ModuleOverviewView } from "@/components/pages/ModuleOverviewView";
import { getModule, getModules, getPlatform } from "@/lib/tutorial";

interface PageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export function generateStaticParams() {
  return getModules("quickbooks").map((module) => ({ moduleId: module.id }));
}

export default async function QuickBooksModulePage({ params }: PageProps) {
  const { moduleId } = await params;
  const platform = getPlatform("quickbooks");
  const modules = getModules("quickbooks");
  const module = getModule("quickbooks", moduleId);

  if (!module) {
    notFound();
  }

  return <ModuleOverviewView platform={platform} modules={modules} module={module} />;
}
