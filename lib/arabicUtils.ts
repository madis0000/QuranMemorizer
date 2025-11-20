/**
 * Comprehensive Arabic Text Processing Utilities
 *
 * This module provides robust, production-ready functions for:
 * - Arabic text normalization
 * - Quranic text cleaning
 * - Word matching with Levenshtein distance
 * - Flexible word alignment for speech recognition
 */

/**
 * Comprehensive Arabic text normalization
 * Handles all variations and edge cases for consistent matching
 */
export function normalizeArabicText(text: string, options: {
  removeDiacritics?: boolean;
  normalizeAlef?: boolean;
  normalizeYeh?: boolean;
  normalizeTehMarbuta?: boolean;
  removeKashida?: boolean;
  removeSuperscriptAlef?: boolean;
} = {}): string {
  const {
    removeDiacritics = true,
    normalizeAlef = true,
    normalizeYeh = true,
    normalizeTehMarbuta = true,
    removeKashida = true,
    removeSuperscriptAlef = true,
  } = options;

  let normalized = text;

  // Step 1: Unicode normalization (NFD - Canonical Decomposition)
  normalized = normalized.normalize('NFD');

  // Step 2: Remove Arabic diacritics (Tashkeel) if requested
  // U+064B-U+065F: Arabic diacritical marks (fatha, damma, kasra, sukun, shadda, etc.)
  if (removeDiacritics) {
    normalized = normalized.replace(/[\u064B-\u065F]/g, '');
  }

  // Step 3: Remove zero-width and directional formatting characters
  // U+200B-U+200F: Zero-width spaces, joiners, directional marks
  // U+202A-U+202E: Directional formatting
  // U+FEFF: Zero-width no-break space (BOM)
  normalized = normalized.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '');

  // Step 4: Remove or normalize Quranic-specific marks
  // Superscript Alef (U+0670) - Replace with regular alef for consistent matching
  if (removeSuperscriptAlef) {
    // Replace superscript alef with regular alef (not remove it!)
    // This ensures "مَـٰلِكِ" normalizes to "مالك" not "ملك"
    normalized = normalized.replace(/\u0670/g, 'ا');
  }

  // Step 5: Remove Tatweel/Kashida (Arabic elongation character)
  // U+0640: ـ
  if (removeKashida) {
    normalized = normalized.replace(/\u0640/g, '');
  }

  // Step 6: Normalize Alef variations if requested
  // أ (U+0623): Alef with hamza above
  // إ (U+0625): Alef with hamza below
  // آ (U+0622): Alef with madda
  // ٱ (U+0671): Alef wasla
  // ا (U+0627): Regular alef
  if (normalizeAlef) {
    normalized = normalized.replace(/[أإآٱ]/g, 'ا');
  }

  // Step 7: Normalize Yeh variations if requested
  // ى (U+0649): Alef maksura
  // ئ (U+0626): Yeh with hamza above
  // ي (U+064A): Regular yeh
  if (normalizeYeh) {
    normalized = normalized.replace(/[ىئ]/g, 'ي');
  }

  // Step 8: Normalize Teh Marbuta if requested
  // ة (U+0629): Teh marbuta
  // ه (U+0647): Heh
  if (normalizeTehMarbuta) {
    normalized = normalized.replace(/ة/g, 'ه');
  }

  // Step 9: Remove remaining non-Arabic characters (keep only Arabic letters)
  // U+0600-U+06FF: Arabic block
  // U+0750-U+077F: Arabic Supplement
  // U+08A0-U+08FF: Arabic Extended-A
  // U+FB50-U+FDFF: Arabic Presentation Forms-A
  // U+FE70-U+FEFF: Arabic Presentation Forms-B
  normalized = normalized.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, '');

  // Step 10: Normalize to composed form and trim
  normalized = normalized.normalize('NFC').trim().toLowerCase();

  return normalized;
}

/**
 * Clean Quranic text by removing all Quranic-specific symbols and marks
 * This prepares text for word-by-word splitting
 */
