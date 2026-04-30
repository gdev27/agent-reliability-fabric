import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type Breadcrumb = {
  href?: string;
  label: string;
};

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  status,
  actions,
  className
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="text-2xs text-text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="rounded-md hover:text-text focus-visible:text-text focus-visible:outline-none"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-text">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 ? (
                  <ChevronRight className="size-3 opacity-60" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5">
          {eyebrow ? (
            <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              {eyebrow}
            </span>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-display-md font-semibold leading-tight tracking-tight text-text">
              {title}
            </h1>
            {status}
          </div>
          {description ? (
            <p className="max-w-3xl text-balance text-sm text-text-muted lg:text-base">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
