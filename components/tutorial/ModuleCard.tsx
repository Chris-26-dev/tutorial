"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, FileText, Landmark, LayoutDashboard, Receipt, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/tutorial/ProgressBar";
import { useModuleProgress } from "@/hooks/useProgress";
import type { PlatformId, TutorialModule } from "@/types/tutorial";

const icons = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  receipt: Receipt,
  landmark: Landmark,
  users: Users,
  "bar-chart-3": BarChart3
};

interface ModuleCardProps {
  platform: PlatformId;
  module: TutorialModule;
}

export function ModuleCard({ platform, module }: ModuleCardProps) {
  const Icon = icons[module.icon as keyof typeof icons] ?? LayoutDashboard;
  const progress = useModuleProgress(platform, module);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="h-full rounded-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-800">
              <Icon className="h-5 w-5" />
            </div>
            <Badge variant={progress.percent === 100 ? "default" : "secondary"}>{progress.completedLessons}/{progress.totalLessons}</Badge>
          </div>
          <CardTitle className="text-lg">{module.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="min-h-12 text-sm text-muted-foreground">{module.description}</p>
          <ProgressBar value={progress.percent} label="Module progress" />
          <p className="text-xs font-medium uppercase tracking-normal text-slate-500">{module.estimatedMinutes} min</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/learn/${platform}/${module.id}`}>{progress.percent > 0 ? "Resume" : "Start"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
