import React, { useEffect } from 'react';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px 100px 0px'
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Fallback: make sure all sections are revealed after 100ms
    const timeout = setTimeout(() => {
      elements.forEach((el) => el.classList.add('reveal-active'));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-[#8CC8E8]/50 selection:text-[#1D2B64]">
      {/* Global CSS Inject to ensure reveal-on-scroll is registered and fully visible by default */}
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-on-scroll {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .reveal-active {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}} />
      {children}
    </div>
  );
}
