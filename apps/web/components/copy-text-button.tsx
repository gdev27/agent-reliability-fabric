"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "../lib/cn";

export interface CopyTextButtonProps {
  value: string;
  label?: string;
  successMessage?: string;
  size?: "sm" | "default";
  className?: string;
}

export function CopyTextButton({
  value,
  label = "Copy",
  successMessage,
  size = "sm",
  className
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function onCopy() {
    try {
      if (!window.isSecureContext || !navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage || "Copied to clipboard", {
        description: value.length > 48 ? `${value.slice(0, 48)}…` : value,
        duration: 1800
      });
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Clipboard not available in this context", {
        description: "Manually select and copy the value.",
        duration: 2400
      });
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      aria-label={`${label} ${value}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface text-text-muted transition-colors hover:bg-surface-strong hover:text-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
        size === "sm" ? "h-7 px-2 text-2xs" : "h-9 px-3 text-xs",
        className
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-good" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
