import { TimelineClipRef, IClipLockService } from './lock.types';

export class ClipLockService implements IClipLockService {
  lockClip<T extends TimelineClipRef>(clip: T): T {
    return {
      ...clip,
      isLocked: true
    };
  }

  unlockClip<T extends TimelineClipRef>(clip: T): T {
    return {
      ...clip,
      isLocked: false
    };
  }

  toggleClipLock<T extends TimelineClipRef>(clip: T): T {
    return {
      ...clip,
      isLocked: !clip.isLocked
    };
  }

  batchLockClips<T extends TimelineClipRef>(clips: T[], targetIds: string[]): T[] {
    const idSet = new Set(targetIds);
    return clips.map((c) => (idSet.has(c.id) ? this.lockClip(c) : c));
  }

  batchUnlockClips<T extends TimelineClipRef>(clips: T[], targetIds: string[]): T[] {
    const idSet = new Set(targetIds);
    return clips.map((c) => (idSet.has(c.id) ? this.unlockClip(c) : c));
  }
}

export const clipLockService = new ClipLockService();
