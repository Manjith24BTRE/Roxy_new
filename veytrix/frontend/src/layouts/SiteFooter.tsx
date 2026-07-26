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
    <footer className="border-t border-[#1D2B64]/20 bg-[#1D2B64] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <VeytrixLogo className="h-6 w-6 text-white" />
              <span className="font-display text-lg font-semibold tracking-tight text-white">VEYTRIX</span>
            </div>
            <p className="mt-4 text-sm text-[#E6F2F8]/70 max-w-xs leading-relaxed">
              A cinematic video editor engineered for the next generation of creators. Built for speed, precision, and flow.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8]">
                {c.title}
              </div>
              <ul className="mt-4 space-y-3">
                {c.items.map((i) => (
                  <li key={i.label}>
                    <Link
                      to={i.to}
                      className="text-sm text-[#E6F2F8]/80 hover:text-white transition-colors"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-[#8CC8E8]/10 pt-8">
          <p className="text-xs text-[#E6F2F8]/60">
            © {new Date().getFullYear()} VEYTRIX. Crafted for creators.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#E6F2F8]/60 font-mono flex items-center gap-2">
              v0.1.0 · build · <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#8CC8E8] animate-pulse" /> online</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
