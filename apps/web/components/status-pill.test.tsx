import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./status-pill";

describe("StatusPill", () => {
  it("renders a succeeded state with the ok tone", () => {
    const { container } = render(<StatusPill state="succeeded" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill).toBeTruthy();
    expect(pill.className).toMatch(/bg-good-soft/);
    expect(pill.textContent).toContain("Succeeded");
  });

  it("renders a denied state with the bad tone and aria label", () => {
    const { container } = render(<StatusPill state="denied" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toMatch(/bg-bad-soft/);
    expect(pill.getAttribute("aria-label")).toContain("Denied");
  });

  it("respects size variant", () => {
    const { container } = render(<StatusPill state="running" size="sm" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toMatch(/text-2xs/);
  });

  it("matches snapshot for succeeded default", () => {
    const { container } = render(<StatusPill state="succeeded" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
