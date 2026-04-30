import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Sparkline, type SparklinePoint } from "../charts/sparkline";

export interface KpiCardProps {
  label: string;
  value: string;
  delta?: { direction: "up" | "down" | "flat"; label: string };
  icon?: LucideIcon;
  tone?: "primary" | "good" | "warn" | "bad" | "info";
  href?: string;
  spark?: SparklinePoint[];
  hint?: string;
  className?: string;
}

const TONE_BG: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info"
};

const DELTA_TONE: Record<"up" | "down" | "flat", string> = {
  up: "text-good",
  down: "text-bad",
  flat: "text-text-muted"
};

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "primary",
  href,
  spark = [],
  hint,
  className
}: KpiCardProps) {
  const card = (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-card transition-all",
        href && "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-popover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</span>
        {Icon ? (
          <span className={cn("flex size-7 items-center justify-center rounded-md", TONE_BG[tone])}>
            <Icon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <p className="font-display text-display-md font-semibold leading-none tracking-tight text-text">
        {value}
      </p>
      <div className="flex items-center justify-between gap-2 text-xs">
        {delta ? (
          <span className={cn("inline-flex items-center gap-1", DELTA_TONE[delta.direction])}>
            {delta.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : delta.direction === "down" ? (
              <ArrowDownRight className="size-3.5" />
            ) : (
              <ArrowRight className="size-3.5 opacity-60" />
            )}
            {delta.label}
          </span>
        ) : (
          <span className="text-text-muted">{hint}</span>
        )}
        {href ? (
          <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
        ) : null}
      </div>
      <Sparkline data={spark} tone={tone} ariaLabel={`${label} 24-hour trend`} />
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {card}
      </Link>
    );
  }

  return card;
}
