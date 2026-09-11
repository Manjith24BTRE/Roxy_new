/**
 * FuzzyMatcher.ts
 * Deterministic string similarity & Levenshtein distance algorithm for typo-tolerant command parsing.
 */

export class FuzzyMatcher {
  /**
   * Calculate Levenshtein distance between two strings.
   */
  public static levenshteinDistance(a: string, b: string): number {
    const s1 = a.toLowerCase().trim();
    const s2 = b.toLowerCase().trim();

    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[s1.length][s2.length];
  }

  /**
   * Similarity score between 0.0 and 1.0 based on normalized Levenshtein distance.
   */
  public static similarityScore(a: string, b: string): number {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 1.0;
    const dist = this.levenshteinDistance(a, b);
    return 1 - dist / maxLength;
  }

  /**
   * Find closest matching token from candidate list if similarity >= threshold (default 0.75).
   */
  public static findBestMatch(token: string, candidates: string[], minThreshold = 0.75): { match: string; score: number } | null {
    let bestMatch: string | null = null;
    let highestScore = 0;

    for (const candidate of candidates) {
      const score = this.similarityScore(token, candidate);
      if (score >= minThreshold && score > highestScore) {
        highestScore = score;
        bestMatch = candidate;
      }
    }

    if (bestMatch && highestScore >= minThreshold) {
      return { match: bestMatch, score: highestScore };
    }
    return null;
  }
}
