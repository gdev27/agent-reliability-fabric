"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "./top-bar";
import { SideNav } from "./side-nav";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { PageFade } from "../motion/page-fade";
import { cn } from "../../lib/cn";

const COLLAPSED_KEY = "gctl.ui.desktopNavCollapsed";

const G_PREFIX_TIMEOUT = 1200;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedHydrated, setCollapsedHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Read persisted preference once after mount (storage isn't available on the server).
    /* eslint-disable react-hooks/set-state-in-effect */
    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "true");
    setCollapsedHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!collapsedHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "true" : "false");
  }, [collapsed, collapsedHydrated]);

  const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);

  useEffect(() => {
    let pendingPrefix = false;
    let prefixTimer: number | null = null;

    function clearPrefix() {
      pendingPrefix = false;
      if (prefixTimer !== null) {
        window.clearTimeout(prefixTimer);
        prefixTimer = null;
      }
    }

    function handler(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTextInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          (target as HTMLElement).isContentEditable);
      if (isTextInput) {
        return;
      }
      if (event.key === "?" && (event.shiftKey || event.code === "Slash")) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("gctl:show-shortcuts"));
        return;
      }
      if (event.key.toLowerCase() === "g" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        pendingPrefix = true;
        if (prefixTimer !== null) window.clearTimeout(prefixTimer);
        prefixTimer = window.setTimeout(clearPrefix, G_PREFIX_TIMEOUT);
        return;
      }
      if (pendingPrefix) {
        const key = event.key.toLowerCase();
        if (key === "d") {
          event.preventDefault();
          router.push("/app");
        } else if (key === "r") {
          event.preventDefault();
          router.push("/app/runs");
        } else if (key === "p") {
          event.preventDefault();
          router.push("/app/policies");
        } else if (key === "e") {
          event.preventDefault();
          router.push("/app/evidence");
        } else if (key === "s") {
          event.preventDefault();
          router.push("/app/settings");
        }
        clearPrefix();
      }
    }

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearPrefix();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg">
      <div className="flex flex-1">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen">
            <SideNav collapsed={collapsed} onToggle={toggleCollapsed} variant="desktop" />
          </div>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Primary navigation</SheetTitle>
            <SideNav
              collapsed={false}
              onToggle={() => undefined}
              onNavigate={() => setMobileOpen(false)}
              variant="mobile"
            />
          </SheetContent>
        </Sheet>

        <div className={cn("flex min-w-0 flex-1 flex-col")}>
          <TopBar onOpenMobileNav={() => setMobileOpen(true)} />
          <main id="main-content" className="flex-1 px-3 py-6 lg:px-8 lg:py-8" role="main">
            <div className="mx-auto w-full max-w-[1280px]">
              <PageFade>{children}</PageFade>
            </div>
          </main>
        </div>
      </div>
      <KeyboardShortcutsHelp />
    </div>
  );
}
