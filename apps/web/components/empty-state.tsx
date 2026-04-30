import Link from "next/link";
import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "./ui/button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  ctaHref?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  children,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-strong text-text-muted">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-text">{title}</h3>
      <p className="max-w-md text-balance text-sm text-text-muted">{description}</p>
      {ctaHref && ctaLabel ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button asChild variant="ghost">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
