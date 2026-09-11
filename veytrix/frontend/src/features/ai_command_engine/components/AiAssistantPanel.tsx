import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Trash2, CornerDownLeft, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { CommandEngine } from '../services/CommandEngine';
import { CommandExecutor } from '../services/CommandExecutor';
import { EditorContextProvider } from '../services/EditorContextProvider';
import { EditorContext } from '../types/context';

import { useAuth } from '../../../context/AuthContext';
import { BillingMiddleware } from '../services/BillingMiddleware';


export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  isSuccess?: boolean;
  requiresInput?: boolean;
  missingParams?: string[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: "Hi! I'm Veytric AI Command Engine. Tell me what you'd like to edit (e.g. 'split', 'split in half', 'split at 5 seconds', 'trim first 2s').",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

function formatTimeDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const hh = h > 0 ? String(h).padStart(2, '0') + ':' : '';
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `${hh}${mm}:${ss}`;
}

interface AiAssistantPanelProps {
  className?: string;
  editorContext?: EditorContext;
  editorApi?: any;
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

export function AiAssistantPanel(props: AiAssistantPanelProps) {
  const {
    className = '',
    editorContext,
    editorApi,
    onTrim,
    onSplit,
    onDelete,
    onSpeed,
    onMute,
    onVolume,
    onDuplicate,
    onRotate,
    onScale,
    onAspectRatio,
    onDetachAudio,
    onMoveClip,
    onSeekPlayhead,
    onExtendClip,
    onShortenClip,
    onSelectClip,
    onSelectTrack,
    onApplyEffect,
    onApplyFilter,
    onRemoveFilter,
    onAddTransition,
    onRemoveTransition,
    onAddText,
    onEditText,
    onDeleteText,
    onRepositionText,
    onSetAudioFade,
    onNormalizeVolume,
  } = props;


  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-creator-id-100';

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [prompt, setPrompt] = useState('');
  const [activeContext, setActiveContext] = useState<EditorContext>(
    editorContext || EditorContextProvider.getContext()
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize activeContext via props or EditorContextProvider subscription
  useEffect(() => {
    if (editorContext) {
      setActiveContext(editorContext);
      return;
    }
    const unsubscribe = EditorContextProvider.subscribe((ctx) => {
      setActiveContext(ctx);
    });
    return unsubscribe;
  }, [editorContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text: trimmed,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');

    const assistantTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentCtx = editorContext || activeContext;

    const executionOptions = {
      context: currentCtx,
      editorApi,
      onTrim,
      onSplit,
      onDelete,
      onSpeed,
      onMute,
      onVolume,
      onDuplicate,
      onRotate,
      onScale,
      onAspectRatio,
      onDetachAudio,
      onMoveClip,
      onSeekPlayhead,
      onExtendClip,
      onShortenClip,
      onSelectClip,
      onSelectTrack,
      onApplyEffect,
      onApplyFilter,
      onRemoveFilter,
      onAddTransition,
      onRemoveTransition,
      onAddText,
      onEditText,
      onDeleteText,
      onRepositionText,
      onSetAudioFade,
      onNormalizeVolume,
    };

    // Flow: User Prompt -> CommandParser -> CommandValidator -> EditorContext -> CommandExecutor -> Timeline Update
    const parseResult = CommandEngine.parse(trimmed, currentCtx);

    if (parseResult.requiresInput) {
      const clarificationMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: parseResult.message || 'How many seconds would you like to trim?',
        timestamp: assistantTimestamp,
        requiresInput: true,
        missingParams: parseResult.missing,
      };
      setMessages((prev) => [...prev, clarificationMessage]);
      return;
    }

    if (parseResult.isMultiCommand && parseResult.commands && parseResult.commands.length > 0) {
      BillingMiddleware.executeWithBilling({
        userId: activeUserId,
        commandType: 'multi_command_batch',
        amount: parseResult.commands.length,
        actionRunner: () => CommandExecutor.executeBatch(parseResult.commands!, executionOptions),
      }).then((billingRes) => {
        const batchResult = billingRes.data || { success: false, error: billingRes.error };
        if (billingRes.success && batchResult.success) {
          const successMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            sender: 'assistant',
            text: `✓ Executed ${batchResult.executedCount || parseResult.commands!.length} compound commands: ${batchResult.message || 'Complete.'}`,
            timestamp: assistantTimestamp,
            isSuccess: true,
          };
          setMessages((prev) => [...prev, successMessage]);
        } else {
          const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            sender: 'assistant',
            text: billingRes.error || batchResult.error || 'Multi-command batch execution failed.',
            timestamp: assistantTimestamp,
            isError: true,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      });
      return;
    }

    if (!parseResult.success || !parseResult.command) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: parseResult.error || 'Could not understand command',
        timestamp: assistantTimestamp,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const validationResult = CommandEngine.validate(parseResult.command, currentCtx);
    if (!validationResult.valid) {
      const validationErrorMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: validationResult.error || 'Command validation failed',
        timestamp: assistantTimestamp,
        isError: true,
      };
      setMessages((prev) => [...prev, validationErrorMessage]);
      return;
    }

    // Command parsed & validated successfully -> Wrapped with Billing Middleware
    BillingMiddleware.executeWithBilling({
      userId: activeUserId,
      commandType: parseResult.command.action,
      amount: 1,
      actionRunner: () => {
        if (editorApi?.beginTransaction) {
          editorApi.beginTransaction(`AI Action: ${parseResult.command!.action}`);
        }
        return CommandExecutor.execute(parseResult.command!, executionOptions);
      },
    }).then((billingRes) => {
      const execResult = billingRes.data || { success: false, error: billingRes.error };

      if (billingRes.success && execResult.success) {
        if (editorApi?.commitTransaction) {
          editorApi.commitTransaction();
        }
        let feedbackText = '✓ Command executed successfully';
        if (parseResult.command!.action === 'trim') {
          const amount = (parseResult.command!.end || 0) - (parseResult.command!.start || 0);
          feedbackText = `✓ Trimmed first ${amount} second${amount === 1 ? '' : 's'} from selected clip`;
        } else if (parseResult.command!.action === 'split') {
          if (parseResult.command!.mode === 'middle') {
            feedbackText = '✓ Split selected clip in the middle.';
          } else if (parseResult.command!.mode === 'time' && typeof parseResult.command!.time === 'number') {
            feedbackText = `✓ Split selected clip at ${formatTimeDisplay(parseResult.command!.time)}.`;
          } else {
            feedbackText = '✓ Split selected clip at playhead position.';
          }
        }

        const successMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender: 'assistant',
          text: feedbackText,
          timestamp: assistantTimestamp,
          isSuccess: true,
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        if (editorApi?.cancelTransaction) {
          editorApi.cancelTransaction();
        }
        const execErrorMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender: 'assistant',
          text: billingRes.error || execResult.error || 'Failed to execute command on timeline',
          timestamp: assistantTimestamp,
          isError: true,
        };
        setMessages((prev) => [...prev, execErrorMessage]);
      }
    });

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setPrompt(suggestionText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const suggestions = [
    'split',
    'split in half',
    'split at 5 seconds',
    'split at 00:00:05',
    'trim first 2 seconds',
    'speed 2x',
  ];

  return (
    <div className={`flex flex-col h-full bg-surface text-foreground select-none overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wide flex items-center gap-1.5 text-foreground">
              ✨ Local AI Command Engine
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              Auto-Executing Assistant
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            title="Reset Chat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Editor Context Badge Indicator */}
      <div className="px-4 py-1.5 bg-sky-500/10 border-b border-sky-500/20 flex items-center justify-between text-[10px] font-mono text-sky-300">
        <span>Active Clip:</span>
        <span className="font-semibold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-200">
          {activeContext.selectedClipId ? activeContext.selectedClipId : 'None Selected'}
        </span>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-background/30">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {msg.sender === 'assistant' ? (
                  <>
                    <div className="h-4 w-4 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-[9px] text-sky-400 font-bold">
                      ✨
                    </div>
                    <span className="text-[10px] font-medium text-sky-400">Command Engine</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-medium text-muted-foreground">You</span>
                    <User className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className="text-[9px] text-muted-foreground/60 font-mono ml-1">
                  {msg.timestamp}
                </span>
              </div>

              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[92%] break-words shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-sky-500/20 border border-sky-500/35 text-sky-100 rounded-tr-xs'
                    : msg.requiresInput
                    ? 'bg-amber-500/15 border border-amber-500/35 text-amber-200 rounded-tl-xs'
                    : msg.isError
                    ? 'bg-red-500/15 border border-red-500/30 text-red-300 rounded-tl-xs'
                    : msg.isSuccess
                    ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 rounded-tl-xs font-semibold'
                    : 'bg-surface border border-border text-foreground rounded-tl-xs'
                }`}
              >
                {msg.requiresInput ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs mb-0.5">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Clarification Needed</span>
                    </div>
                    <p className="text-amber-100">{msg.text}</p>
                  </div>
                ) : msg.isSuccess ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                ) : msg.isError ? (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts section if message list has only welcome message */}
        {messages.length <= 1 && (
          <div className="w-full space-y-1.5 pt-4">
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80 block text-left px-1">
              Sample Commands
            </span>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="text-[11px] text-left px-2.5 py-1.5 rounded-lg bg-surface/70 border border-border hover:border-sky-500/40 hover:bg-surface-hover/80 text-muted-foreground hover:text-foreground transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{item}</span>
                  <CornerDownLeft className="h-3 w-3 opacity-0 group-hover:opacity-100 text-sky-400 transition-opacity flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area at Bottom */}
      <div className="p-3 border-t border-border bg-surface flex-shrink-0 space-y-2">
        <div className="relative rounded-xl border border-border bg-background focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/40 transition">
          <textarea
            ref={textareaRef}
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type editing instruction..."
            className="w-full bg-transparent px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground resize-none outline-none font-sans disabled:opacity-50"
          />

          <div className="flex items-center justify-between px-2.5 pb-2">
            <span className="text-[9px] text-muted-foreground/70 font-mono">
              Press Enter to execute
            </span>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!prompt.trim()}
              className="h-7 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Send</span>
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistantPanel;
