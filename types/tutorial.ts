export type PlatformId = "quickbooks" | "xero";

export type LessonType = "interactive" | "guided";

export type TutorialActionType = "click" | "select" | "input" | "form";

export type SimulatorActionPhase = "change" | "commit";

export type SimulatorState =
  | "dashboard"
  | "new-menu-open"
  | "invoice-form"
  | "invoice-review"
  | "payment-form"
  | "credit-memo-form"
  | "expense-form"
  | "receipt-upload"
  | "expense-categorization"
  | "bill-payment"
  | "bank-connect"
  | "bank-feed"
  | "bank-reconciliation"
  | "transaction-match"
  | "payroll-employee"
  | "payroll-run"
  | "payroll-taxes"
  | "leave-management"
  | "reports-list"
  | "report-detail"
  | "report-customize"
  | "chart-of-accounts"
  | "company-setup";

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  type: LessonType;
}

export interface TutorialModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  estimatedMinutes: number;
  lessons: LessonSummary[];
}

export interface ModulesFile {
  platform: PlatformId;
  modules: TutorialModule[];
}

export interface TutorialFeedback {
  correct: string;
  incorrect: string;
}

export interface TutorialAction {
  type: TutorialActionType;
  target: string;
  expectedValue?: string;
  feedback: TutorialFeedback;
}

export interface TutorialStep {
  id: string;
  order: number;
  title: string;
  instruction: string;
  highlightTarget: string;
  action: TutorialAction;
  simulatorState: SimulatorState;
}

export interface TutorialQuiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TutorialLesson {
  id: string;
  title: string;
  platform: PlatformId;
  module: string;
  type: LessonType;
  steps: TutorialStep[];
  quiz: TutorialQuiz;
  completionMessage: string;
}

export interface LessonsFile {
  platform: PlatformId;
  module: string;
  lessons: TutorialLesson[];
}

export interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  score?: number;
  stepsCompleted: number;
  totalSteps: number;
  lastStepIndex?: number;
}

export type ModuleProgress = Record<string, LessonProgress>;

export type PlatformProgress = Record<string, ModuleProgress>;

export interface UserProgress {
  quickbooks: PlatformProgress;
  xero: PlatformProgress;
}

export type FeedbackKind = "correct" | "incorrect" | "info";

export interface FeedbackMessage {
  kind: FeedbackKind;
  message: string;
}

export interface PlatformTheme {
  id: PlatformId;
  name: string;
  accent: string;
  sidebar: string;
  surface: string;
}

export interface PlatformInfo extends PlatformTheme {
  description: string;
  href: string;
}
