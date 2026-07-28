import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { ProjectState, HistoryEntry } from './historyTypes';

export interface EditorHistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: (currentState: ProjectState) => ProjectState | null;
  redo: (currentState: ProjectState) => ProjectState | null;
  commit: (label: string, beforeState: ProjectState, afterState: ProjectState) => void;
  beginTransaction: (label: string, currentState: ProjectState) => void;
  commitTransaction: (currentState: ProjectState) => void;
  cancelTransaction: () => ProjectState | null;
  clearHistory: () => void;
  isInTransaction: boolean;
}

const EditorHistoryContext = createContext<EditorHistoryContextType | undefined>(undefined);

const MAX_HISTORY_ENTRIES = 100;

export function isStateEqual(a: ProjectState, b: ProjectState): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (e) {
    return false;
  }
}

export const EditorHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  // Transaction state tracking
  const transactionBaseStateRef = useRef<ProjectState | null>(null);
  const transactionLabelRef = useRef<string>('');

  const beginTransaction = useCallback((label: string, currentState: ProjectState) => {
    // If a transaction is already active, commit it first
    if (transactionBaseStateRef.current) {
      commitTransaction(currentState);
    }
    // Store deep copy of current state
    transactionBaseStateRef.current = JSON.parse(JSON.stringify(currentState));
    transactionLabelRef.current = label;
  }, []);

  const commitTransaction = useCallback((currentState: ProjectState) => {
    const baseState = transactionBaseStateRef.current;
    const label = transactionLabelRef.current;

    transactionBaseStateRef.current = null;
    transactionLabelRef.current = '';

    if (!baseState) return;

    if (isStateEqual(baseState, currentState)) {
      return; // No change, don't create history entry
    }

    const newEntry: HistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'TRANSACTION',
      label,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(baseState))
    };

    setPast((prev) => {
      const next = [...prev, newEntry];
      if (next.length > MAX_HISTORY_ENTRIES) {
        next.shift();
      }
      return next;
    });
    setFuture([]); // Clear redo stack on new edit
  }, []);

  const cancelTransaction = useCallback(() => {
    const baseState = transactionBaseStateRef.current;
    transactionBaseStateRef.current = null;
    transactionLabelRef.current = '';
    return baseState ? JSON.parse(JSON.stringify(baseState)) : null;
  }, []);

  const commit = useCallback((label: string, beforeState: ProjectState, afterState: ProjectState) => {
    // Cancel any active transaction to prevent interference
    transactionBaseStateRef.current = null;
    transactionLabelRef.current = '';

    if (isStateEqual(beforeState, afterState)) {
      return; // No change, don't create history entry
    }

    const newEntry: HistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'ATOMIC',
      label,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(beforeState))
    };

    setPast((prev) => {
      const next = [...prev, newEntry];
      if (next.length > MAX_HISTORY_ENTRIES) {
        next.shift();
      }
      return next;
    });
    setFuture([]); // Clear redo stack on new edit
  }, []);

  const undo = useCallback((currentState: ProjectState) => {
    if (past.length === 0) return null;

    const previousEntry = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));

    // Save current state to redo stack
    const redoEntry: HistoryEntry = {
      id: `hist-redo-${Date.now()}`,
      type: 'REDO_SNAP',
      label: previousEntry.label,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(currentState))
    };
    setFuture((prev) => [redoEntry, ...prev]);

    return JSON.parse(JSON.stringify(previousEntry.state));
  }, [past]);

  const redo = useCallback((currentState: ProjectState) => {
    if (future.length === 0) return null;

    const nextEntry = future[0];
    setFuture((prev) => prev.slice(1));

    // Save current state back to undo stack
    const undoEntry: HistoryEntry = {
      id: `hist-undo-${Date.now()}`,
      type: 'UNDO_SNAP',
      label: nextEntry.label,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(currentState))
    };
    setPast((prev) => [...prev, undoEntry]);

    return JSON.parse(JSON.stringify(nextEntry.state));
  }, [future]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
    transactionBaseStateRef.current = null;
    transactionLabelRef.current = '';
  }, []);

  return (
    <EditorHistoryContext.Provider
      value={{
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        undo,
        redo,
        commit,
        beginTransaction,
        commitTransaction,
        cancelTransaction,
        clearHistory,
        isInTransaction: transactionBaseStateRef.current !== null
      }}
    >
      {children}
    </EditorHistoryContext.Provider>
  );
};

export const useEditorHistory = () => {
  const context = useContext(EditorHistoryContext);
  if (context === undefined) {
    throw new Error('useEditorHistory must be used within an EditorHistoryProvider');
  }
  return context;
};
