"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "../ui/button";
import { Logo } from "../brand/logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/cn";
import { isNavActive, NAV_GROUPS } from "./nav-config";

export interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

export function SideNav({ collapsed, onToggle, onNavigate, variant = "desktop", className }: SideNavProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";
  const showLabels = isMobile || !collapsed;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        id="primary-navigation"
        aria-label="Primary navigation"
        className={cn(
          "flex h-full flex-col gap-2 border-r border-border bg-surface/85 backdrop-blur",
          isMobile ? "w-full px-3 py-4" : showLabels ? "w-60 px-3 py-4" : "w-16 px-2 py-4",
          className
        )}
      >
        <div
          className={cn("flex items-center", showLabels ? "justify-between gap-2 px-1" : "justify-center")}
        >
          <Link
            href="/"
            onClick={onNavigate}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="gctl home"
          >
            <Logo showWordmark={showLabels} size={26} />
          </Link>
          {!isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn("size-7 rounded-md", !showLabels && "ml-0")}
            >
              {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </Button>
          ) : null}
        </div>

        <nav
          className={cn("mt-2 flex flex-1 flex-col gap-5", showLabels ? "px-1" : "px-0 items-center")}
          aria-label="Sections"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className={cn("flex flex-col gap-1.5", !showLabels && "items-center")}>
              {showLabels ? (
                <p className="px-2 text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted/80">
                  {group.title}
                </p>
              ) : (
                <span className="sr-only">{group.title}</span>
              )}
              <ul className={cn("flex flex-col gap-0.5", !showLabels && "items-center")}>
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  const linkContent = (
                    <>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-md transition-colors",
                          showLabels ? "size-7" : "size-9",
                          active ? "bg-primary/15 text-primary" : "text-text-muted group-hover:text-text"
                        )}
                      >
                        <item.icon className="size-4" />
                      </span>
                      {showLabels ? (
                        <span className="flex-1 text-sm">{item.label}</span>
                      ) : (
                        <span className="sr-only">{item.label}</span>
                      )}
                      {active && showLabels ? (
                        <span aria-hidden="true" className="ml-auto h-5 w-1 rounded-full bg-primary" />
                      ) : null}
                    </>
                  );
                  const linkEl = (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        showLabels ? "px-2 py-1.5" : "p-1.5",
                        active
                          ? "bg-surface-strong text-text"
                          : "text-text-muted hover:bg-surface-strong/70 hover:text-text"
                      )}
                    >
                      {linkContent}
                    </Link>
                  );
                  if (showLabels) {
                    return <li key={item.href}>{linkEl}</li>;
                  }
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {showLabels ? (
          <div className="mt-auto rounded-lg border border-border bg-surface-strong/60 p-3 text-xs text-text-muted">
            <p className="font-medium text-text">Trust envelope</p>
            <p className="mt-1 leading-snug">
              Every <span className="text-text">/api/ops</span> response carries{" "}
              <span className="text-text">source</span>, <span className="text-text">trustStatus</span>, and{" "}
              <span className="text-text">recoveryAction</span>.
            </p>
          </div>
        ) : null}
      </aside>
    </TooltipProvider>
  );
}
