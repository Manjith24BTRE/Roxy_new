import { AICommand, ParseResult } from '../types/commands';
import { EditorContext } from '../types/context';
import { initializeCommandRegistry } from '../registry';
import { IntentNormalizer } from '../utils/IntentNormalizer';

export class CommandParser {
  private static registry = initializeCommandRegistry();

  public static parse(prompt: string, context?: EditorContext): ParseResult {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return {
        success: false,
        error: 'Empty prompt provided',
      };
    }

    const { normalized, wasFuzzyMatched } = IntentNormalizer.normalize(trimmed);

    // Try finding matching command with normalized text, fallback to raw
    let matchedResult = this.registry.findMatchingCommand(normalized, context);
    if (!matchedResult && normalized !== trimmed) {
      matchedResult = this.registry.findMatchingCommand(trimmed, context);
    }

    if (!matchedResult) {
      return {
        success: false,
        error: `Could not recognize intent from prompt: "${prompt}"`,
      };
    }

    const { module, match } = matchedResult;
    if (match.missingParams && match.missingParams.length > 0) {
      return {
        success: false,
        requiresInput: true,
        missing: match.missingParams,
        message: match.message || `Missing required parameters for ${module.metadata.name}`,
      };
    }

    const command: AICommand = {
      action: module.metadata.action,
      ...match.extractedParams,
    };

    return {
      success: true,
      command,
      normalizedPrompt: normalized,
      fuzzyMatched: wasFuzzyMatched,
    };
  }
}
