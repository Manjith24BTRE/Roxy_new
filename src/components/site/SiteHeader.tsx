import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { VeytrixLogo } from "./VeytrixLogo";

const NAV = [
  { to: "/templates", label: "Templates" },
  { to: "/learning",  label: "Learning" },
  { to: "/support",   label: "Support" },
  { to: "/company",   label: "Company" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <VeytrixLogo className="h-7 w-7 transition group-hover:rotate-6" />
            <span className="font-display text-lg font-semibold tracking-tight">
              VEYTRIX
            </span>
            <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              beta
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "px-3 py-2 text-sm rounded-md transition",
                    active
                      ? "text-foreground bg-surface-2"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/settings"
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign in
            </Link>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-95 transition"
            >
              Open Editor
              <span aria-hidden>→</span>
            </Link>
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-surface"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background/95">
            <nav className="flex flex-col p-3 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-surface"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/editor"
                className="mt-2 rounded-md bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground text-center"
                onClick={() => setOpen(false)}
              >
                Open Editor
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
