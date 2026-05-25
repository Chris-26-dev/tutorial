"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/tutorial/ProgressBar";
import { useProgress } from "@/hooks/useProgress";
import type { LessonSummary, PlatformId } from "@/types/tutorial";

interface LessonCardProps {
  platform: PlatformId;
  moduleId: string;
  lesson: LessonSummary;
}

export function LessonCard({ platform, moduleId, lesson }: LessonCardProps) {
  const { progress } = useProgress();
  const lessonProgress = progress[platform][moduleId]?.[lesson.id];
  const percent = lessonProgress?.totalSteps ? Math.round((lessonProgress.stepsCompleted / lessonProgress.totalSteps) * 100) : 0;
  const completed = lessonProgress?.completed ?? false;

  return (
    <Card className="rounded-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-2">
          <CardTitle className="text-lg">{lesson.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
        </div>
        {completed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <PlayCircle className="h-5 w-5 shrink-0 text-slate-400" />}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{lesson.type}</Badge>
          <span className="inline-flex items-center gap-1 text-sm text-slate-500"><Clock3 className="h-4 w-4" /> {lesson.estimatedMinutes} min</span>
        </div>
        <ProgressBar value={completed ? 100 : percent} label="Lesson progress" />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={completed ? "secondary" : "default"}>
          <Link href={`/learn/${platform}/${moduleId}/${lesson.id}`}>{completed ? "Review" : percent > 0 ? "Resume" : "Start lesson"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
