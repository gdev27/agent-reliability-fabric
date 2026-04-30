import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No runs yet" description="Trigger a workflow to see it here." />);
    expect(screen.getByRole("heading", { name: "No runs yet" })).toBeInTheDocument();
    expect(screen.getByText(/Trigger a workflow/)).toBeInTheDocument();
  });

  it("renders primary CTA when href and label provided", () => {
    render(<EmptyState title="No runs" description="Try again" ctaHref="/app/runs" ctaLabel="Open runs" />);
    const link = screen.getByRole("link", { name: "Open runs" });
    expect(link).toHaveAttribute("href", "/app/runs");
  });

  it("matches snapshot for default state", () => {
    const { container } = render(<EmptyState title="Empty" description="Nothing here." />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
