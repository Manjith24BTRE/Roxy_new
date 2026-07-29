import { ClipboardPayload, ClipboardState } from './clipboard.types';

type ClipboardListener = (state: ClipboardState) => void;

export class ClipboardManager {
  private static instance: ClipboardManager;
  private payload: ClipboardPayload | null = null;
  private timestamp: number | null = null;
  private listeners: Set<ClipboardListener> = new Set();

  private constructor() {}

  public static getInstance(): ClipboardManager {
    if (!ClipboardManager.instance) {
      ClipboardManager.instance = new ClipboardManager();
    }
    return ClipboardManager.instance;
  }

  public setPayload(payload: ClipboardPayload | null): void {
    this.payload = payload;
    this.timestamp = payload ? payload.copiedAt : null;
    this.notify();
  }

  public getPayload(): ClipboardPayload | null {
    if (!this.payload) return null;
    return this.payload;
  }

  public hasPayload(): boolean {
    return this.payload !== null && this.payload.clips.length > 0;
  }

  public clear(): void {
    this.payload = null;
    this.timestamp = null;
    this.notify();
  }

  public getState(): ClipboardState {
    return {
      payload: this.payload,
      timestamp: this.timestamp,
    };
  }

  public subscribe(listener: ClipboardListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}

export const clipboardManager = ClipboardManager.getInstance();
