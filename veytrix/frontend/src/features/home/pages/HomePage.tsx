import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wand2, Layers, Sparkles, Download, Layout, Play,
  ArrowRight, Clock, FolderOpen, Star, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <main className="relative min-h-[calc(100vh-64px)] py-12 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 h-[450px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        {/* Greeting */}
        <div className="flex items-center gap-4 mb-10">
          <img
            src={user?.avatarUrl}
            alt={user?.displayName}
            className="h-14 w-14 rounded-2xl border-2 border-primary/40 shadow-glow"
          />
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, <span className="text-gradient">{user?.displayName || 'Creator'}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.email} · Ready to create something amazing
            </p>
          </div>
        </div>

        {/* Main Creation Cards — Two Modes */}
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          {/* AI Manual Edit Card */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-primary opacity-25 blur-xl group-hover:opacity-40 transition duration-500" />
            <div className="relative rounded-3xl glass p-8 overflow-hidden shadow-elegant border border-border-strong/80 hover:border-primary/50 transition duration-300 h-full flex flex-col">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-5 shadow-glow">
                <Wand2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                AI Manual Edit
              </h2>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed flex-1">
                Upload your videos and begin editing in Veytrix's professional editing workspace with AI-assisted tools designed for creators.
              </p>
              <Link
                to="/upload"
                className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] no-underline"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Start Editing</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-accent/15 blur-xl group-hover:opacity-40 transition duration-500 opacity-0" />
            <div className="relative rounded-3xl glass p-8 overflow-hidden shadow-elegant border border-border/60 hover:border-accent/40 transition duration-300 h-full flex flex-col">
              <h3 className="font-display text-lg font-semibold text-foreground mb-5">Quick Actions</h3>
              <div className="space-y-3 flex-1">
                <Link
                  to="/upload"
                  className="flex items-center gap-3 rounded-xl bg-surface/60 border border-border hover:border-primary/40 hover:bg-surface-2 px-4 py-3.5 transition no-underline group/item"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">New Project</div>
                    <div className="text-xs text-muted-foreground">Import media & start editing</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition" />
                </Link>

                <Link
                  to="/templates"
                  className="flex items-center gap-3 rounded-xl bg-surface/60 border border-border hover:border-primary/40 hover:bg-surface-2 px-4 py-3.5 transition no-underline group/item"
                >
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Browse Templates</div>
                    <div className="text-xs text-muted-foreground">Start from a professional template</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition" />
                </Link>

                <Link
                  to="/learning"
                  className="flex items-center gap-3 rounded-xl bg-surface/60 border border-border hover:border-primary/40 hover:bg-surface-2 px-4 py-3.5 transition no-underline group/item"
                >
                  <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Learn Veytrix</div>
                    <div className="text-xs text-muted-foreground">Tutorials & guides for creators</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
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

        {/* Recent Projects Placeholder */}
        <div className="rounded-2xl glass p-8 border border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display text-base font-semibold text-foreground">Recent Projects</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No projects yet. Start your first project by clicking <strong className="text-foreground">AI Manual Edit</strong> above.
            </p>
          </div>
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
