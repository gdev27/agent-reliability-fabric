"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/cn";

export type AreaTrendPoint = { label: string; value: number };

export interface AreaTrendProps {
  data: AreaTrendPoint[];
  height?: number;
  tone?: "primary" | "good" | "warn" | "bad" | "info";
  className?: string;
  unit?: string;
  ariaLabel?: string;
}

const TONE_VAR: Record<NonNullable<AreaTrendProps["tone"]>, string> = {
  primary: "var(--color-primary)",
  good: "var(--color-good)",
  warn: "var(--color-warn)",
  bad: "var(--color-bad)",
  info: "var(--color-info)"
};

export function AreaTrend({
  data,
  height = 220,
  tone = "primary",
  className,
  unit,
  ariaLabel
}: AreaTrendProps) {
  const stroke = TONE_VAR[tone];

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel ?? "Area trend chart"}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="areaTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.4} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "8px 10px",
              fontSize: 12,
              color: "var(--color-text)"
            }}
            labelStyle={{ color: "var(--color-text-muted)", marginBottom: 2 }}
            formatter={(value: number) => [unit ? `${value}${unit}` : value, "Value"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill="url(#areaTrend)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
