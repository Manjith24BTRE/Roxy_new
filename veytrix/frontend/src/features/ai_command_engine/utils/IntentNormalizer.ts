/**
 * IntentNormalizer.ts
 * Synonym mapping and phrase normalization layer converting natural language phrasing to standardized command inputs.
 */

import { FuzzyMatcher } from './FuzzyMatcher';

const SYNONYM_MAP: Record<string, string> = {
  // Trim / Cut
  cut: 'trim',
  shorten: 'trim',
  crop: 'trim',
  chop: 'trim',

  // Delete / Remove
  remove: 'delete',
  erase: 'delete',
  trash: 'delete',
  discard: 'delete',
  clear: 'delete',

  // Speed
  faster: 'speed up',
  accelerate: 'speed up',
  slower: 'slow down',
  decelerate: 'slow down',

  // Audio / Volume
  louder: 'increase volume',
  quieter: 'decrease volume',
  silence: 'mute',

  // Seek / Playhead
  jump: 'move playhead',
  seek: 'move playhead',
  go: 'move playhead',

  // Effects & Filters
  blurr: 'blur',
  shrap: 'sharpen',
  brighten: 'brightness',
};

const KNOWN_KEYWORDS = [
  'trim',
  'split',
  'delete',
  'ripple delete',
  'speed',
  'mute',
  'volume',
  'rotate',
  'scale',
  'effect',
  'aspect ratio',
  'detach audio',
  'move clip',
  'move playhead',
  'extend',
  'shorten',
  'select',
  'filter',
  'transition',
  'add text',
  'fade in',
  'fade out',
  'normalize',
];

export class IntentNormalizer {
  /**
   * Normalizes input prompt by resolving synonyms, colloquialisms, and correcting typos via fuzzy matching.
   */
  public static normalize(prompt: string): { normalized: string; wasFuzzyMatched: boolean } {
    let text = prompt.trim().toLowerCase();
    let wasFuzzyMatched = false;

    // Phrase replacements
    text = text.replace(/\bmake\s+faster\b/g, 'speed up');
    text = text.replace(/\bmake\s+slower\b/g, 'slow down');
    text = text.replace(/\bmake\s+louder\b/g, 'increase volume');
    text = text.replace(/\bmake\s+quieter\b/g, 'decrease volume');
    text = text.replace(/\bturn\s+up\s+(the\s+)?volume\b/g, 'increase volume');
    text = text.replace(/\bturn\s+down\s+(the\s+)?volume\b/g, 'decrease volume');
    text = text.replace(/\bcut\s+first\s+(\d+)\s*s(ec|econds?)?\b/g, 'trim first $1 seconds');
    text = text.replace(/\bcut\s+last\s+(\d+)\s*s(ec|econds?)?\b/g, 'trim last $1 seconds');
    text = text.replace(/\bjump\s+to\s+/g, 'move playhead to ');
    text = text.replace(/\bgo\s+to\s+/g, 'move playhead to ');

    // Word-by-word token normalization and typo correction
    const words = text.split(/\s+/);
    const normalizedWords = words.map((word) => {
      // 1. Direct synonym replacement
      if (SYNONYM_MAP[word]) {
        return SYNONYM_MAP[word];
      }

      // 2. Typo correction if word is not numbers or punctuation
      if (word.length >= 4 && !/^\d+/.test(word) && !/^\W+$/.test(word)) {
        const fuzzy = FuzzyMatcher.findBestMatch(word, KNOWN_KEYWORDS, 0.78);
        if (fuzzy) {
          wasFuzzyMatched = true;
          return fuzzy.match;
        }
      }

      return word;
    });

    return {
      normalized: normalizedWords.join(' '),
      wasFuzzyMatched,
    };
  }
}
