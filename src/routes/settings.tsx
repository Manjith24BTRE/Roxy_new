import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { User, Palette, Bell, Keyboard, Shield, CreditCard } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VEYTRIX" },
      { name: "description", content: "Manage your VEYTRIX profile, workspace, and preferences." },
      { property: "og:title", content: "Settings — VEYTRIX" },
      { property: "og:description", content: "Manage your VEYTRIX profile, workspace, and preferences." },
    ],
  }),
  component: SettingsPage,
});

const SECTIONS = [
  { id: "profile",      icon: User,      label: "Profile" },
  { id: "appearance",   icon: Palette,   label: "Appearance" },
  { id: "notifications",icon: Bell,      label: "Notifications" },
  { id: "shortcuts",    icon: Keyboard,  label: "Shortcuts" },
  { id: "privacy",      icon: Shield,    label: "Privacy" },
  { id: "billing",      icon: CreditCard,label: "Billing" },
];

function SettingsPage() {
  const [active, setActive] = useState("profile");
  return (
    <>
      <PageHeader eyebrow="Settings" title="Your VEYTRIX, your way." />
      <section className="mx-auto max-w-7xl px-6 py-12 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="rounded-xl hairline bg-surface/40 p-2 h-max">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition text-left",
                active === s.id
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface",
              ].join(" ")}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="rounded-xl hairline bg-surface/40 p-8">
          <h2 className="font-display text-2xl font-semibold capitalize">
            {SECTIONS.find((s) => s.id === active)?.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your {active} preferences.
          </p>

          <div className="mt-8 grid gap-6">
            {[
              ["Display name", "Alex Rivera"],
              ["Email", "alex@veytrix.com"],
              ["Workspace", "Halcyon Studio"],
              ["Language", "English (US)"],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {label}
                </label>
                <input
                  defaultValue={value}
                  className="rounded-md bg-input hairline px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}

            <div className="flex items-center justify-between rounded-lg hairline bg-surface p-4">
              <div>
                <div className="text-sm font-medium">Autosave</div>
                <div className="text-xs text-muted-foreground">Save projects every 30 seconds</div>
              </div>
              <div className="relative h-6 w-11 rounded-full bg-primary cursor-pointer">
                <div className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-primary-foreground" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Save changes
              </button>
              <button className="rounded-md hairline bg-surface px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
