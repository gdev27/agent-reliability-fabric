import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "./ui/badge";

export interface FallbackBannerProps {
  message: string;
  className?: string;
  children?: ReactNode;
}

export function FallbackBanner({ message, className, children }: FallbackBannerProps) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-xl border border-warn/40 bg-warn-soft/80 px-4 py-3 text-warn",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 pattern-stripes opacity-70"
      />
      <div className="relative flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <Badge variant="warning" className="self-start uppercase tracking-wider">
            Demo data
          </Badge>
          <p className="text-sm leading-snug text-text">{message}</p>
          {children}
        </div>
      </div>
    </aside>
  );
}
