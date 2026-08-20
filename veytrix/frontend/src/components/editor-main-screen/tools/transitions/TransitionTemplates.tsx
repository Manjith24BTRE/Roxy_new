import React, { useRef, useState, useEffect } from 'react';
import { VisualSceneA, VisualSceneB } from './TransitionThumbnail';

export interface TemplateProps {
  name: string;
  id: number;
  category: string;
  color: string;
  accentColor?: string;
  animationVariant?: number;
  intensity?: 'soft' | 'medium' | 'strong';
  className?: string;
}

// 16:9 Pure Video Motion Canvas Container (Zero text/emojis/badges inside preview)
const TemplateContainer: React.FC<TemplateProps & { children: React.ReactNode }> = ({
  className = '',
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const shouldAnimate = (isHovered || isInView) && !reducedMotion;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 shadow-md group select-none transition-all duration-300 hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)] ${className}`}
    >
      <div className={`absolute inset-0 transition-opacity ${shouldAnimate ? 'animate-active' : ''}`}>
        {children}
      </div>
    </div>
  );
};

// 1. DissolveTemplate
export const DissolveTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[fade_2s_ease-in-out_infinite]" />
    <VisualSceneB className="animate-[pulse_2s_ease-in-out_infinite] opacity-60 mix-blend-screen" />
  </TemplateContainer>
);

// 2. FadeTemplate
export const FadeTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[pulse_2s_infinite]" />
    <div className="absolute inset-0 bg-black/80 animate-[fade_2s_infinite]" />
  </TemplateContainer>
);

// 3. FlashTemplate
export const FlashTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA />
    <div className="absolute inset-0 bg-white/90 animate-[ping_1.5s_infinite]" />
  </TemplateContainer>
);

// 4. CameraShakeTemplate
export const CameraShakeTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="group-hover:animate-bounce" />
  </TemplateContainer>
);

// 5. WhipPanTemplate
export const WhipPanTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[ping_2s_infinite]" />
    <VisualSceneB className="animate-[pulse_2s_infinite] opacity-70" />
    <div className="w-full h-12 bg-sky-400/30 blur-md transform -skew-x-12 animate-[spin_3s_linear_infinite]" />
  </TemplateContainer>
);

// 6. DroneCameraTemplate
export const DroneCameraTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[pulse_2.5s_infinite]" />
  </TemplateContainer>
);

// 7. ZoomTemplate
export const ZoomTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[ping_1.8s_infinite]" />
  </TemplateContainer>
);

// 8. TunnelZoomTemplate
export const TunnelZoomTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[ping_2s_infinite]" />
    <VisualSceneB className="animate-[pulse_2s_infinite] opacity-80" />
  </TemplateContainer>
);

// 9. WarpZoomTemplate
export const WarpZoomTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[pulse_1.5s_infinite]" />
  </TemplateContainer>
);

// 10. SlidePushTemplate
export const SlidePushTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="group-hover:-translate-x-full transition-transform duration-700" />
    <VisualSceneB className="translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
  </TemplateContainer>
);

// 11. CardStackTemplate
export const CardStackTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="transform rotate-2 scale-95" />
    <VisualSceneB className="transform -rotate-2 scale-90 opacity-80" />
  </TemplateContainer>
);

// 12. SpinRotateTemplate
export const SpinRotateTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[spin_4s_linear_infinite]" />
  </TemplateContainer>
);

// 13. Flip3DTemplate
export const Flip3DTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="group-hover:rotate-y-180 transition-transform duration-700" />
  </TemplateContainer>
);

// 14. PortalSpinTemplate
export const PortalSpinTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="animate-[spin_2s_linear_infinite]" />
  </TemplateContainer>
);

// 15. MotionBlurTemplate
export const MotionBlurTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="blur-sm animate-pulse" />
  </TemplateContainer>
);

// 16. BokehBlurTemplate
export const BokehBlurTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="blur-md" />
  </TemplateContainer>
);

// 17. RGBGlitchTemplate
export const RGBGlitchTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA className="-translate-x-1 hue-rotate-90 animate-pulse" />
    <VisualSceneB className="translate-x-1 -hue-rotate-90 opacity-50 mix-blend-screen animate-pulse" />
  </TemplateContainer>
);

// 18. VHSGlitchTemplate
export const VHSGlitchTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA />
    <div className="w-full h-1 bg-pink-400/80 absolute top-1/3 animate-bounce" />
  </TemplateContainer>
);

// 19. LightLeakTemplate
export const LightLeakTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA />
    <div className="w-36 h-36 rounded-full bg-gradient-to-r from-amber-400/60 to-red-500/40 blur-2xl animate-pulse" />
  </TemplateContainer>
);

// 20. CinematicLightTemplate
export const CinematicLightTemplate: React.FC<TemplateProps> = (props) => (
  <TemplateContainer {...props}>
    <VisualSceneA />
    <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/30 via-transparent to-transparent animate-pulse" />
  </TemplateContainer>
);

export function renderProgrammaticThumbnail(item: {
  id: number;
  name: string;
  category: string;
  color: string;
}) {
  const name = item.name.toLowerCase();

  let Template = DissolveTemplate;

  if (name.includes('dissolve') || name.includes('blend')) Template = DissolveTemplate;
  else if (name.includes('fade')) Template = FadeTemplate;
  else if (name.includes('flash')) Template = FlashTemplate;
  else if (name.includes('shake') || name.includes('cam')) Template = CameraShakeTemplate;
  else if (name.includes('whip') || name.includes('pan')) Template = WhipPanTemplate;
  else if (name.includes('drone') || name.includes('crane')) Template = DroneCameraTemplate;
  else if (name.includes('tunnel')) Template = TunnelZoomTemplate;
  else if (name.includes('warp')) Template = WarpZoomTemplate;
  else if (name.includes('zoom')) Template = ZoomTemplate;
  else if (name.includes('card') || name.includes('stack')) Template = CardStackTemplate;
  else if (name.includes('slide') || name.includes('push') || name.includes('swipe')) Template = SlidePushTemplate;
  else if (name.includes('portal') || name.includes('helix')) Template = PortalSpinTemplate;
  else if (name.includes('flip') || name.includes('cube') || name.includes('page')) Template = Flip3DTemplate;
  else if (name.includes('spin') || name.includes('rotate')) Template = SpinRotateTemplate;
  else if (name.includes('bokeh') || name.includes('lens')) Template = BokehBlurTemplate;
  else if (name.includes('blur')) Template = MotionBlurTemplate;
  else if (name.includes('vhs') || name.includes('static') || name.includes('tear')) Template = VHSGlitchTemplate;
  else if (name.includes('glitch') || name.includes('rgb') || name.includes('pixel')) Template = RGBGlitchTemplate;
  else if (name.includes('leak') || name.includes('burn') || name.includes('flare')) Template = LightLeakTemplate;
  else Template = CinematicLightTemplate;

  return (
    <Template
      id={item.id}
      name={item.name}
      category={item.category}
      color={item.color}
      animationVariant={item.id % 4}
    />
  );
}
