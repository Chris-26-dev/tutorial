import platformsData from "@/data/platforms.json";
import quickBooksModulesData from "@/data/quickbooks/modules.json";
import quickBooksBankingLessons from "@/data/quickbooks/lessons/banking.json";
import quickBooksExpensesLessons from "@/data/quickbooks/lessons/expenses.json";
import quickBooksGettingStartedLessons from "@/data/quickbooks/lessons/getting-started.json";
import quickBooksInvoicingLessons from "@/data/quickbooks/lessons/invoicing.json";
import quickBooksPayrollLessons from "@/data/quickbooks/lessons/payroll.json";
import quickBooksReportsLessons from "@/data/quickbooks/lessons/reports.json";
import xeroModulesData from "@/data/xero/modules.json";
import xeroBankingLessons from "@/data/xero/lessons/banking.json";
import xeroExpensesLessons from "@/data/xero/lessons/expenses.json";
import xeroGettingStartedLessons from "@/data/xero/lessons/getting-started.json";
import xeroInvoicingLessons from "@/data/xero/lessons/invoicing.json";
import xeroPayrollLessons from "@/data/xero/lessons/payroll.json";
import xeroReportsLessons from "@/data/xero/lessons/reports.json";
import type {
  LessonSummary,
  LessonsFile,
  ModulesFile,
  PlatformId,
  PlatformInfo,
  TutorialLesson,
  TutorialModule
} from "@/types/tutorial";

const platforms = platformsData as PlatformInfo[];

const modulesByPlatform: Record<PlatformId, ModulesFile> = {
  quickbooks: quickBooksModulesData as ModulesFile,
  xero: xeroModulesData as ModulesFile
};

const lessonsByPlatform: Record<PlatformId, Record<string, LessonsFile>> = {
  quickbooks: {
    "getting-started": quickBooksGettingStartedLessons as LessonsFile,
    invoicing: quickBooksInvoicingLessons as LessonsFile,
    expenses: quickBooksExpensesLessons as LessonsFile,
    banking: quickBooksBankingLessons as LessonsFile,
    payroll: quickBooksPayrollLessons as LessonsFile,
    reports: quickBooksReportsLessons as LessonsFile
  },
  xero: {
    "getting-started": xeroGettingStartedLessons as LessonsFile,
    invoicing: xeroInvoicingLessons as LessonsFile,
    expenses: xeroExpensesLessons as LessonsFile,
    banking: xeroBankingLessons as LessonsFile,
    payroll: xeroPayrollLessons as LessonsFile,
    reports: xeroReportsLessons as LessonsFile
  }
};

export function getPlatforms(): PlatformInfo[] {
  return platforms;
}

export function isPlatformId(value: string): value is PlatformId {
  return value === "quickbooks" || value === "xero";
}

export function getPlatform(platform: PlatformId): PlatformInfo {
  const info = platforms.find((item) => item.id === platform);

  if (!info) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  return info;
}

export function getModules(platform: PlatformId): TutorialModule[] {
  return [...modulesByPlatform[platform].modules].sort((first, second) => first.order - second.order);
}

export function getModule(platform: PlatformId, moduleId: string): TutorialModule | undefined {
  return getModules(platform).find((module) => module.id === moduleId);
}

export function getLessonSummaries(platform: PlatformId, moduleId: string): LessonSummary[] {
  const summaries = getModule(platform, moduleId)?.lessons ?? [];

  return [...summaries].sort((first, second) => first.order - second.order);
}

export function getLessons(platform: PlatformId, moduleId: string): TutorialLesson[] {
  const lessons = lessonsByPlatform[platform][moduleId]?.lessons ?? [];

  return [...lessons].sort((first, second) => {
    const firstSummary = getLessonSummaries(platform, moduleId).find((lesson) => lesson.id === first.id);
    const secondSummary = getLessonSummaries(platform, moduleId).find((lesson) => lesson.id === second.id);

    return (firstSummary?.order ?? 0) - (secondSummary?.order ?? 0);
  }) ?? [];
}

export function getLesson(platform: PlatformId, moduleId: string, lessonId: string): TutorialLesson | undefined {
  return getLessons(platform, moduleId).find((lesson) => lesson.id === lessonId);
}

export function getAllLessons(platform: PlatformId): TutorialLesson[] {
  return getModules(platform).flatMap((module) => getLessons(platform, module.id));
}

export function getLessonNavigation(platform: PlatformId, moduleId: string, lessonId: string) {
  const lessons = getLessons(platform, moduleId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  return {
    previous: currentIndex > 0 ? lessons[currentIndex - 1] : undefined,
    next: currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : undefined
  };
}

export function getPlatformRoutes() {
  return getPlatforms().map((platform) => ({ platform: platform.id }));
}

export function getModuleRoutes(platform: PlatformId) {
  return getModules(platform).map((module) => ({ platform, moduleId: module.id }));
}

export function getLessonRoutes(platform: PlatformId) {
  return getModules(platform).flatMap((module) =>
    getLessons(platform, module.id).map((lesson) => ({ platform, moduleId: module.id, lessonId: lesson.id }))
  );
}
