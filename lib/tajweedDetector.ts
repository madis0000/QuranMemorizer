/**
 * Tajweed Rule Detection System
 *
 * This module provides comprehensive Tajweed rule detection for Arabic Quranic text.
 * It analyzes Arabic text and applies color-coded highlighting based on Tajweed rules.
 *
 * @module tajweedDetector
 * @author QuranMemorizer Team
 * @version 1.0.0
 */

/**
 * Tajweed rule types and their corresponding colors
 */
export enum TajweedRule {
  QALQALAH = 'qalqalah',           // Blue - Echoing sound
  IKHFA = 'ikhfa',                  // Green - Hiding the sound
  IQLAB = 'iqlab',                  // Orange - Conversion
  IDGHAM_GHUNNA = 'idgham_ghunna',  // Pink - Merging with nasal sound
  IDGHAM_NO_GHUNNA = 'idgham_no_ghunna', // Gray - Merging without nasal sound
  GHUNNA = 'ghunna',                // Pink - Nasal sound
  MADD_NORMAL = 'madd_normal',      // Pink - Normal elongation
  MADD_OBLIGATORY = 'madd_obligatory', // Red - Obligatory elongation
  LAM_SHAMSIYAH = 'lam_shamsiyah',  // Gray - Sun letter
  SUKUN = 'sukun',                  // Gray - Absence of vowel
  NONE = 'none'                     // No special rule
}

/**
 * Color mapping for Tajweed rules
 */
export const TAJWEED_COLORS: Record<TajweedRule, string> = {
  [TajweedRule.QALQALAH]: '#0088ff',
  [TajweedRule.IKHFA]: '#169777',
  [TajweedRule.IQLAB]: '#ff7e1e',
  [TajweedRule.IDGHAM_GHUNNA]: '#d500b7',
  [TajweedRule.IDGHAM_NO_GHUNNA]: '#aaaaaa',
  [TajweedRule.GHUNNA]: '#ff69b4',
  [TajweedRule.MADD_NORMAL]: '#d500b7',
  [TajweedRule.MADD_OBLIGATORY]: '#ff0000',
  [TajweedRule.LAM_SHAMSIYAH]: '#aaaaaa',
  [TajweedRule.SUKUN]: '#aaaaaa',
  [TajweedRule.NONE]: ''
};

/**
 * Arabic letter constants
 */
const ARABIC_LETTERS = {
  // Qalqalah letters: ق ط ب ج د
  QALQALAH: ['ق', 'ط', 'ب', 'ج', 'د'],

  // Noon Sakinah/Tanween rules
  IKHFA_LETTERS: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
  IQLAB_LETTER: 'ب',
  IDGHAM_GHUNNA_LETTERS: ['ي', 'ن', 'م', 'و'],
  IDGHAM_NO_GHUNNA_LETTERS: ['ل', 'ر'],

  // Shamsiyah letters (Sun letters)
  SHAMSIYAH: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'],

  // Madd letters
  MADD_ALIF: 'ا',
  MADD_WAW: 'و',
  MADD_YA: 'ي',

  // Special characters
  NOON: 'ن',
  MEEM: 'م',
  LAM: 'ل',
  ALIF: 'ا',

  // Diacritics
  SUKUN: '\u0652',        // ْ
  TANWEEN_FATH: '\u064B', // ً
  TANWEEN_DAMM: '\u064C', // ٌ
  TANWEEN_KASR: '\u064D', // ٍ
  SHADDA: '\u0651',       // ّ
  FATHA: '\u064E',        // َ
  DAMMA: '\u064F',        // ُ
  KASRA: '\u0650',        // ِ
};

/**
 * Interface for detected Tajweed rule
 */
interface TajweedMatch {
  rule: TajweedRule;
  start: number;
  end: number;
  letter: string;
}

/**
 * Utility class for Tajweed rule detection
 */
export class TajweedDetector {
  private text: string;
  private matches: TajweedMatch[] = [];

  constructor(text: string) {
    // Validate and sanitize input
    this.text = this.sanitizeInput(text);
  }

  /**
   * Sanitize input text to prevent XSS and ensure valid Arabic text
   */
  private sanitizeInput(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remove any HTML tags if present
    const cleaned = text.replace(/<[^>]*>/g, '');

    // Validate that the text contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(cleaned);
    if (!hasArabic) {
      console.warn('Text does not contain Arabic characters');
    }

    return cleaned;
  }

  /**
   * Check if a character has Sukun diacritic
   */
  private hasSukun(index: number): boolean {
    if (index >= this.text.length - 1) return false;
    return this.text[index + 1] === ARABIC_LETTERS.SUKUN;
  }

  /**
   * Check if a character has Tanween
   */
  private hasTanween(index: number): boolean {
    if (index >= this.text.length - 1) return false;
    const nextChar = this.text[index + 1];
    return nextChar === ARABIC_LETTERS.TANWEEN_FATH ||
           nextChar === ARABIC_LETTERS.TANWEEN_DAMM ||
           nextChar === ARABIC_LETTERS.TANWEEN_KASR;
  }

  /**
   * Get the next meaningful letter (skipping diacritics)
   */
  private getNextLetter(index: number): { letter: string; index: number } | null {
    const diacritics = [
      ARABIC_LETTERS.SUKUN,
      ARABIC_LETTERS.FATHA,
      ARABIC_LETTERS.DAMMA,
      ARABIC_LETTERS.KASRA,
      ARABIC_LETTERS.SHADDA,
      ARABIC_LETTERS.TANWEEN_FATH,
      ARABIC_LETTERS.TANWEEN_DAMM,
      ARABIC_LETTERS.TANWEEN_KASR
    ];

    let i = index + 1;
    while (i < this.text.length) {
      const char = this.text[i];
      // Skip diacritics and spaces
      if (!diacritics.includes(char) && char !== ' ') {
        return { letter: char, index: i };
      }
      i++;
    }
    return null;
  }