export function cleanQuranicText(text: string): string {
  let cleaned = text.trim();

  // Remove Quranic annotation marks that appear WITHIN words (should not create splits)
  // U+06D6-U+06DC: Small high marks
  // U+06DF-U+06E4: Small letters and marks
  // U+06E7-U+06E8: Small high marks
  // U+06EA-U+06ED: Empty center marks, small marks
  cleaned = cleaned.replace(/[\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g, '');

  // Remove Quranic pause/stop marks that act as SEPARATORS (replace with space)
  // U+06DD: End of ayah mark
  // U+06DE: Start of rub el hizb
  // U+06E5-U+06E6: Small waw, small yeh
  // U+06E9: Place of sajdah
  cleaned = cleaned.replace(/[\u06DD\u06DE\u06E5\u06E6\u06E9]/g, ' ');

  // Remove standalone Quranic symbols
  // ۩ (U+06E9): Sajdah mark
  // ۞ (U+06DE): Start of rub
  cleaned = cleaned.replace(/[۩۞]/g, ' ');

  // Remove Arabic footnote marker
  // U+0600-U+0605: Arabic number signs
  cleaned = cleaned.replace(/[\u0600-\u0605]/g, ' ');

  // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Calculate Levenshtein distance between two strings
 * This is the minimum number of single-character edits (insertions, deletions, substitutions)
 * required to change one string into another.
 *
 * Time complexity: O(m * n) where m and n are string lengths
 * Space complexity: O(min(m, n)) - optimized version
 */
export function levenshteinDistance(str1: string, str2: string): number {
  // Handle edge cases
  if (str1 === str2) return 0;
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;

  // Ensure str1 is the shorter string for space optimization
  if (str1.length > str2.length) {
    [str1, str2] = [str2, str1];
  }

  // Use single array instead of matrix (space optimization)
  let previousRow = Array.from({ length: str1.length + 1 }, (_, i) => i);

  for (let i = 0; i < str2.length; i++) {
    const currentRow = [i + 1];

    for (let j = 0; j < str1.length; j++) {
      const insertCost = currentRow[j] + 1;
      const deleteCost = previousRow[j + 1] + 1;
      const substituteCost = previousRow[j] + (str1[j] === str2[i] ? 0 : 1);

      currentRow.push(Math.min(insertCost, deleteCost, substituteCost));
    }

    previousRow = currentRow;
  }

  return previousRow[str1.length];
}

/**
 * Calculate similarity percentage between two strings based on Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);

  return 1 - (distance / maxLength);
}

/**
 * Map of Quranic mysterious letters to their spelled-out pronunciation
 * These are the "Muqatta'at" (المقطعات) - disconnected letters at the start of some surahs
 */
const MYSTERIOUS_LETTERS_MAP: Record<string, string[]> = {
  'الم': ['الف', 'لام', 'ميم'],
  'المص': ['الف', 'لام', 'ميم', 'صاد'],
  'المر': ['الف', 'لام', 'ميم', 'راء'],
  'الر': ['الف', 'لام', 'راء'],
  'حم': ['حاء', 'ميم'],
  'طه': ['طاء', 'هاء'],
  'طسم': ['طاء', 'سين', 'ميم'],
  'طس': ['طاء', 'سين'],
  'يس': ['ياء', 'سين'],
  'ص': ['صاد'],
  'ق': ['قاف'],
  'ن': ['نون'],
  'كهيعص': ['كاف', 'هاء', 'ياء', 'عين', 'صاد'],
  'حمعسق': ['حاء', 'ميم', 'عين', 'سين', 'قاف'],
};

/**
 * Check if expected word is a mysterious letter and if spoken matches it
 */
function matchMysteriousLetters(spoken: string, expected: string): boolean {
  const normalizedExpected = normalizeArabicText(expected);

  // Check if the expected word is a mysterious letter
  if (MYSTERIOUS_LETTERS_MAP[normalizedExpected]) {
    const expectedLetterNames = MYSTERIOUS_LETTERS_MAP[normalizedExpected];
    const normalizedSpoken = normalizeArabicText(spoken);

    // Check if the spoken word matches any of the letter names
    return expectedLetterNames.some(letterName =>
      normalizeArabicText(letterName) === normalizedSpoken
    );
  }

  return false;
}

/**
 * Match two Arabic words with multiple strategies
 * Returns true if words are considered matching based on strictness level
 */
export function matchArabicWords(
  spoken: string,
  expected: string,
  strictness: 'lenient' | 'medium' | 'strict' = 'medium'
): boolean {
  // Exact match (before normalization)
  if (spoken === expected) return true;

  // Check for mysterious letters (special Quranic notation)
  if (matchMysteriousLetters(spoken, expected)) {
    console.log('🔍 Mysterious letter match:', { spoken, expected });
    return true;
  }

  // Normalize both strings with comprehensive normalization
  const normalizedSpoken = normalizeArabicText(spoken);
  const normalizedExpected = normalizeArabicText(expected);

  console.log('🔍 Arabic Word Matching:', {
    spoken,
    expected,
    normalizedSpoken,
    normalizedExpected,
    strictness
  });

  // Exact match after normalization
  if (normalizedSpoken === normalizedExpected) {
    console.log('  ✅ Exact match after normalization');
    return true;
  }

  // Special handling for superscript alif (dagger alif U+0670)
  // Speech recognition often doesn't capture the alif letter even when pronounced correctly
  // Example: "ذَٰلِكَ" (dhaalika) → spoken as "ذلك" but normalized expected is "ذالك"
  const hasSuperscriptAlif = expected.includes('\u0670');
  if (hasSuperscriptAlif) {
    console.log(`  🔍 Detected superscript alif in "${expected}"`);
    // Try matching WITHOUT the alif that was added from superscript alif
    const expectedWithoutAlif = normalizedExpected.replace(/ا/g, '');
    console.log(`  🔍 Comparing: "${normalizedSpoken}" === "${expectedWithoutAlif}" = ${normalizedSpoken === expectedWithoutAlif}`);

    if (normalizedSpoken === expectedWithoutAlif) {
      console.log('  ✅ Superscript alif match (without alif letter)');
      return true;
    }
  }

  // Define thresholds based on strictness
  const thresholds = {
    strict: { similarity: 0.95, containsRatio: 0.9 },
    medium: { similarity: 0.80, containsRatio: 0.7 },
    lenient: { similarity: 0.65, containsRatio: 0.5 }
  };

  const threshold = thresholds[strictness];

  // Strategy 1: Substring matching (for partial recognition)
  if (normalizedSpoken.includes(normalizedExpected) || normalizedExpected.includes(normalizedSpoken)) {
    const longerLength = Math.max(normalizedSpoken.length, normalizedExpected.length);
    const shorterLength = Math.min(normalizedSpoken.length, normalizedExpected.length);
    const ratio = shorterLength / longerLength;

    if (ratio >= threshold.containsRatio) {
      console.log(`  ✅ Contains match (ratio: ${ratio.toFixed(2)} >= ${threshold.containsRatio})`);
      return true;
    }
  }

  // Strategy 2: Levenshtein distance similarity
  const similarity = calculateSimilarity(normalizedSpoken, normalizedExpected);

  if (similarity >= threshold.similarity) {
    console.log(`  ✅ Similarity match (${(similarity * 100).toFixed(1)}% >= ${(threshold.similarity * 100)}%)`);
    return true;
  }

  console.log(`  ❌ No match (similarity: ${(similarity * 100).toFixed(1)}%, threshold: ${(threshold.similarity * 100)}%)`);
  return false;
}

/**
 * Flexible word alignment using dynamic programming
 * Allows for insertions, deletions, and substitutions in the transcribed text
 * Returns the best alignment of transcribed words to expected words
 */
export interface WordAlignment {
  expectedIndex: number;
  spokenIndex: number;
  isMatch: boolean;
  confidence: number;
}

export function alignWords(
  spokenWords: string[],
  expectedWords: string[],
  strictness: 'lenient' | 'medium' | 'strict' = 'medium'
): WordAlignment[] {
  const alignments: WordAlignment[] = [];

  // Simple greedy alignment for now (can be improved with dynamic programming)
  let spokenIdx = 0;
  let expectedIdx = 0;

  while (spokenIdx < spokenWords.length && expectedIdx < expectedWords.length) {
    const spokenWord = spokenWords[spokenIdx];
    const expectedWord = expectedWords[expectedIdx];

    const isMatch = matchArabicWords(spokenWord, expectedWord, strictness);

    if (isMatch) {
      // Match found - advance both indices
      alignments.push({
        expectedIndex: expectedIdx,
        spokenIndex: spokenIdx,
        isMatch: true,
        confidence: 1.0
      });
      spokenIdx++;
      expectedIdx++;
    } else {
      // No match - try lookahead to see if we can skip/recover
      let foundLater = false;

      // Look ahead up to 3 words in spoken text
      for (let lookahead = 1; lookahead <= Math.min(3, spokenWords.length - spokenIdx - 1); lookahead++) {
        if (matchArabicWords(spokenWords[spokenIdx + lookahead], expectedWord, strictness)) {
          // Found a match later - mark current words as insertions
          for (let i = 0; i < lookahead; i++) {
            alignments.push({
              expectedIndex: expectedIdx,
              spokenIndex: spokenIdx + i,
              isMatch: false,
              confidence: 0.0
            });
          }
          spokenIdx += lookahead;
          foundLater = true;
          break;
        }
      }

      if (!foundLater) {
        // No recovery found - mark as mismatch and advance spoken index
        alignments.push({
          expectedIndex: expectedIdx,
          spokenIndex: spokenIdx,
          isMatch: false,
          confidence: 0.0
        });
        spokenIdx++;
      }
    }
  }

  return alignments;
}

/**
 * Split Arabic text into words, handling Quranic text properly
 */
export function splitIntoWords(text: string): string[] {
  const cleaned = cleanQuranicText(text);
  return cleaned
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0);
}
