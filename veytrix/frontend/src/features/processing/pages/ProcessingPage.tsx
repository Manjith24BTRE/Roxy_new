import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const MESSAGES = [
  'Preparing Workspace...',
  'Loading Assets...',
  'Building Timeline...',
  'Initializing Editor...',
  'Almost Ready...',
];

export function ProcessingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Step message cycle
    const messageInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    // Smooth progress loader
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 15;
      });
    }, 400);

    // Auto-navigate to /editor after 3 seconds
    const timeout = setTimeout(() => {
      navigate('/editor');
    }, 3200);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-6 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-mesh opacity-80 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[150px] pointer-events-none" />

      <div className="relative text-center max-w-md w-full">
        {/* Animated Ring Icon */}
        <div className="relative mx-auto h-24 w-24 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-pink-500 animate-spin" />
          <div className="h-16 w-16 rounded-full glass flex items-center justify-center text-primary shadow-glow">
            <Sparkles className="h-8 w-8 animate-pulse" />
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Building Your Editor
        </h1>

        <p className="mt-3 text-sm font-mono text-primary font-medium h-6">
          {MESSAGES[currentStep]}
        </p>

        {/* Progress Bar Container */}
        <div className="mt-8 w-full glass rounded-full h-3 p-0.5 border border-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>VEYTRIX v0.1</span>
          <span>{Math.min(progress, 100)}%</span>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Configuring desktop-grade editing canvas...</span>
        </div>
      </div>
    </main>
  );
}
