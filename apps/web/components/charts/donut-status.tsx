"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/cn";

export type DonutSegment = {
  key: string;
  label: string;
  value: number;
  tone: "good" | "warn" | "bad" | "info" | "muted" | "primary";
};

const TONE_VAR: Record<DonutSegment["tone"], string> = {
  good: "var(--color-good)",
  warn: "var(--color-warn)",
  bad: "var(--color-bad)",
  info: "var(--color-info)",
  muted: "var(--color-text-muted)",
  primary: "var(--color-primary)"
};

export interface DonutStatusProps {
  segments: DonutSegment[];
  height?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  className?: string;
  ariaLabel?: string;
}

export function DonutStatus({
  segments,
  height = 180,
  centerLabel,
  centerSubLabel,
  className,
  ariaLabel
}: DonutStatusProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const data =
    total === 0 ? [{ key: "empty", label: "No data", value: 1, tone: "muted" as const }] : segments;
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ height }}
      role="img"
      aria-label={ariaLabel ?? "Donut chart"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="86%"
            paddingAngle={2}
            stroke="var(--color-bg)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((segment) => (
              <Cell key={segment.key} fill={TONE_VAR[segment.tone]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerLabel ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-display-sm font-semibold tracking-tight text-text">
            {centerLabel}
          </span>
          {centerSubLabel ? <span className="text-xs text-text-muted">{centerSubLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
