import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative border-b border-border overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-70 pointer-events-none" />
      <div className="absolute inset-x-0 -top-40 h-80 bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {eyebrow && (
          <div className="text-xs font-mono uppercase tracking-widest text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
