import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders eyebrow, title, and description", () => {
    render(
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="Track health and policy coverage."
      />
    );
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Operations dashboard" })).toBeInTheDocument();
    expect(screen.getByText(/Track health/)).toBeInTheDocument();
  });

  it("renders breadcrumbs as an ordered nav", () => {
    render(
      <PageHeader
        title="Run detail"
        breadcrumbs={[{ label: "Runs", href: "/app/runs" }, { label: "abc123" }]}
      />
    );
    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toBeInTheDocument();
    expect(nav.querySelectorAll("li").length).toBe(2);
  });

  it("matches snapshot with full props", () => {
    const { container } = render(
      <PageHeader eyebrow="Overview" title="Dashboard" description="Status and KPIs." />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
