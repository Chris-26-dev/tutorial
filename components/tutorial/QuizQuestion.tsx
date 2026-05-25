"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TutorialQuiz } from "@/types/tutorial";

interface QuizQuestionProps {
  quiz: TutorialQuiz;
  completionMessage: string;
  onComplete: (score: number) => void;
}

export function QuizQuestion({ quiz, completionMessage, onComplete }: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const [isCorrect, setIsCorrect] = useState<boolean>();
  const [completed, setCompleted] = useState(false);

  const submitAnswer = () => {
    const correct = selectedAnswer === quiz.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setCompleted(true);
      onComplete(100);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg">Knowledge check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium text-slate-900">{quiz.question}</p>
        <div className="grid gap-2">
          {quiz.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={completed}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                selectedAnswer === option && "border-sky-400 bg-sky-50",
                completed && option === quiz.correctAnswer && "border-emerald-400 bg-emerald-50"
              )}
              onClick={() => setSelectedAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {isCorrect === false ? (
          <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{quiz.explanation}</span>
          </div>
        ) : null}
        {completed ? (
          <div className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{completionMessage}</span>
          </div>
        ) : null}
        <Button type="button" onClick={submitAnswer} disabled={!selectedAnswer || completed}>
          {completed ? "Completed" : "Submit answer"}
        </Button>
      </CardContent>
    </Card>
  );
}
