// ExportCenter.types.ts
// Local component types for the ExportCenter modal.

import type { ExportSettings, ExportJob, ExportStatus } from '../../../../types/export.types';

export interface ExportCenterProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
  timelineJson?: Record<string, unknown>;
}

export type { ExportSettings, ExportJob, ExportStatus };
