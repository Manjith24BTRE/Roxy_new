import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const FILTER_NAMES = ['cinematic', 'vintage', 'bw', 'black and white', 'neon', 'nature', 'artistic', 'portrait'];

export class FilterCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'filter',
    name: 'Apply / Remove Filter',
    action: 'filter',
    category: 'effects',
    aliases: ['apply filter', 'remove filter', 'replace filter', 'filter'],
    description: 'Applies, replaces, or removes visual filters from selected clip.',
    requiredContext: ['selectedClipId'],
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    if (/\bremove\s+filter\b/i.test(lower) || /\bclear\s+filter\b/i.test(lower)) {
      return {
        matched: true,
        confidence: 0.95,
        extractedParams: { target: context?.selectedClipId, remove: true },
      };
    }

    for (const filterName of FILTER_NAMES) {
      if (lower.includes(filterName)) {
        return {
          matched: true,
          confidence: 0.95,
          extractedParams: {
            target: context?.selectedClipId,
            filterName,
            replace: lower.includes('replace'),
          },
        };
      }
    }

    if (/\b(apply|set|add)\s+filter\b/i.test(lower)) {
      return {
        matched: true,
        confidence: 0.85,
        extractedParams: { target: context?.selectedClipId, filterName: 'cinematic' },
      };
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { valid: false, error: 'No clip selected for filter operation.' };
    }
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    const targetClipId = params.target || context?.selectedClipId;
    if (!targetClipId) {
      return { success: false, error: 'No clip selected for filter operation.' };
    }

    if (params.remove) {
      if (!editorApi?.removeFilter) {
        return { success: false, error: 'Remove filter handler is not connected.' };
      }
      editorApi.removeFilter(targetClipId);
      return { success: true, message: 'Removed filter from clip.' };
    }

    if (!editorApi?.applyFilter) {
      return { success: false, error: 'Apply filter handler is not connected.' };
    }

    editorApi.applyFilter(targetClipId, params.filterName || 'cinematic');
    return { success: true, message: `Applied ${params.filterName || 'cinematic'} filter.` };
  }
}
