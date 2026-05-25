import { notFound } from "next/navigation";
import { ModuleOverviewView } from "@/components/pages/ModuleOverviewView";
import { getModule, getModules, getPlatform } from "@/lib/tutorial";

interface PageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export function generateStaticParams() {
  return getModules("xero").map((module) => ({ moduleId: module.id }));
}

export default async function XeroModulePage({ params }: PageProps) {
  const { moduleId } = await params;
  const platform = getPlatform("xero");
  const modules = getModules("xero");
  const module = getModule("xero", moduleId);

  if (!module) {
    notFound();
  }

  return <ModuleOverviewView platform={platform} modules={modules} module={module} />;
}
