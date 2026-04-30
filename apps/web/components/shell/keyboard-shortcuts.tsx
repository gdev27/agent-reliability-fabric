"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

type Shortcut = {
  combo: string[];
  label: string;
};

const NAVIGATE_SHORTCUTS: Shortcut[] = [
  { combo: ["g", "d"], label: "Go to dashboard" },
  { combo: ["g", "r"], label: "Go to runs" },
  { combo: ["g", "p"], label: "Go to policies" },
  { combo: ["g", "e"], label: "Go to evidence" },
  { combo: ["g", "s"], label: "Go to settings" }
];

const ACTION_SHORTCUTS: Shortcut[] = [
  { combo: ["Ctrl", "K"], label: "Open command palette" },
  { combo: ["?"], label: "Show this help" },
  { combo: ["Esc"], label: "Close dialogs" }
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("gctl:show-shortcuts", handler);
    return () => window.removeEventListener("gctl:show-shortcuts", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Quick navigation throughout the gctl ops cockpit. Press them anywhere except inside an input.
          </DialogDescription>
        </DialogHeader>
        <ShortcutSection title="Navigate" shortcuts={NAVIGATE_SHORTCUTS} />
        <ShortcutSection title="Actions" shortcuts={ACTION_SHORTCUTS} />
      </DialogContent>
    </Dialog>
  );
}

function ShortcutSection({ title, shortcuts }: { title: string; shortcuts: Shortcut[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      <ul className="flex flex-col gap-1.5">
        {shortcuts.map((shortcut) => (
          <li
            key={`${title}-${shortcut.combo.join("+")}`}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-strong/40 px-3 py-2"
          >
            <span className="text-sm text-text">{shortcut.label}</span>
            <span className="flex items-center gap-1">
              {shortcut.combo.map((key, index) => (
                <span key={`${shortcut.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? <span className="text-2xs text-text-muted">then</span> : null}
                  <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-2xs text-text shadow-sm">
                    {key}
                  </kbd>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
