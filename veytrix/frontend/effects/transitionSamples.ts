export interface TransitionSample {
  id: string;
  name: string;
  type: 'Fade' | 'Slide' | 'Wipe' | 'Zoom' | 'Spin' | 'Glitch' | 'Creative';
  defaultDuration: number; // in seconds
  description: string;
  icon: string; // Emoji representing transition type
}

export const SAMPLE_TRANSITIONS: TransitionSample[] = [
  {
    id: 'fade-black',
    name: 'Fade to Black',
    type: 'Fade',
    defaultDuration: 0.5,
    description: 'Smoothly fade the clip to complete blackness before bringing in the next clip.',
    icon: '🌑'
  },
  {
    id: 'cross-dissolve',
    name: 'Cross Dissolve',
    type: 'Fade',
    defaultDuration: 0.8,
    description: 'Blends the ending of the first clip into the beginning of the second clip.',
    icon: '🌫️'
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    type: 'Slide',
    defaultDuration: 0.6,
    description: 'Push the outgoing clip to the left as the incoming clip enters from the right.',
    icon: '⬅️'
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    type: 'Slide',
    defaultDuration: 0.6,
    description: 'Push the outgoing clip to the right as the incoming clip enters from the left.',
    icon: '➡️'
  },
  {
    id: 'whip-pan',
    name: 'Whip Pan Blur',
    type: 'Wipe',
    defaultDuration: 0.4,
    description: 'High-speed camera pan effect with direction motion blur.',
    icon: '💫'
  },
  {
    id: 'zoom-in',
    name: 'Zoom In Snap',
    type: 'Zoom',
    defaultDuration: 0.5,
    description: 'Scales the incoming clip up rapidly from the center.',
    icon: '🔍'
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out Sink',
    type: 'Zoom',
    defaultDuration: 0.5,
    description: 'Scales the outgoing clip down, sinking into the background.',
    icon: '🔎'
  },
  {
    id: 'spin-clockwise',
    name: 'Rotate Spin 360',
    type: 'Spin',
    defaultDuration: 0.7,
    description: 'Revolves the camera scene rapidly around the center pivot.',
    icon: '🔄'
  },
  {
    id: 'glitch-cut',
    name: 'Glitch Flash Cut',
    type: 'Glitch',
    defaultDuration: 0.3,
    description: 'A sudden burst of digital static interference and screen tearing between clips.',
    icon: '⚡'
  },
  {
    id: 'page-flip',
    name: 'Creative Page Curl',
    type: 'Creative',
    defaultDuration: 0.8,
    description: 'Simulates the page of a book folding over to reveal the new video track.',
    icon: '📖'
  }
];
