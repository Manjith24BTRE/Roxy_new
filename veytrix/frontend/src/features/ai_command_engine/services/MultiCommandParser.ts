import { AICommand, ParseResult } from '../types/commands';
import { EditorContext } from '../types/context';
import { CommandParser } from './CommandParser';
import { IntentNormalizer } from '../utils/IntentNormalizer';
import { GoalPlanner } from './GoalPlanner';

export class MultiCommandParser {
  /**
   * Evaluates high-level goals via GoalPlanner or splits input prompt by conjunction delimiters
   * and parses sub-prompts into a sequence of executable AICommands.
   */
  public static parse(prompt: string, context?: EditorContext): ParseResult {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return { success: false, error: 'Empty prompt provided.' };
    }

    // 1. Check GoalPlanner for high-level complex goal templates
    const goalResult = GoalPlanner.plan(trimmed, context);
    if (goalResult.matched && goalResult.plan) {
      const planCommands = goalResult.plan.subActions.map((sa) => sa.command);
      return {
        success: true,
        command: planCommands[0],
        commands: planCommands,
        isMultiCommand: planCommands.length > 1,
        normalizedPrompt: prompt,
        message: goalResult.plan.reasoning,
      };
    }

    // 2. Normalize intent and handle typos
    const { normalized, wasFuzzyMatched } = IntentNormalizer.normalize(trimmed);

    // Split compound prompts by conjunctions
    const segments = normalized
      .split(/\s*(?:\b(?:and\s+then|then|and)\b|;|,)\s*/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (segments.length <= 1) {
      const singleResult = CommandParser.parse(normalized, context);
      return {
        ...singleResult,
        normalizedPrompt: normalized,
        fuzzyMatched: wasFuzzyMatched,
      };
    }

    const commands: AICommand[] = [];
    let requiresInput = false;
    let missingParams: string[] = [];

    for (const segment of segments) {
      const subResult = CommandParser.parse(segment, context);
      if (subResult.requiresInput) {
        requiresInput = true;
        missingParams = [...missingParams, ...(subResult.missing || [])];
      }
      if (subResult.success && subResult.command) {
        commands.push(subResult.command);
      }
    }

    if (requiresInput && commands.length === 0) {
      return {
        success: false,
        requiresInput: true,
        missing: missingParams,
        message: 'Additional input required for compound command.',
      };
    }

    if (commands.length === 0) {
      return {
        success: false,
        error: `Could not parse multi-command prompt: "${prompt}"`,
      };
    }

    return {
      success: true,
      command: commands[0],
      commands,
      isMultiCommand: commands.length > 1,
      normalizedPrompt: normalized,
      fuzzyMatched: wasFuzzyMatched,
    };
  }
}
