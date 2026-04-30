import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts";

describe("KeyboardShortcutsHelp", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens when the gctl:show-shortcuts event fires", () => {
    render(<KeyboardShortcutsHelp />);
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => {
      window.dispatchEvent(new CustomEvent("gctl:show-shortcuts"));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Go to dashboard")).toBeInTheDocument();
    expect(screen.getByText("Open command palette")).toBeInTheDocument();
  });
});
