export interface TransitionItem {
  id: string;
  name: string;
  category: 'basic' | 'camera' | 'zoom' | 'slide' | 'spin' | 'blur' | 'glitch' | 'light';
  description: string;
  defaultDuration: number; // in seconds
  icon: string; // Emoji representing transition type
  keywords: string[];
  
  // Customization capabilities
  speed?: number; // 0.1 - 2.0 multiplier
  intensity?: number; // 0 - 100 percentage
  direction?: 'left' | 'right' | 'up' | 'down' | 'cw' | 'ccw' | 'center' | 'none';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'elastic' | 'bounce';
  motionBlur?: boolean;
  
  // Capability flags
  gpuOptimized: boolean;
  realtimePreview: boolean;
  timelineCompatible: boolean;
  exportCompatible: boolean;
}
