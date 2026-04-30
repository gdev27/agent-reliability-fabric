import { cn } from "../../lib/cn";

export interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  variant?: "default" | "stacked";
  ariaLabel?: string;
}

export function LogoGlyph({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gctlSafe" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="gctlEsc" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <g transform="translate(16 16) rotate(15) translate(-16 -16)">
        <polygon
          fill="url(#gctlSafe)"
          points="16,3.5 27.5,10 27.5,16 16,16"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
        <polygon
          fill="url(#gctlEsc)"
          points="16,16 27.5,16 27.5,22 16,28.5"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
        <polygon
          fill="currentColor"
          fillOpacity="0.18"
          points="16,3.5 4.5,10 4.5,22 16,28.5 16,16"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
        <line x1="6" y1="13" x2="14" y2="13" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
        <line x1="6" y1="17" x2="14" y2="17" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
        <line x1="6" y1="21" x2="14" y2="21" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  size = 28,
  showWordmark = true,
  variant = "default",
  ariaLabel = "gctl"
}: LogoProps) {
  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-center gap-1 text-text", className)}
        aria-label={ariaLabel}
      >
        <LogoGlyph size={size} className="text-primary" />
        {showWordmark ? (
          <span className="font-display text-sm font-semibold tracking-[-0.02em]">gctl</span>
        ) : null}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2 text-text", className)} aria-label={ariaLabel}>
      <LogoGlyph size={size} className="text-primary" />
      {showWordmark ? (
        <span className="font-display font-semibold tracking-[-0.03em] leading-none">
          <span className="text-text">gctl</span>
        </span>
      ) : null}
    </span>
  );
}
