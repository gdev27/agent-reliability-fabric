import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionBanner } from "./session-banner";

describe("SessionBanner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ session: null })
      })
    );
  });

  it("restores persisted view mode and persists toggles", () => {
    window.localStorage.setItem("gctl.session.viewMode", "investigation");
    render(<SessionBanner />);

    expect(screen.getByText(/View preference: investigation/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /switch to overview/i }));
    expect(window.localStorage.getItem("gctl.session.viewMode")).toBe("overview");
  });

  it("updates display mode when settings event is dispatched", () => {
    window.localStorage.setItem("gctl.settings.mode", "live");
    render(<SessionBanner />);
    window.dispatchEvent(new Event("gctl:settings-updated"));

    expect(screen.getByText(/Live-data wording/i)).toBeInTheDocument();
  });

  it("shows workspace owner when account session exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          session: {
            operatorId: "operator-1",
            name: "Alicia",
            email: "alicia@example.com",
            createdAt: Date.now(),
            lastSeenAt: Date.now(),
            preferences: {
              displayMode: "live",
              sessionView: "investigation",
              indexerUrlReference: "http://localhost:4300"
            },
            pinnedRunIds: []
          }
        })
      })
    );
    render(<SessionBanner />);

    expect(await screen.findByText(/Workspace: Alicia/i)).toBeInTheDocument();
  });
});
