"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PlatformId, SimulatorActionPhase } from "@/types/tutorial";

export interface SimulatorComponentProps {
  activeTarget: string;
  onAction: (target: string, value?: string, phase?: SimulatorActionPhase) => void;
}

export interface SimulatorShellProps extends SimulatorComponentProps {
  platform: PlatformId;
  title: string;
  children: ReactNode;
}

export interface SelectOption {
  label: string;
  value: string;
}

export function targetClass(activeTarget: string, target: string, className?: string) {
  return cn(activeTarget === target ? "target-highlight" : "sim-muted", className);
}

export function ActionButton({
  activeTarget,
  target,
  onAction,
  children,
  className,
  variant = "default"
}: SimulatorComponentProps & {
  target: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}) {
  const isActive = activeTarget === target;

  return (
    <Button type="button" variant={variant} className={targetClass(activeTarget, target, className)} disabled={!isActive} onClick={() => onAction(target, undefined, "commit")}>
      {children}
    </Button>
  );
}

export function ActionInput({
  activeTarget,
  target,
  onAction,
  placeholder,
  className,
  defaultValue = "",
  value,
  onValueChange
}: SimulatorComponentProps & {
  target: string;
  placeholder: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const isActive = activeTarget === target;

  return (
    <Input
      defaultValue={value === undefined ? defaultValue : undefined}
      value={value}
      placeholder={placeholder}
      className={targetClass(activeTarget, target, className)}
      disabled={!isActive}
      onChange={(event) => {
        const nextValue = event.currentTarget.value;
        onValueChange?.(nextValue);
        onAction(target, nextValue, "change");
      }}
      onBlur={(event) => onAction(target, event.currentTarget.value, "commit")}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onAction(target, event.currentTarget.value, "commit");
        }
      }}
    />
  );
}

export function ActionSelect({
  activeTarget,
  target,
  onAction,
  placeholder,
  options,
  className,
  value,
  onValueChange
}: SimulatorComponentProps & {
  target: string;
  placeholder: string;
  options: SelectOption[];
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const isActive = activeTarget === target;

  return (
    <div className={targetClass(activeTarget, target, className)}>
      <Select
        value={value}
        disabled={!isActive}
        onValueChange={(nextValue) => {
          onValueChange?.(nextValue);
          onAction(target, nextValue, "commit");
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SimulatorCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}
