"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  Eye,
  GaugeCircle,
  Github,
  HeartPulse,
  Lightbulb,
  Moon,
  Search as SearchIcon,
  Sun,
  type LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from "../ui/command";
import { cn } from "../../lib/cn";
import { useTheme } from "../theme-provider";
import { NAV_GROUPS } from "./nav-config";

export interface CommandPaletteProps {
  className?: string;
}

export function CommandPaletteTrigger({ className }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [recentRunQuery, setRecentRunQuery] = useState("");
  const router = useRouter();
  const { resolvedTheme, setTheme, toggleTheme } = useTheme();

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const ThemeIcon: LucideIcon = resolvedTheme === "dark" ? Sun : Moon;
  const trimmedRunQuery = recentRunQuery.trim();
  const shouldShowRunSearch = trimmedRunQuery.length > 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Open command palette (Ctrl+K)"
        className={cn(
          "h-9 gap-3 px-3 text-text-muted hover:text-text justify-between min-w-[14rem]",
          className
        )}
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          <span className="hidden sm:inline">Search runs, policies, actions</span>
          <span className="sm:hidden">Search</span>
        </span>
        <kbd className="ml-auto hidden items-center gap-1 rounded border border-border-strong bg-surface px-1.5 py-0.5 font-mono text-2xs sm:inline-flex">
          <Command className="size-3" />K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" onValueChange={setRecentRunQuery} />
        <CommandList>
          <CommandEmpty>No results. Try another query.</CommandEmpty>

          <CommandGroup heading="Navigate">
            {NAV_GROUPS.flatMap((group) =>
              group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${group.title} ${item.label} ${item.description ?? ""}`}
                  onSelect={() => go(item.href)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  <span className="ml-auto truncate text-2xs text-text-muted">{item.description}</span>
                </CommandItem>
              ))
            )}
            <CommandItem value="landing marketing home" onSelect={() => go("/")}>
              <Lightbulb />
              <span>Marketing landing</span>
              <span className="ml-auto text-2xs text-text-muted">/</span>
            </CommandItem>
          </CommandGroup>

          {shouldShowRunSearch ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Search runs">
                <CommandItem
                  value={`run ${trimmedRunQuery}`}
                  onSelect={() => go(`/app/runs/${encodeURIComponent(trimmedRunQuery)}`)}
                >
                  <SearchIcon />
                  <span>
                    Open run <span className="font-mono text-xs text-text">{trimmedRunQuery}</span>
                  </span>
                </CommandItem>
                <CommandItem
                  value={`runs filter ${trimmedRunQuery}`}
                  onSelect={() => go(`/app/runs?q=${encodeURIComponent(trimmedRunQuery)}`)}
                >
                  <Eye />
                  <span>
                    Filter Run Center by{" "}
                    <span className="font-mono text-xs text-text">{trimmedRunQuery}</span>
                  </span>
                </CommandItem>
              </CommandGroup>
            </>
          ) : null}

          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="theme toggle dark light"
              onSelect={() => {
                toggleTheme();
                toast.success(`Switched to ${resolvedTheme === "dark" ? "light" : "dark"} theme`);
                setOpen(false);
              }}
            >
              <ThemeIcon />
              <span>Toggle {resolvedTheme === "dark" ? "light" : "dark"} theme</span>
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="theme system follow"
              onSelect={() => {
                setTheme("system");
                toast.success("Following system theme");
                setOpen(false);
              }}
            >
              <ThemeIcon />
              <span>Use system theme</span>
            </CommandItem>
            <CommandItem value="connector health" onSelect={() => go("/app/settings")}>
              <HeartPulse />
              <span>Check connector health</span>
            </CommandItem>
            <CommandItem value="dashboard overview" onSelect={() => go("/app")}>
              <GaugeCircle />
              <span>Open dashboard</span>
              <CommandShortcut>g d</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Help">
            <CommandItem
              value="github source code repo"
              onSelect={() => {
                window.open("https://github.com/0xgctl/gctl", "_blank", "noopener,noreferrer");
                setOpen(false);
              }}
            >
              <Github />
              <span>Open GitHub repository</span>
            </CommandItem>
            <CommandItem
              value="shortcuts hint help"
              onSelect={() => {
                window.dispatchEvent(new CustomEvent("gctl:show-shortcuts"));
                setOpen(false);
              }}
            >
              <Lightbulb />
              <span>Show keyboard shortcuts</span>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
