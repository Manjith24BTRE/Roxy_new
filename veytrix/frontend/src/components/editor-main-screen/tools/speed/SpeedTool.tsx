// SpeedTool.tsx
// Purpose: Main entry component for Video Speed Tool.

import React, { memo } from 'react';
import { SpeedPanel } from './SpeedPanel';
import { SpeedToolProps } from './speedTypes';
import './speed.css';

export const SpeedTool = memo<SpeedToolProps>((props) => {
  return (
    <div className="h-full w-full bg-background flex flex-col overflow-hidden">
      <SpeedPanel {...props} />
    </div>
  );
});

SpeedTool.displayName = 'SpeedTool';
