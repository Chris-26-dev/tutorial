"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedbackToast } from "@/components/tutorial/FeedbackToast";
import { QuizQuestion } from "@/components/tutorial/QuizQuestion";
import { SimulatedUI } from "@/components/tutorial/SimulatedUI";
import { StepGuide } from "@/components/tutorial/StepGuide";
import { useLessonSteps } from "@/hooks/useLessonSteps";
import { useProgress } from "@/hooks/useProgress";
import { useSimulator } from "@/hooks/useSimulator";
import { useProgressStore } from "@/stores/progressStore";
import { useTutorialStore } from "@/stores/tutorialStore";
import type { PlatformId, TutorialLesson, TutorialModule } from "@/types/tutorial";

interface LessonClientProps {
  platform: PlatformId;
  moduleId: string;
  lesson: TutorialLesson;
  modules: TutorialModule[];
}

export function LessonClient({ platform, moduleId, lesson, modules }: LessonClientProps) {
  const { hydrated, progress } = useProgress();
  const activeStepIndex = useTutorialStore((state) => state.activeStepIndex);
  const completedStepIds = useTutorialStore((state) => state.completedStepIds);
  const feedback = useTutorialStore((state) => state.feedback);
  const setActiveStepIndex = useTutorialStore((state) => state.setActiveStepIndex);
  const completeStep = useTutorialStore((state) => state.completeStep);
  const setFeedback = useTutorialStore((state) => state.setFeedback);
  const resetLessonState = useTutorialStore((state) => state.resetLessonState);
  const markStep = useProgressStore((state) => state.markStep);
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const [showQuiz, setShowQuiz] = useState(false);
  const [initializedKey, setInitializedKey] = useState<string>();
  const { steps, activeStep, isLastStep, totalSteps, stepNumber } = useLessonSteps(lesson, activeStepIndex);
  const lessonKey = `${platform}:${moduleId}:${lesson.id}`;
  const savedProgress = progress[platform][moduleId]?.[lesson.id];

  useEffect(() => {
    if (!hydrated || initializedKey === lessonKey) {
      return;
    }

    const restoredCompletedStepIds = steps.slice(0, savedProgress?.stepsCompleted ?? 0).map((step) => step.id);

    resetLessonState(savedProgress?.completed ? 0 : savedProgress?.lastStepIndex ?? 0, restoredCompletedStepIds);
    setShowQuiz(savedProgress?.completed ?? false);
    setInitializedKey(lessonKey);
  }, [hydrated, initializedKey, lessonKey, resetLessonState, savedProgress?.completed, savedProgress?.lastStepIndex, savedProgress?.stepsCompleted, steps]);

  const currentStepComplete = useMemo(() => completedStepIds.includes(activeStep.id), [activeStep.id, completedStepIds]);

  const handleCorrect = useCallback(() => {
    if (currentStepComplete) {
      return;
    }

    completeStep(activeStep.id);
    setFeedback({ kind: "correct", message: activeStep.action.feedback.correct });
    markStep(platform, moduleId, lesson.id, activeStepIndex, totalSteps);
  }, [activeStep, activeStepIndex, completeStep, currentStepComplete, lesson.id, markStep, moduleId, platform, setFeedback, totalSteps]);

  const handleIncorrect = useCallback(() => {
    if (currentStepComplete) {
      return;
    }

    setFeedback({ kind: "incorrect", message: activeStep.action.feedback.incorrect });
  }, [activeStep, currentStepComplete, setFeedback]);

  const { handleAction } = useSimulator(activeStep, handleCorrect, handleIncorrect);

  const goNext = () => {
    setFeedback(undefined);

    if (isLastStep) {
      setShowQuiz(true);
      return;
    }

    setActiveStepIndex(activeStepIndex + 1);
  };

  const goBack = () => {
    setFeedback(undefined);
    setShowQuiz(false);
    setActiveStepIndex(Math.max(activeStepIndex - 1, 0));
  };

  const skipStep = () => {
    setFeedback({ kind: "info", message: "Step skipped. It will remain incomplete until you practice it later." });

    if (isLastStep) {
      setShowQuiz(true);
      return;
    }

    setActiveStepIndex(activeStepIndex + 1);
  };

  const finishLesson = (score: number) => {
    completeLesson(platform, moduleId, lesson.id, totalSteps, score);
  };

  return (
    <>
      <FeedbackToast feedback={feedback} />
      <LessonLayout
        sidebar={<Sidebar platform={platform} modules={modules} activeModuleId={moduleId} activeLessonId={lesson.id} />}
        simulator={<SimulatedUI platform={platform} simulatorState={activeStep.simulatorState} activeTarget={activeStep.highlightTarget} onAction={handleAction} />}
        guide={
          showQuiz ? (
            <QuizQuestion quiz={lesson.quiz} completionMessage={lesson.completionMessage} onComplete={finishLesson} />
          ) : (
            <StepGuide
              steps={steps}
              activeStep={activeStep}
              stepNumber={stepNumber}
              totalSteps={totalSteps}
              completedStepIds={completedStepIds}
              feedback={feedback}
              canAdvance={currentStepComplete}
              isLastStep={isLastStep}
              onBack={goBack}
              onNext={goNext}
              onSkip={skipStep}
            />
          )
        }
      />
    </>
  );
}
