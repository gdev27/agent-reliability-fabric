"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Github, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Logo } from "../brand/logo";
import { CommandPaletteTrigger } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { WorkspaceChip } from "./workspace-chip";
import { cn } from "../../lib/cn";
import { findActiveNavLabel } from "./nav-config";

export interface TopBarProps {
  onOpenMobileNav: () => void;
  className?: string;
}

export function TopBar({ onOpenMobileNav, className }: TopBarProps) {
  const pathname = usePathname();
  const activeLabel = findActiveNavLabel(pathname) || "Overview";
  const isAppRoot = pathname === "/app";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/85 px-3 backdrop-blur lg:px-6",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        aria-controls="primary-navigation"
      >
        <Menu className="size-5" />
      </Button>

      <Link
        href="/"
        aria-label="gctl home"
        className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <Logo size={22} />
      </Link>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex">
        <Link
          href="/app"
          className="rounded-md text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Console
        </Link>
        {!isAppRoot ? (
          <>
            <ChevronRight className="size-3.5 text-text-muted" aria-hidden="true" />
            <span className="truncate font-medium text-text">{activeLabel}</span>
          </>
        ) : (
          <>
            <ChevronRight className="size-3.5 text-text-muted" aria-hidden="true" />
            <span className="truncate font-medium text-text">Dashboard</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <CommandPaletteTrigger className="hidden md:inline-flex" />
        <Button variant="ghost" size="icon" aria-label="GitHub" asChild className="hidden md:inline-flex">
          <Link href="https://github.com/0xgctl/gctl" target="_blank" rel="noopener noreferrer">
            <Github className="size-4" />
          </Link>
        </Button>
        <ThemeToggle />
        <WorkspaceChip />
      </div>
    </header>
  );
}
