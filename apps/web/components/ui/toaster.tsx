"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "../theme-provider";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group rounded-lg border border-border-strong bg-surface text-text shadow-popover",
          description: "text-text-muted",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground"
        }
      }}
    />
  );
}
