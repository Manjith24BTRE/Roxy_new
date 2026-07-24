import React from 'react';
import { Link } from 'react-router-dom';
import { VeytrixLogo } from '../components/VeytrixLogo';

const COLS = [
  {
    title: "Product",
    items: [
      { label: "Editor", to: "/editor" },
      { label: "Templates", to: "/templates" },
      { label: "Learning", to: "/learning" },
      { label: "Settings", to: "/settings" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/company" },
      { label: "Careers", to: "/company" },
      { label: "Press", to: "/company" },
      { label: "Contact", to: "/support" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", to: "/learning" },
      { label: "Tutorials", to: "/learning" },
      { label: "Support", to: "/support" },
      { label: "Changelog", to: "/company" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <VeytrixLogo className="h-6 w-6" />
              <span className="font-display text-lg font-semibold">VEYTRIX</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              A cinematic video editor engineered for the next generation of creators.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2">
                {c.items.map((i) => (
                  <li key={i.label}>
                    <Link
                      to={i.to}
                      className="text-sm text-foreground/80 hover:text-foreground transition"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VEYTRIX. Crafted for creators.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            v0.1.0 · build · <span className="text-primary">online</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
