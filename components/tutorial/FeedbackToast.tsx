"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import type { FeedbackMessage } from "@/types/tutorial";

interface FeedbackToastProps {
  feedback?: FeedbackMessage;
}

export function FeedbackToast({ feedback }: FeedbackToastProps) {
  useEffect(() => {
    if (!feedback) {
      return;
    }

    toast({
      title: feedback.kind === "correct" ? "Correct" : feedback.kind === "incorrect" ? "Try again" : "Tip",
      description: feedback.message,
      variant: feedback.kind === "correct" ? "success" : feedback.kind === "incorrect" ? "destructive" : "default"
    });
  }, [feedback]);

  return null;
}
