import { BaseCommand } from '../base/BaseCommand';
import { CommandMetadata, CommandParseMatch, CommandExecutionResult, EditorActionApi } from '../base/types';
import { EditorContext } from '../../types/context';
import { ValidationResult } from '../../services/CommandValidator';

const ASPECT_RATIO_PRESETS: Array<{ pattern: RegExp; format: string }> = [
  { pattern: /\b(16:9|landscape|youtube|widescreen)\b/i, format: '16:9' },
  { pattern: /\b(9:16|portrait|tiktok|shorts|reels|vertical)\b/i, format: '9:16' },
  { pattern: /\b(1:1|square|instagram)\b/i, format: '1:1' },
  { pattern: /\b(4:5|social|feed)\b/i, format: '4:5' },
];

export class AspectRatioCommand extends BaseCommand {
  public metadata: CommandMetadata = {
    id: 'aspect_ratio',
    name: 'Aspect Ratio Command',
    action: 'aspect_ratio',
    category: 'transform',
    aliases: [
      'aspect ratio',
      'canvas ratio',
      'set aspect ratio',
      '16:9',
      '9:16',
      '1:1',
      '4:5',
      'tiktok format',
      'youtube format',
      'shorts format',
    ],
    description: 'Sets video canvas aspect ratio (16:9, 9:16, 1:1, 4:5).',
  };

  public parse(prompt: string, context?: EditorContext): CommandParseMatch {
    const lower = prompt.trim().toLowerCase();

    for (const preset of ASPECT_RATIO_PRESETS) {
      if (preset.pattern.test(lower)) {
        return {
          matched: true,
          confidence: 0.98,
          extractedParams: { format: preset.format },
        };
      }
    }

    return { matched: false, confidence: 0 };
  }

  public validate(params: Record<string, any>, context?: EditorContext): ValidationResult {
    const validFormats = ['16:9', '9:16', '1:1', '4:5'];
    if (!params.format || !validFormats.includes(params.format)) {
      return { valid: false, error: 'Valid aspect ratio formats are 16:9, 9:16, 1:1, or 4:5.' };
    }
    return { valid: true };
  }

  public execute(
    params: Record<string, any>,
    editorApi?: EditorActionApi,
    context?: EditorContext
  ): CommandExecutionResult {
    if (!editorApi?.setCanvasFormat) {
      return { success: false, error: 'Canvas format handler is not connected to editor.' };
    }

    editorApi.setCanvasFormat(params.format);
    return { success: true, message: `Changed canvas aspect ratio to ${params.format}.` };
  }
}
