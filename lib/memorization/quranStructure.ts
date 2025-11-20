// Quran Structure Data - Complete mapping of Pages, Rub', Hizb, and Juz

import type { MemorizationUnit, VerseReference, UnitMetadata } from './types';

// Quran has 604 pages in the standard Uthmani script (Mushaf Madinah)
export const TOTAL_PAGES = 604;
export const TOTAL_RUBS = 240; // 4 rubs per hizb
export const TOTAL_HIZBS = 60;
export const TOTAL_JUZ = 30;
export const TOTAL_VERSES = 6236;

/**
 * Juz boundaries (starting verse for each Juz)
 * Format: [surahNumber, verseNumber]
 */
export const JUZ_BOUNDARIES: [number, number][] = [
  [1, 1],   // Juz 1 starts at Al-Fatiha 1:1
  [2, 142], // Juz 2 starts at Al-Baqarah 2:142
  [2, 253], // Juz 3 starts at Al-Baqarah 2:253
  [3, 93],  // Juz 4 starts at Al-Imran 3:93
  [4, 24],  // Juz 5 starts at An-Nisa 4:24
  [4, 148], // Juz 6 starts at An-Nisa 4:148
  [5, 82],  // Juz 7 starts at Al-Ma'idah 5:82
  [6, 111], // Juz 8 starts at Al-An'am 6:111
  [7, 88],  // Juz 9 starts at Al-A'raf 7:88
  [8, 41],  // Juz 10 starts at Al-Anfal 8:41
  [9, 93],  // Juz 11 starts at At-Tawbah 9:93
  [11, 6],  // Juz 12 starts at Hud 11:6
  [12, 53], // Juz 13 starts at Yusuf 12:53
  [15, 1],  // Juz 14 starts at Al-Hijr 15:1
  [17, 1],  // Juz 15 starts at Al-Isra 17:1
  [18, 75], // Juz 16 starts at Al-Kahf 18:75
  [21, 1],  // Juz 17 starts at Al-Anbiya 21:1
  [23, 1],  // Juz 18 starts at Al-Mu'minun 23:1
  [25, 21], // Juz 19 starts at Al-Furqan 25:21
  [27, 56], // Juz 20 starts at An-Naml 27:56
  [29, 46], // Juz 21 starts at Al-Ankabut 29:46
  [33, 31], // Juz 22 starts at Al-Ahzab 33:31
  [36, 28], // Juz 23 starts at Ya-Sin 36:28
  [39, 32], // Juz 24 starts at Az-Zumar 39:32
  [41, 47], // Juz 25 starts at Fussilat 41:47
  [46, 1],  // Juz 26 starts at Al-Ahqaf 46:1
  [51, 31], // Juz 27 starts at Adh-Dhariyat 51:31
  [58, 1],  // Juz 28 starts at Al-Mujadila 58:1
  [67, 1],  // Juz 29 starts at Al-Mulk 67:1
  [78, 1],  // Juz 30 starts at An-Naba 78:1
];

/**
 * Page boundaries - Sample data for first 10 pages
 * In production, this should be loaded from a complete dataset
 * Format: { pageNumber: { start: [surah, verse], end: [surah, verse] } }
 */
export const PAGE_BOUNDARIES: Record<number, { start: [number, number], end: [number, number], verses: number }> = {
  1: { start: [1, 1], end: [2, 5], verses: 7 },
  2: { start: [2, 6], end: [2, 16], verses: 11 },
  3: { start: [2, 17], end: [2, 25], verses: 9 },
  4: { start: [2, 26], end: [2, 35], verses: 10 },
  5: { start: [2, 36], end: [2, 45], verses: 10 },
  // ... (In production, load complete data from JSON file)
};

/**
 * Hizb boundaries - Each Hizb is 1/60 of the Quran
 * Sample data for first 5 Hizbs
 */
export const HIZB_BOUNDARIES: Record<number, { start: [number, number], end: [number, number] }> = {
  1: { start: [1, 1], end: [2, 25] },
  2: { start: [2, 26], end: [2, 73] },
  3: { start: [2, 74], end: [2, 105] },
  4: { start: [2, 106], end: [2, 141] },
  5: { start: [2, 142], end: [2, 176] },
  // ... (60 total)
};

/**
 * Get Juz number for a given verse
 */
