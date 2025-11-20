/**
 * Tajweed Rule Detector
 * Maps Tajweed HTML classes to specific rules and their characteristics
 */

import { TajweedRuleType } from './audioAnalysis';

export interface TajweedRuleInfo {
  type: TajweedRuleType;
  name: string;
  arabicName: string;
  description: string;
  expectedDuration?: number; // milliseconds
  colorCode: string;
  visualType: 'madd' | 'qalqalah' | 'ikhfa' | 'idgham' | 'iqlab' | 'ghunnah' | 'sukun' | 'normal';
}

/**
 * Map of Tajweed class names to rule information
 */
export const TAJWEED_RULES_MAP: Record<string, TajweedRuleInfo> = {
  // MADD (Elongation) Rules - Multiple spelling variants
  'madda_normal': {
    type: 'madd_2',
    name: 'Madd Normal',
    arabicName: 'مد طبيعي',
    description: 'Natural elongation - 2 counts',
    expectedDuration: 1000, // 2 counts = ~1000ms
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madd_normal': {
    type: 'madd_2',
    name: 'Madd Normal',
    arabicName: 'مد طبيعي',
    description: 'Natural elongation - 2 counts',
    expectedDuration: 1000,
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madda_permissible': {
    type: 'madd_2',
    name: 'Madd Permissible',
    arabicName: 'مد جائز',
    description: 'Permissible elongation - 2 counts',
    expectedDuration: 1000,
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madd_permissible': {
    type: 'madd_2',
    name: 'Madd Permissible',
    arabicName: 'مد جائز',
    description: 'Permissible elongation - 2 counts',
    expectedDuration: 1000,
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madda_necessary': {
    type: 'madd_6',
    name: 'Madd Necessary',
    arabicName: 'مد لازم',
    description: 'Necessary elongation - 6 counts',
    expectedDuration: 3000, // 6 counts = ~3000ms
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madd_necessary': {
    type: 'madd_6',
    name: 'Madd Necessary',
    arabicName: 'مد لازم',
    description: 'Necessary elongation - 6 counts',
    expectedDuration: 3000,
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madda_obligatory': {
    type: 'madd_6',
    name: 'Madd Obligatory',
    arabicName: 'مد واجب',
    description: 'Obligatory elongation - 6 counts',
    expectedDuration: 3000,
    colorCode: '#ff0000',
    visualType: 'madd',
  },
  'madd_obligatory': {
    type: 'madd_6',
    name: 'Madd Obligatory',
    arabicName: 'مد واجب',
    description: 'Obligatory elongation - 6 counts',
    expectedDuration: 3000,
    colorCode: '#ff0000',
    visualType: 'madd',
  },
  'madda_246': {
    type: 'madd_4',
    name: 'Madd Variable',
    arabicName: 'مد متغير',
    description: 'Variable elongation - 2, 4, or 6 counts',
    expectedDuration: 2000, // Default to 4 counts
    colorCode: '#d500b7',
    visualType: 'madd',
  },
  'madd_246': {
    type: 'madd_4',
    name: 'Madd Variable',
    arabicName: 'مد متغير',
    description: 'Variable elongation - 2, 4, or 6 counts',
    expectedDuration: 2000,
    colorCode: '#d500b7',
    visualType: 'madd',
  },

  // QALQALAH (Echo/Bounce) Rules - Multiple spelling variants
  'qalqalah': {
    type: 'qalqalah',
    name: 'Qalqalah',
    arabicName: 'قلقلة',
    description: 'Echoing/bouncing pronunciation',
    expectedDuration: 300, // Short, sharp
    colorCode: '#0088ff',
    visualType: 'qalqalah',
  },
  'qalaqala': {
    type: 'qalqalah',
    name: 'Qalqalah',
    arabicName: 'قلقلة',
    description: 'Echoing/bouncing pronunciation',
    expectedDuration: 300,
    colorCode: '#0088ff',
    visualType: 'qalqalah',
  },
  'qalaqah': {
    type: 'qalqalah',
    name: 'Qalqalah',
    arabicName: 'قلقلة',
    description: 'Echoing/bouncing pronunciation',
    expectedDuration: 300,
    colorCode: '#0088ff',
    visualType: 'qalqalah',
  },

  // IKHFA (Hiding/Concealment) Rules - Multiple spelling variants
  'ikhfa_shafawi': {
    type: 'ikhfa',
    name: 'Ikhfa Shafawi',
    arabicName: 'إخفاء شفوي',
    description: 'Labial hiding with nasalization',
    expectedDuration: 800,
    colorCode: '#169777',
    visualType: 'ikhfa',
  },
  'ikhafa_shafawi': {
    type: 'ikhfa',
    name: 'Ikhfa Shafawi',
    arabicName: 'إخفاء شفوي',
    description: 'Labial hiding with nasalization',
    expectedDuration: 800,
    colorCode: '#169777',
    visualType: 'ikhfa',
  },
  'ikhfa': {
    type: 'ikhfa',
    name: 'Ikhfa',
    arabicName: 'إخفاء',
    description: 'Hiding with nasalization',
    expectedDuration: 800,
    colorCode: '#169777',
    visualType: 'ikhfa',
  },
  'ikhafa': {
    type: 'ikhfa',
    name: 'Ikhfa',
    arabicName: 'إخفاء',
    description: 'Hiding with nasalization',
    expectedDuration: 800,
    colorCode: '#169777',
    visualType: 'ikhfa',
  },

  // IDGHAM (Merging) Rules
  'idgham_shafawi': {
    type: 'idgham',
    name: 'Idgham Shafawi',
    arabicName: 'إدغام شفوي',
    description: 'Labial merging',
    expectedDuration: 600,
    colorCode: '#ff69b4',
    visualType: 'idgham',
  },
  'idgham_ghunna': {
    type: 'ghunnah',
    name: 'Idgham with Ghunnah',
    arabicName: 'إدغام بغنة',
    description: 'Merging with nasalization',
    expectedDuration: 1000, // 2 counts for ghunnah
    colorCode: '#d500b7',
    visualType: 'ghunnah',
  },
  'idgham_w_ghunnah': {
    type: 'ghunnah',
    name: 'Idgham with Ghunnah',
    arabicName: 'إدغام بغنة',
    description: 'Merging with nasalization',
    expectedDuration: 1000,
    colorCode: '#d500b7',
    visualType: 'ghunnah',
  },
  'idgham_wo_ghunnah': {
    type: 'idgham',
    name: 'Idgham without Ghunnah',
    arabicName: 'إدغام بلا غنة',
    description: 'Merging without nasalization',
    expectedDuration: 600,
    colorCode: '#aaaaaa',
    visualType: 'idgham',
  },
  'idgham_mutajanisayn': {
    type: 'idgham',
    name: 'Idgham Mutajanisayn',
    arabicName: 'إدغام متجانسين',
    description: 'Merging of similar letters',
    expectedDuration: 600,
    colorCode: '#d500b7',
    visualType: 'idgham',
  },
  'idgham_mutaqaribayn': {
    type: 'idgham',
    name: 'Idgham Mutaqaribayn',
    arabicName: 'إدغام متقاربين',
    description: 'Merging of close letters',
    expectedDuration: 600,
    colorCode: '#d500b7',
    visualType: 'idgham',
  },

  // IQLAB (Conversion) Rules
  'iqlab': {
    type: 'iqlab',
    name: 'Iqlab',
    arabicName: 'إقلاب',
    description: 'Converting to meem with nasalization',
    expectedDuration: 1000,
    colorCode: '#ff7e1e',
    visualType: 'iqlab',
  },

  // GHUNNAH (Nasalization) Rules - Multiple spelling variants
  'ghunnah': {
    type: 'ghunnah',
    name: 'Ghunnah',
    arabicName: 'غنة',
    description: 'Nasalization - 2 counts',
    expectedDuration: 1000, // 2 counts
    colorCode: '#ff69b4',
    visualType: 'ghunnah',
  },
  'ghunna': {
    type: 'ghunnah',
    name: 'Ghunnah',
    arabicName: 'غنة',
    description: 'Nasalization - 2 counts',
    expectedDuration: 1000,
    colorCode: '#ff69b4',
    visualType: 'ghunnah',
  },

  // SILENT/SUKUN Rules - Multiple spelling variants
  'silent': {
    type: 'sukun',
    name: 'Silent',
    arabicName: 'سكون',
    description: 'Silent letter or pause',
    expectedDuration: 200,
    colorCode: '#aaaaaa',
    visualType: 'sukun',
  },
  'slnt': {
    type: 'sukun',
    name: 'Silent',
    arabicName: 'سكون',
    description: 'Silent letter or pause',
    expectedDuration: 200,
    colorCode: '#aaaaaa',
    visualType: 'sukun',
  },
  'sukun': {
    type: 'sukun',
    name: 'Sukun',
    arabicName: 'سكون',
    description: 'Sukun mark',
    expectedDuration: 200,
    colorCode: '#aaaaaa',
    visualType: 'sukun',
  },
  'laam_shamsiyyah': {
    type: 'sukun',
    name: 'Laam Shamsiyyah',
    arabicName: 'لام شمسية',
    description: 'Solar laam (silent)',
    expectedDuration: 200,
    colorCode: '#aaaaaa',
    visualType: 'sukun',
  },
  'laam_shamsiyah': {
    type: 'sukun',
    name: 'Laam Shamsiyyah',
    arabicName: 'لام شمسية',
    description: 'Solar laam (silent)',
    expectedDuration: 200,
    colorCode: '#aaaaaa',
    visualType: 'sukun',
  },
  'lam_shamsiyah': {
    type: 'sukun',
    name: 'Laam Shamsiyyah',
    arabicName: 'لام شمسية',
    description: 'Solar laam (silent)',
    expectedDuration: 200,
    colorCode: '#aaaaaa',
    visualType: 'sukun',
  },
  'ham_wasl': {
    type: 'sukun',
    name: 'Hamzat Wasl',
    arabicName: 'همزة وصل',
    description: 'Connecting hamza (silent)',
    expectedDuration: 200,
    colorCode: '#d500b7',
    visualType: 'sukun',
  },
};

