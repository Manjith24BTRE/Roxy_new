import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Layers, Sparkles, Download, Layout, Play, ArrowRight } from 'lucide-react';

export function DashboardPage() {
  return (
    <main className="relative min-h-[calc(100vh-64px)] py-16 px-6 overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 h-[450px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground font-medium">
              Dashboard · <span className="text-foreground">Workspace ready</span>
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-gradient">Veytrix</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            Create professional videos using Veytrix's AI-assisted manual editing workspace.
          </p>
        </div>

        {/* Main Action — Large AI Manual Edit Card */}
        <div className="mt-12 relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-primary opacity-25 blur-xl group-hover:opacity-40 transition duration-500" />
          <div className="relative rounded-3xl glass p-8 md:p-12 overflow-hidden shadow-elegant border border-border-strong/80 hover:border-primary/50 transition duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-6 shadow-glow">
                  <Wand2 className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-foreground">
                  AI Manual Edit
                </h2>
                <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                  Upload your videos and begin editing in Veytrix's professional editing workspace with AI-assisted tools designed for creators.
                </p>
              </div>

              <div className="w-full md:w-auto flex-shrink-0">
                <Link
                  to="/upload"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] no-underline"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>Start Editing</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section — 4 Small Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={Layers}
            title="Professional Timeline"
            description="Professional multi-layer editing workspace."
          />
          <FeatureCard
            icon={Sparkles}
            title="AI-Assisted Workflow"
            description="Speed up repetitive editing tasks."
          />
          <FeatureCard
            icon={Download}
            title="High Quality Export"
            description="Export professional-quality videos."
          />
          <FeatureCard
            icon={Layout}
            title="Modern Editing Experience"
            description="Built for creators with a clean, fast interface."
          />
        </div>

        {/* Bottom Info Section */}
        <div className="mt-14 rounded-2xl glass p-8 text-center border border-border/60 max-w-4xl mx-auto">
          <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">
            Everything starts with AI Manual Edit
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Import your media, organize your assets, and continue into the professional editing workspace.
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl glass p-6 border border-border hover:border-primary/40 hover:bg-surface-2/60 transition duration-300">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4 group-hover:scale-110 transition duration-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
