import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlatformInfo } from "@/types/tutorial";

interface TopNavProps {
  platform?: PlatformInfo;
  title: string;
  backHref?: string;
}

export function TopNav({ platform, title, backHref = "/" }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            {platform ? <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{platform.name}</p> : null}
            <h1 className="truncate text-lg font-semibold text-slate-950">{title}</h1>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </header>
  );
}
