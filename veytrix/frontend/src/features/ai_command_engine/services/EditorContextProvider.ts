import { EditorContext } from '../types/context';

type ContextListener = (context: EditorContext) => void;

export class EditorContextProvider {
  private static currentContext: EditorContext = {};
  private static listeners: Set<ContextListener> = new Set();

  public static getContext(): EditorContext {
    return { ...this.currentContext };
  }

  public static setContext(context: EditorContext): void {
    this.currentContext = { ...context };
    this.notifyListeners();
  }

  public static updateContext(partialContext: Partial<EditorContext>): void {
    const nextContext = {
      ...this.currentContext,
      ...partialContext,
    };
    // Optimization: prevent notifying subscribers if context fields have not changed
    if (JSON.stringify(this.currentContext) === JSON.stringify(nextContext)) {
      return;
    }
    this.currentContext = nextContext;
    this.notifyListeners();
  }


  public static subscribe(listener: ContextListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current context on subscription
    listener(this.getContext());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const ctx = this.getContext();
    this.listeners.forEach((listener) => {
      try {
        listener(ctx);
      } catch (err) {
        console.error('Error notifying EditorContextProvider listener:', err);
      }
    });
  }
}
