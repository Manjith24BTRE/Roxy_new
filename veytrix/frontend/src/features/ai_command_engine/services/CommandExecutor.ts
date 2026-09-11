import { AICommand } from '../types/commands';
import { EditorContext } from '../types/context';
import { EditorActionApi } from '../commands/base/types';
import { initializeCommandRegistry } from '../registry';

export interface CommandExecutionOptions {
  context?: EditorContext;
  editorApi?: EditorActionApi;
  onTrim?: (targetClipId: string, start: number, end: number) => void;
  onSplit?: (targetClipId: string, splitTime?: number) => { success: boolean; error?: string } | void;
  onDelete?: (targetClipId: string, ripple?: boolean) => void;
  onSpeed?: (targetClipId: string, speed: number) => void;
  onMute?: (targetClipId: string, muted: boolean) => void;
  onVolume?: (targetClipId: string, volume: number) => void;
  onDuplicate?: (targetClipId: string) => void;
  onRotate?: (targetClipId: string, angle: number) => void;
  onScale?: (targetClipId: string, scale: number) => void;
  onAspectRatio?: (format: string) => void;
  onDetachAudio?: (targetClipId: string) => void;
  onMoveClip?: (clipId: string, targetTime: number, trackId?: string) => void;
  onSeekPlayhead?: (time: number) => void;
  onExtendClip?: (clipId: string, seconds: number) => void;
  onShortenClip?: (clipId: string, seconds: number) => void;
  onSelectClip?: (clipId: string) => void;
  onSelectTrack?: (trackId: string) => void;
  onApplyEffect?: (clipId: string, effectType: string, intensity?: number) => void;
  onApplyFilter?: (clipId: string, filterName: string) => void;
  onRemoveFilter?: (clipId: string) => void;
  onAddTransition?: (clipId: string, transitionType: string, duration?: number) => void;
  onRemoveTransition?: (clipId: string) => void;
  onAddText?: (text: string, style?: any) => void;
  onEditText?: (textId: string, newText: string) => void;
  onDeleteText?: (textId: string) => void;
  onRepositionText?: (textId: string, position: { x: number; y: number }) => void;
  onSetAudioFade?: (clipId: string, fadeIn: number, fadeOut: number) => void;
  onNormalizeVolume?: (clipId: string) => void;
}

export interface CommandExecutionResult {
  success: boolean;
  message?: string;
  error?: string;
  executedCount?: number;
}

export class CommandExecutor {
  private static registry = initializeCommandRegistry();

  public static execute(
    command: AICommand,
    options?: CommandExecutionOptions
  ): CommandExecutionResult {
    if (!command || !command.action) {
      return {
        success: false,
        error: 'Invalid command object provided for execution.',
      };
    }

    const commandModule = this.registry.getAll().find((mod) => mod.metadata.action === command.action);
    if (!commandModule) {
      return {
        success: false,
        error: `Execution for action "${command.action}" is not implemented yet in command registry.`,
      };
    }

    // Build unified EditorActionApi bridging callback options and unified API
    const editorApi: EditorActionApi = {
      splitClip: options?.editorApi?.splitClip || options?.onSplit,
      trimClip: options?.editorApi?.trimClip || options?.onTrim,
      deleteClip: options?.editorApi?.deleteClip || options?.onDelete,
      setSpeed: options?.editorApi?.setSpeed || options?.onSpeed,
      setMute: options?.editorApi?.setMute || options?.onMute,
      setVolume: options?.editorApi?.setVolume || options?.onVolume,
      duplicateClip: options?.editorApi?.duplicateClip || options?.onDuplicate,
      rotateClip: options?.editorApi?.rotateClip || options?.onRotate,
      setScale: options?.editorApi?.setScale || options?.onScale,
      setCanvasFormat: options?.editorApi?.setCanvasFormat || options?.onAspectRatio,
      detachAudio: options?.editorApi?.detachAudio || options?.onDetachAudio,
      moveClip: options?.editorApi?.moveClip || options?.onMoveClip,
      seekPlayhead: options?.editorApi?.seekPlayhead || options?.onSeekPlayhead,
      extendClip: options?.editorApi?.extendClip || options?.onExtendClip,
      shortenClip: options?.editorApi?.shortenClip || options?.onShortenClip,
      selectClip: options?.editorApi?.selectClip || options?.onSelectClip,
      selectTrack: options?.editorApi?.selectTrack || options?.onSelectTrack,
      applyEffect: options?.editorApi?.applyEffect || options?.onApplyEffect,
      applyFilter: options?.editorApi?.applyFilter || options?.onApplyFilter,
      removeFilter: options?.editorApi?.removeFilter || options?.onRemoveFilter,
      addTransition: options?.editorApi?.addTransition || options?.onAddTransition,
      removeTransition: options?.editorApi?.removeTransition || options?.onRemoveTransition,
      addText: options?.editorApi?.addText || options?.onAddText,
      editText: options?.editorApi?.editText || options?.onEditText,
      deleteText: options?.editorApi?.deleteText || options?.onDeleteText,
      repositionText: options?.editorApi?.repositionText || options?.onRepositionText,
      setAudioFade: options?.editorApi?.setAudioFade || options?.onSetAudioFade,
      normalizeVolume: options?.editorApi?.normalizeVolume || options?.onNormalizeVolume,
      ...options?.editorApi,
    };

    const result = commandModule.execute(command, editorApi, options?.context);
    if (result instanceof Promise) {
      return {
        success: true,
        message: `Command "${command.action}" dispatched asynchronously.`,
      };
    }
    return result;
  }

  /**
   * Executes a batch of commands sequentially within an atomic transaction.
   * If any step fails, transaction rollback is triggered.
   */
  public static executeBatch(
    commands: AICommand[],
    options?: CommandExecutionOptions
  ): CommandExecutionResult {
    if (!commands || commands.length === 0) {
      return { success: false, error: 'No commands provided in batch.' };
    }

    if (options?.editorApi?.beginTransaction) {
      options.editorApi.beginTransaction(`AI Batch: ${commands.map((c) => c.action).join(', ')}`);
    }

    let executedCount = 0;
    const messages: string[] = [];

    for (let i = 0; i < commands.length; i++) {
      const res = this.execute(commands[i], options);
      if (!res.success) {
        if (options?.editorApi?.cancelTransaction) {
          options.editorApi.cancelTransaction();
        }
        return {
          success: false,
          error: `Batch execution failed at step ${i + 1} (${commands[i].action}): ${res.error}`,
          executedCount,
        };
      }
      executedCount++;
      if (res.message) messages.push(res.message);
    }

    if (options?.editorApi?.commitTransaction) {
      options.editorApi.commitTransaction();
    }

    return {
      success: true,
      message: `Executed ${executedCount} batch actions successfully: ${messages.join('; ')}`,
      executedCount,
    };
  }
}
