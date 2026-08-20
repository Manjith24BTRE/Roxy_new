import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles } from 'lucide-react';
import { AnnouncementBadge } from './AnnouncementBadge';
import { HeroPreview } from './HeroPreview';
import { BackgroundEffects } from './BackgroundEffects';
import { GradientButton } from './GradientButton';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
      {/* Light Luxury SaaS Background Style */}
      <BackgroundEffects />

      <div className="relative mx-auto max-w-7xl px-6 flex flex-col items-center text-center z-10">
        
        {/* Animated Capsule Badge */}
        <div className="reveal-on-scroll">
          <AnnouncementBadge />
        </div>

        {/* Cinematic Headline */}
        <h1 className="reveal-on-scroll delay-100 font-display text-4xl sm:text-6xl md:text-[76px] leading-[1.05] font-bold tracking-tight text-[#1D2B64] max-w-4xl mx-auto">
          AI-Powered Video Editing at the <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#3B6CE7] to-[#8CC8E8] text-transparent bg-clip-text">SPEED OF THOUGHT.</span>
        </h1>

        {/* Subtle, Readable Supporting copy */}
        <p className="reveal-on-scroll delay-200 mt-6 max-w-2xl text-base md:text-lg text-[#1D2B64]/70 leading-relaxed">
          A modern browser-native workspace engineered for creative agencies and professional creators. Precision timelines, real-time responses, and smart workflow integration.
        </p>

        {/* Polished Call-to-actions */}
        <div className="reveal-on-scroll delay-300 mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/home">
            <GradientButton 
              variant="primary" 
              size="md"
              icon={<Play size={16} className="fill-current" />}
            >
              Start Free Trial
            </GradientButton>
          </Link>
          <a href="#features">
            <GradientButton 
              variant="outline" 
              size="md"
              icon={<Sparkles size={15} className="text-[#3B6CE7]" />}
            >
              Explore Features
            </GradientButton>
          </a>
        </div>

        {/* Interactive Editor Dashboard Mockup Frame */}
        <div className="reveal-on-scroll delay-400 mt-12 w-full max-w-4xl">
          <HeroPreview />
        </div>

      </div>
    </section>
  );
}
