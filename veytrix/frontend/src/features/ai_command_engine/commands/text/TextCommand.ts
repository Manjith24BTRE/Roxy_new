import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

export class TextCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'add_text',
    name: 'Add / Edit Text Overlay',
    action: 'add_text',
    category: 'timeline',
    aliases: ['add text', 'insert text', 'edit text', 'delete text', 'caption', 'subtitle'],
    description: 'Adds, edits, deletes, or repositions text overlays on timeline.',
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    // Delete text
    if (/\b(delete|remove)\s+(text|caption|subtitle)\b/i.test(lower)) {
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { subAction: 'delete', textId: context?.selectedTextId },
      };
    }

    // Reposition text
    if (/\b(center|reposition|move)\s+(text|caption)\b/i.test(lower)) {
      const position = lower.includes('center') ? { x: 50, y: 50 } : { x: 50, y: 80 };
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { subAction: 'reposition', textId: context?.selectedTextId, position },
      };
    }

    // Add / edit text content match
    const addTextMatch = prompt.match(/\b(add|insert|caption|subtitle|type)\s+(text\s+)?["']?([^"']+)["']?/i);
    if (addTextMatch) {
      const extractedText = addTextMatch[3].replace(/["']/g, '').trim();
      return {
        matched: true,
        confidence: 0.96,
        extractedParams: { subAction: 'add', text: extractedText },
      };
    }

    if (/\b(add|edit)\s+text\b/i.test(lower)) {
      return {
        matched: true,
        confidence: 0.85,
        missingParams: ['text'],
        message: 'What text would you like to add?',
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    if (params.subAction === 'add' && (!params.text || !params.text.trim())) {
      return { valid: false, error: 'Text content cannot be empty.' };
    }
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    if (params.subAction === 'delete') {
      if (!editorApi?.deleteText) {
        return { success: false, error: 'Delete text handler is not connected.' };
      }
      editorApi.deleteText(params.textId || context?.selectedTextId || '');
      return { success: true, message: 'Deleted text overlay.' };
    }

    if (params.subAction === 'reposition') {
      if (!editorApi?.repositionText) {
        return { success: false, error: 'Reposition text handler is not connected.' };
      }
      editorApi.repositionText(params.textId || context?.selectedTextId || '', params.position);
      return { success: true, message: 'Repositioned text overlay.' };
    }

    if (!editorApi?.addText) {
      return { success: false, error: 'Add text handler is not connected.' };
    }

    editorApi.addText(params.text);
    return { success: true, message: `Added text overlay: "${params.text}"` };
  }
}
