import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "Company — VEYTRIX" },
      { name: "description", content: "About VEYTRIX — the team, the mission, and where we're headed." },
      { property: "og:title", content: "Company — VEYTRIX" },
      { property: "og:description", content: "About VEYTRIX — the team, the mission, and where we're headed." },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="A small studio building a big tool."
        description="VEYTRIX is a team of editors, designers, and engineers rebuilding the video editor from first principles."
      />
      <section className="mx-auto max-w-7xl px-6 py-12 grid gap-12 lg:grid-cols-3">
        <article className="lg:col-span-2 space-y-6">
          <h2 className="font-display text-2xl font-semibold">Our mission</h2>
          <p className="text-muted-foreground">
            Editing software should feel like an instrument, not a spreadsheet.
            We're building VEYTRIX to be sharp, honest, and delightful — a tool
            that gets out of your way and stays out of your way.
          </p>
          <h2 className="font-display text-2xl font-semibold pt-4">Principles</h2>
          <ul className="grid gap-3">
            {[
              "Timeline first. Everything else second.",
              "Motion is a feature. Delight is the default.",
              "Local before cloud. Yours before ours.",
              "Ship small, ship sharp, ship weekly.",
            ].map((p) => (
              <li key={p} className="rounded-lg hairline bg-surface/40 px-4 py-3 text-sm">
                {p}
              </li>
            ))}
          </ul>
        </article>

        <aside className="space-y-4">
          <div className="rounded-xl hairline bg-surface/40 p-6">
            <div className="text-xs font-mono uppercase tracking-widest text-primary">
              Careers
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Come cut with us.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We hire calm engineers, sharp designers, and editors who ship.
            </p>
            <button className="mt-4 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              View openings
            </button>
          </div>
          <div className="rounded-xl hairline bg-surface/40 p-6">
            <div className="text-xs font-mono uppercase tracking-widest text-primary">
              Press
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For interviews, assets, and quotes — press@veytrix.com
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
