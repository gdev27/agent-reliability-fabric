"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, FlaskConical, Network, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { getOperatorSession } from "../../lib/api";
import type { DisplayMode, OperatorSession, SessionView } from "../../lib/types";
import { DEFAULT_DISPLAY_MODE, DEFAULT_SESSION_VIEW } from "../../lib/workspace";
import { cn } from "../../lib/cn";

const MODE_KEY = "gctl.settings.mode";
const SESSION_VIEW_KEY = "gctl.session.viewMode";

export function WorkspaceChip({ className }: { className?: string }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DEFAULT_DISPLAY_MODE);
  const [sessionView, setSessionView] = useState<SessionView>(DEFAULT_SESSION_VIEW);
  const [session, setSession] = useState<OperatorSession | null>(null);

  useEffect(() => {
    function syncFromStorage() {
      const savedMode = window.localStorage.getItem(MODE_KEY);
      setDisplayMode(savedMode === "live" ? "live" : "demo");
      const savedView = window.localStorage.getItem(SESSION_VIEW_KEY);
      setSessionView(savedView === "investigation" ? "investigation" : "overview");
    }
    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("gctl:settings-updated", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("gctl:settings-updated", syncFromStorage);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const result = await getOperatorSession({ signal: controller.signal });
      if (!controller.signal.aborted && result.session) {
        setSession(result.session);
        setDisplayMode(result.session.preferences.displayMode);
        setSessionView(result.session.preferences.sessionView);
      }
    })();
    return () => controller.abort();
  }, []);

  const accountLabel = session ? session.name : "Guest workspace";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 rounded-full border border-border-strong/40 bg-surface px-3 text-xs text-text-muted hover:text-text",
            className
          )}
          aria-label="Workspace state"
        >
          <Network className="size-3.5" />
          <span className="hidden sm:inline">{accountLabel}</span>
          <Badge
            variant={displayMode === "live" ? "info" : "warning"}
            size="sm"
            className="border-0 px-1.5 uppercase"
          >
            {displayMode === "live" ? "Live" : "Demo"}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">Workspace</span>
            <Link
              href="/app/settings"
              className="text-2xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-strong/60 px-3 py-2">
            <User className="size-4 text-text-muted" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-text">{accountLabel}</p>
              <p className="text-2xs text-text-muted">
                {session ? session.email : "Sign in to sync preferences"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border bg-surface-strong/40 px-3 py-2">
              <p className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-muted">
                <FlaskConical className="size-3.5" />
                Mode
              </p>
              <p className="mt-1 text-text">{displayMode === "live" ? "Live data" : "Demo-safe"}</p>
            </div>
            <div className="rounded-md border border-border bg-surface-strong/40 px-3 py-2">
              <p className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-muted">
                <Eye className="size-3.5" />
                View
              </p>
              <p className="mt-1 capitalize text-text">{sessionView}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
