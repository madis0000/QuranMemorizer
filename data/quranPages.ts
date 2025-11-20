/**
 * Quran Page Data
 * The Quran has 604 pages in the standard Madani mushaf
 * Each page contains verses from one or more surahs
 */

export interface PageInfo {
  pageNumber: number;
  juzNumber: number;
  verses: {
    surahNumber: number;
    verseStart: number;
    verseEnd: number;
  }[];
}

/**
 * Get page information for a specific page number
 * This uses the standard Madani mushaf page numbering (1-604)
 */
export function getPageInfo(pageNumber: number): PageInfo | null {
  if (pageNumber < 1 || pageNumber > 604) return null;

  // This is a simplified mapping - in production, you'd want the complete mapping
  // For now, we'll calculate approximate mappings
  const juzNumber = Math.ceil(pageNumber / 20); // Rough approximation

  return {
    pageNumber,
    juzNumber,
    verses: [], // Will be fetched from API
  };
}

/**
 * Get all pages in a Juz
 */
export function getPagesInJuz(juzNumber: number): number[] {
  if (juzNumber < 1 || juzNumber > 30) return [];

  const startPage = (juzNumber - 1) * 20 + 1;
  const endPage = Math.min(juzNumber * 20, 604);

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
}

/**
 * Get page number for a specific verse
 */
export async function getPageForVerse(surahNumber: number, verseNumber: number): Promise<number | null> {
  try {
    // Use Quran.com API to get page number
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${verseNumber}?fields=page_number`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.verse?.page_number || null;
  } catch (error) {
    console.error('Error fetching page number:', error);
    return null;
  }
}

/**
 * Get verses for a specific page
 */
export async function getVersesForPage(
  pageNumber: number,
  textType: 'uthmani' | 'simple' = 'uthmani'
): Promise<{
  surahNumber: number;
  verseNumber: number;
  verseKey: string;
  text: string;
}[]> {
  try {
    // Select the appropriate text field based on textType
    const textField = textType === 'uthmani' ? 'text_uthmani' : 'text_imlaei';

    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?language=ar&words=false&translations=131&fields=${textField}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch page verses');
    }

    const data = await response.json();

    return data.verses.map((verse: any) => ({
      surahNumber: verse.verse_key.split(':')[0],
      verseNumber: verse.verse_key.split(':')[1],
      verseKey: verse.verse_key,
      text: textType === 'uthmani'
        ? (verse.text_uthmani || verse.text_madani || '')
        : (verse.text_imlaei || verse.text_uthmani || ''),
    }));
  } catch (error) {
    console.error('Error fetching verses for page:', error);
    return [];
  }
}
