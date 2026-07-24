import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { LifeBuoy, MessageCircle, Bug, Zap, Mail } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — VEYTRIX" },
      { name: "description", content: "Get help fast. Docs, community, and direct support for VEYTRIX." },
      { property: "og:title", content: "Support — VEYTRIX" },
      { property: "og:description", content: "Docs, community, and direct support for VEYTRIX." },
    ],
  }),
  component: SupportPage,
});

const CHANNELS = [
  { icon: LifeBuoy,      title: "Help Center",     desc: "Search the docs and step-by-step guides." },
  { icon: MessageCircle, title: "Community",       desc: "Join thousands of editors on Discord." },
  { icon: Bug,           title: "Report a bug",    desc: "File an issue with logs and repro steps." },
  { icon: Zap,           title: "Feature request", desc: "Tell us what to build next." },
];

function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support Center"
        title="We've got your back."
        description="Fast answers, patient humans, and a community that ships."
      />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c) => (
            <div key={c.title} className="rounded-xl hairline bg-surface/40 p-6 hover:bg-surface-2 transition cursor-pointer">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary hairline-strong">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{c.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl hairline bg-surface/40 p-8">
            <h2 className="font-display text-2xl font-semibold">Contact us</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop us a line — we usually reply within a business day.
            </p>
            <div className="mt-6 grid gap-4">
              <input
                type="text"
                placeholder="Your name"
                className="rounded-md bg-input hairline px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="email"
                placeholder="you@studio.com"
                className="rounded-md bg-input hairline px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                rows={5}
                placeholder="What's on your mind?"
                className="rounded-md bg-input hairline px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
                <Mail className="h-4 w-4" /> Send message
              </button>
            </div>
          </div>
          <div className="rounded-xl hairline bg-surface/40 p-8">
            <h3 className="font-display text-xl font-semibold">Status</h3>
            <div className="mt-4 space-y-3">
              {[
                ["Editor", "operational"],
                ["Templates", "operational"],
                ["Cloud sync", "reserved"],
                ["AI Command Engine", "reserved"],
              ].map(([svc, st]) => (
                <div key={svc} className="flex items-center justify-between text-sm">
                  <span>{svc}</span>
                  <span className={[
                    "font-mono text-xs px-2 py-0.5 rounded-full",
                    st === "operational" ? "bg-success/15 text-success" : "bg-surface-3 text-muted-foreground",
                  ].join(" ")}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