export function getJuzForVerse(surahNumber: number, verseNumber: number): number {
  for (let i = JUZ_BOUNDARIES.length - 1; i >= 0; i--) {
    const [juzSurah, juzVerse] = JUZ_BOUNDARIES[i];
    if (surahNumber > juzSurah || (surahNumber === juzSurah && verseNumber >= juzVerse)) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get page number for a given verse (approximate calculation)
 * In production, use actual page mapping data
 */
export function getPageForVerse(surahNumber: number, verseNumber: number): number {
  // Simplified calculation - in production, use actual page data
  if (surahNumber === 1) return 1;
  if (surahNumber === 2 && verseNumber <= 5) return 1;

  // For demo purposes, return a calculated value
  // TODO: Replace with actual page mapping
  const approximatePage = Math.floor((surahNumber - 1) * 10 + verseNumber / 10);
  return Math.min(approximatePage, TOTAL_PAGES);
}

/**
 * Get verses for a specific Juz
 */
export function getVersesForJuz(juzNumber: number): VerseReference[] {
  if (juzNumber < 1 || juzNumber > TOTAL_JUZ) {
    throw new Error(`Invalid Juz number: ${juzNumber}`);
  }

  const verses: VerseReference[] = [];
  const [startSurah, startVerse] = JUZ_BOUNDARIES[juzNumber - 1];
  const [endSurah, endVerse] = juzNumber < TOTAL_JUZ
    ? JUZ_BOUNDARIES[juzNumber]
    : [114, 6]; // Last verse of Quran

  // TODO: Implement actual verse collection logic
  // For now, return placeholder
  verses.push({
    surahNumber: startSurah,
    verseNumber: startVerse,
    key: `${startSurah}:${startVerse}`
  });

  return verses;
}

/**
 * Get verses for a specific page
 */
export function getVersesForPage(pageNumber: number): VerseReference[] {
  if (pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    throw new Error(`Invalid page number: ${pageNumber}`);
  }

  const pageData = PAGE_BOUNDARIES[pageNumber];
  if (!pageData) {
    // Return empty for pages not yet mapped
    return [];
  }

  const verses: VerseReference[] = [];
  const [startSurah, startVerse] = pageData.start;
  const [endSurah, endVerse] = pageData.end;

  // TODO: Implement complete verse collection
  // For now, add start verse as placeholder
  verses.push({
    surahNumber: startSurah,
    verseNumber: startVerse,
    key: `${startSurah}:${startVerse}`
  });

  return verses;
}

/**
 * Create a Juz memorization unit
 */
export function createJuzUnit(juzNumber: number): MemorizationUnit {
  const verses = getVersesForJuz(juzNumber);
  const [startSurah, startVerse] = JUZ_BOUNDARIES[juzNumber - 1];

  return {
    id: `juz-${juzNumber}`,
    type: 'juz',
    title: `Juz ${juzNumber}`,
    arabicTitle: `الجزء ${toArabicNumber(juzNumber)}`,
    description: `Complete Juz ${juzNumber} - Approximately 20 pages`,
    verses,
    metadata: {
      estimatedTime: 120, // ~2 hours for a Juz
      wordCount: 0, // Calculate dynamically
      difficulty: juzNumber <= 3 ? 'intermediate' : juzNumber <= 28 ? 'advanced' : 'beginner',
      juzNumber,
    }
  };
}

/**
 * Create a Page memorization unit
 */
export function createPageUnit(pageNumber: number): MemorizationUnit {
  const verses = getVersesForPage(pageNumber);

  return {
    id: `page-${pageNumber}`,
    type: 'page',
    title: `Page ${pageNumber}`,
    arabicTitle: `صفحة ${toArabicNumber(pageNumber)}`,
    description: `Quran page ${pageNumber} - Approximately 15 verses`,
    verses,
    metadata: {
      estimatedTime: 10, // ~10 minutes per page
      wordCount: 0,
      difficulty: 'intermediate',
      pageNumber,
    }
  };
}

/**
 * Create a Hizb memorization unit
 */
export function createHizbUnit(hizbNumber: number): MemorizationUnit {
  return {
    id: `hizb-${hizbNumber}`,
    type: 'hizb',
    title: `Hizb ${hizbNumber}`,
    arabicTitle: `الحزب ${toArabicNumber(hizbNumber)}`,
    description: `Complete Hizb ${hizbNumber} - Half of a Juz (approximately 10 pages)`,
    verses: [],
    metadata: {
      estimatedTime: 60, // ~1 hour
      wordCount: 0,
      difficulty: 'advanced',
      hizbNumber,
    }
  };
}

/**
 * Create a Rub' (quarter) memorization unit
 */
export function createRubUnit(rubNumber: number): MemorizationUnit {
  return {
    id: `rub-${rubNumber}`,
    type: 'rub',
    title: `Rub' ${rubNumber}`,
    arabicTitle: `الربع ${toArabicNumber(rubNumber)}`,
    description: `Quarter ${rubNumber} - Quarter of a Hizb (approximately 5 pages)`,
    verses: [],
    metadata: {
      estimatedTime: 30, // ~30 minutes
      wordCount: 0,
      difficulty: 'intermediate',
      rubNumber,
    }
  };
}

/**
 * Convert number to Arabic numeral string
 */
function toArabicNumber(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
}

/**
 * Calculate estimated time for a unit based on verse count
 */
export function calculateEstimatedTime(verseCount: number): number {
  // Roughly 1 minute per verse for memorization practice
  return Math.ceil(verseCount * 1.2);
}

/**
 * Get unit description with stats
 */
export function getUnitStats(unit: MemorizationUnit): string {
  const verseCount = unit.verses.length;
  const time = unit.metadata.estimatedTime;

  return `${verseCount} verses • ~${time} min • ${unit.metadata.difficulty}`;
}