  /**
   * Detect Qalqalah rule
   * Qalqalah occurs when one of the letters ق ط ب ج د has Sukun
   */
  private detectQalqalah(): void {
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      if (ARABIC_LETTERS.QALQALAH.includes(char) && this.hasSukun(i)) {
        this.matches.push({
          rule: TajweedRule.QALQALAH,
          start: i,
          end: i + 2, // Include the sukun
          letter: char
        });
      }
    }
  }

  /**
   * Detect Noon Sakinah and Tanween rules
   */
  private detectNoonSakinahRules(): void {
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      const hasNoonSukun = char === ARABIC_LETTERS.NOON && this.hasSukun(i);
      const tanween = this.hasTanween(i);

      if (hasNoonSukun || tanween) {
        const next = this.getNextLetter(i + 1);
        if (!next) continue;

        // Ikhfa: Hiding
        if (ARABIC_LETTERS.IKHFA_LETTERS.includes(next.letter)) {
          this.matches.push({
            rule: TajweedRule.IKHFA,
            start: i,
            end: tanween ? i + 2 : i + 2,
            letter: char
          });
        }
        // Iqlab: Conversion to Meem
        else if (next.letter === ARABIC_LETTERS.IQLAB_LETTER) {
          this.matches.push({
            rule: TajweedRule.IQLAB,
            start: i,
            end: tanween ? i + 2 : i + 2,
            letter: char
          });
        }
        // Idgham with Ghunna
        else if (ARABIC_LETTERS.IDGHAM_GHUNNA_LETTERS.includes(next.letter)) {
          this.matches.push({
            rule: TajweedRule.IDGHAM_GHUNNA,
            start: i,
            end: tanween ? i + 2 : i + 2,
            letter: char
          });
        }
        // Idgham without Ghunna
        else if (ARABIC_LETTERS.IDGHAM_NO_GHUNNA_LETTERS.includes(next.letter)) {
          this.matches.push({
            rule: TajweedRule.IDGHAM_NO_GHUNNA,
            start: i,
            end: tanween ? i + 2 : i + 2,
            letter: char
          });
        }
      }
    }
  }

  /**
   * Detect Lam Shamsiyah
   */
  private detectLamShamsiyah(): void {
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      // Check for Alif-Lam (ال)
      if (i > 0 && char === ARABIC_LETTERS.LAM && this.text[i - 1] === ARABIC_LETTERS.ALIF) {
        const next = this.getNextLetter(i);
        if (next && ARABIC_LETTERS.SHAMSIYAH.includes(next.letter)) {
          this.matches.push({
            rule: TajweedRule.LAM_SHAMSIYAH,
            start: i,
            end: i + 1,
            letter: char
          });
        }
      }
    }
  }

  /**
   * Main analysis function - detects all Tajweed rules
   */
  public analyze(): TajweedMatch[] {
    this.matches = [];

    // Run all detection methods
    this.detectQalqalah();
    this.detectNoonSakinahRules();
    this.detectLamShamsiyah();
    // TODO: Add more rules (Meem Sakinah, Madd, etc.)

    // Sort matches by start position
    this.matches.sort((a, b) => a.start - b.start);

    return this.matches;
  }

  /**
   * Apply Tajweed colors to the text and return HTML
   */
  public applyColors(): string {
    const matches = this.analyze();

    console.log('🎨 [Tajweed] Analyzing text:', this.text.substring(0, 50));
    console.log('🎨 [Tajweed] Found matches:', matches.length);
    if (matches.length > 0) {
      console.log('🎨 [Tajweed] First few matches:', matches.slice(0, 5));
    }

    if (matches.length === 0) {
      console.warn('⚠️ [Tajweed] No matches found, returning original text');
      return this.text;
    }

    let result = '';
    let lastIndex = 0;

    for (const match of matches) {
      // Add text before the match
      result += this.text.substring(lastIndex, match.start);

      // Add colored span for the match
      const color = TAJWEED_COLORS[match.rule];
      const matchedText = this.text.substring(match.start, match.end);
      result += `<span style="color: ${color};">${matchedText}</span>`;

      lastIndex = match.end;
    }

    // Add remaining text
    result += this.text.substring(lastIndex);

    console.log('✅ [Tajweed] Processed text with colors');
    return result;
  }
}

/**
 * Memoization cache for performance optimization
 */
const tajweedCache = new Map<string, string>();
const CACHE_MAX_SIZE = 1000;

/**
 * Apply Tajweed color-coding to Arabic text
 * This is the main entry point for the Tajweed detection system
 *
 * @param text - The Arabic text to analyze
 * @param useCache - Whether to use caching (default: true)
 * @returns HTML string with color-coded Tajweed rules
 */
export function applyTajweedColors(text: string, useCache: boolean = true): string {
  if (!text) return '';

  // Check cache first for performance
  if (useCache && tajweedCache.has(text)) {
    return tajweedCache.get(text)!;
  }

  // Create detector and apply colors
  const detector = new TajweedDetector(text);
  const result = detector.applyColors();

  // Cache the result
  if (useCache) {
    // Prevent cache from growing too large
    if (tajweedCache.size >= CACHE_MAX_SIZE) {
      const firstKey = tajweedCache.keys().next().value;
      tajweedCache.delete(firstKey);
    }
    tajweedCache.set(text, result);
  }

  return result;
}

/**
 * Clear the Tajweed cache
 */
export function clearTajweedCache(): void {
  tajweedCache.clear();
}
