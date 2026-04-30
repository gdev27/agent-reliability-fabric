"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/cn";

export type SparklinePoint = { value: number; label?: string };

export interface SparklineProps {
  data: SparklinePoint[];
  tone?: "primary" | "good" | "warn" | "bad" | "info" | "muted";
  height?: number;
  className?: string;
  ariaLabel?: string;
}

const TONE_VAR: Record<NonNullable<SparklineProps["tone"]>, string> = {
  primary: "var(--color-primary)",
  good: "var(--color-good)",
  warn: "var(--color-warn)",
  bad: "var(--color-bad)",
  info: "var(--color-info)",
  muted: "var(--color-text-muted)"
};

export function Sparkline({ data, tone = "primary", height = 56, className, ariaLabel }: SparklineProps) {
  const stroke = TONE_VAR[tone];
  const reactId = useId();
  const id = `spark-${tone}-${reactId.replace(/:/g, "")}`;

  if (data.length === 0) {
    return (
      <div
        className={cn("h-14 w-full rounded-md bg-muted/60", className)}
        style={{ height }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn("relative w-full", className)}
      role="img"
      aria-label={ariaLabel ?? "Trend sparkline"}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.45} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
