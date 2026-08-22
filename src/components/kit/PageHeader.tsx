import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  meta,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="border-b border-border pb-5">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"
      >
        <Link to="/" className="transition-colors hover:text-foreground">
          Control Centre
        </Link>
        {breadcrumbs.map((c) => (
          <span key={c.label} className="flex items-center gap-1">
            <ChevronRight className="size-3 opacity-60" />
            {c.to ? (
              <Link to={c.to} className="transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
