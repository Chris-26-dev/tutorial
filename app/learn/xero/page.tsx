import { LearningPathView } from "@/components/pages/LearningPathView";
import { getModules, getPlatform } from "@/lib/tutorial";

export default function XeroLearningPathPage() {
  const platform = getPlatform("xero");
  const modules = getModules("xero");

  return <LearningPathView platform={platform} modules={modules} />;
}