/**
 * Detect Tajweed rule from HTML class name
 */
export function detectTajweedRule(className: string): TajweedRuleInfo | null {
  const normalizedClass = className.toLowerCase().trim();

  // Direct match
  if (TAJWEED_RULES_MAP[normalizedClass]) {
    return TAJWEED_RULES_MAP[normalizedClass];
  }

  // Partial match (for classes like "madd_obligatory_other_text")
  for (const [key, value] of Object.entries(TAJWEED_RULES_MAP)) {
    if (normalizedClass.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Extract Tajweed rules from Tajweed HTML string
 */
export function extractTajweedRules(tajweedHtml: string): Array<{
  text: string;
  rule: TajweedRuleInfo | null;
  position: number;
}> {
  const rules: Array<{ text: string; rule: TajweedRuleInfo | null; position: number }> = [];

  // Match <tajweed class="...">text</tajweed> tags
  const regex = /<tajweed\s+class=["']?([^"'\s>]+)["']?[^>]*>(.*?)<\/tajweed>/gi;
  let match;
  let position = 0;

  while ((match = regex.exec(tajweedHtml)) !== null) {
    const className = match[1];
    const text = match[2].replace(/<[^>]+>/g, ''); // Remove nested HTML
    const rule = detectTajweedRule(className);

    rules.push({
      text,
      rule,
      position,
    });

    position++;
  }

  return rules;
}

/**
 * Get accuracy color based on score
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 0.9) return '#00ff88'; // Excellent - bright green
  if (accuracy >= 0.75) return '#88ff00'; // Good - yellow-green
  if (accuracy >= 0.6) return '#ffaa00'; // Fair - orange
  return '#ff4444'; // Poor - red
}

/**
 * Get accuracy feedback message
 */
export function getAccuracyFeedback(accuracy: number, ruleName: string): string {
  if (accuracy >= 0.9) {
    return `ممتاز! Perfect ${ruleName}!`;
  } else if (accuracy >= 0.75) {
    return `جيد! Good ${ruleName}`;
  } else if (accuracy >= 0.6) {
    return `حاول مرة أخرى - Try again`;
  } else {
    return `يحتاج تحسين - Needs improvement`;
  }
}

/**
 * Format duration in counts (500ms per count)
 */
export function formatDurationInCounts(ms: number): string {
  const counts = Math.round(ms / 500);
  return `${counts} count${counts !== 1 ? 's' : ''}`;
}

/**
 * Detect Qalqalah letters in Arabic text
 * Qalqalah applies to letters ق ط ب ج د when they have sukoon (ْ)
 *
 * @param arabicText - The Arabic text to analyze
 * @returns TajweedRuleInfo if qalqalah is detected, null otherwise
 */
export function detectQalqalahInText(arabicText: string): TajweedRuleInfo | null {
  // Qalqalah letters: ق ط ب ج د
  const qalqalahLetters = ['ق', 'ط', 'ب', 'ج', 'د'];

  // Sukoon diacritic: ْ
  const sukoonMark = '\u0652'; // ْ

  // Check if any qalqalah letter has sukoon
  for (const letter of qalqalahLetters) {
    // Pattern: qalqalah letter followed by sukoon
    if (arabicText.includes(letter + sukoonMark)) {
      console.log(`✅ [Qalqalah Detector] Found qalqalah letter "${letter}" with sukoon in text: ${arabicText}`);
      return TAJWEED_RULES_MAP['qalqalah'];
    }
  }

  return null;
}
