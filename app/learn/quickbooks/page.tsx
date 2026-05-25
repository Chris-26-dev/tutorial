import { LearningPathView } from "@/components/pages/LearningPathView";
import { getModules, getPlatform } from "@/lib/tutorial";

export default function QuickBooksLearningPathPage() {
  const platform = getPlatform("quickbooks");
  const modules = getModules("quickbooks");

  return <LearningPathView platform={platform} modules={modules} />;
}
