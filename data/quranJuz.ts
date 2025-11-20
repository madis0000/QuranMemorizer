/**
 * Quran Juz (Para) Data
 * The Quran is divided into 30 equal parts called Juz (also known as Para)
 */

export interface JuzInfo {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
  pages: number[];
}

/**
 * Complete Juz information for all 30 Juz
 */
export const AJZAA: JuzInfo[] = [
  {
    number: 1,
    nameArabic: 'الم',
    nameEnglish: 'Alif Lam Meem',
    startSurah: 1,
    startVerse: 1,
    endSurah: 2,
    endVerse: 141,
    pages: Array.from({ length: 20 }, (_, i) => i + 1),
  },
  {
    number: 2,
    nameArabic: 'سيقول',
    nameEnglish: 'Sayaqul',
    startSurah: 2,
    startVerse: 142,
    endSurah: 2,
    endVerse: 252,
    pages: Array.from({ length: 20 }, (_, i) => i + 21),
  },
  {
    number: 3,
    nameArabic: 'تلك الرسل',
    nameEnglish: 'Tilkar Rusul',
    startSurah: 2,
    startVerse: 253,
    endSurah: 3,
    endVerse: 92,
    pages: Array.from({ length: 20 }, (_, i) => i + 41),
  },
  {
    number: 4,
    nameArabic: 'لن تنالوا',
    nameEnglish: 'Lan Tana Lu',
    startSurah: 3,
    startVerse: 93,
    endSurah: 4,
    endVerse: 23,
    pages: Array.from({ length: 20 }, (_, i) => i + 61),
  },
  {
    number: 5,
    nameArabic: 'والمحصنات',
    nameEnglish: 'Wal Muhsanat',
    startSurah: 4,
    startVerse: 24,
    endSurah: 4,
    endVerse: 147,
    pages: Array.from({ length: 20 }, (_, i) => i + 81),
  },
  {
    number: 6,
    nameArabic: 'لا يحب الله',
    nameEnglish: 'La Yuhibbullah',
    startSurah: 4,
    startVerse: 148,
    endSurah: 5,
    endVerse: 81,
    pages: Array.from({ length: 20 }, (_, i) => i + 101),
  },
  {
    number: 7,
    nameArabic: 'وإذا سمعوا',
    nameEnglish: 'Wa Iza Sami\'u',
    startSurah: 5,
    startVerse: 82,
    endSurah: 6,
    endVerse: 110,
    pages: Array.from({ length: 20 }, (_, i) => i + 121),
  },
  {
    number: 8,
    nameArabic: 'ولو أننا',
    nameEnglish: 'Wa Lau Annana',
    startSurah: 6,
    startVerse: 111,
    endSurah: 7,
    endVerse: 87,
    pages: Array.from({ length: 20 }, (_, i) => i + 141),
  },
  {
    number: 9,
    nameArabic: 'قال الملأ',
    nameEnglish: 'Qalal Mala',
    startSurah: 7,
    startVerse: 88,
    endSurah: 8,
    endVerse: 40,
    pages: Array.from({ length: 20 }, (_, i) => i + 161),
  },
  {
    number: 10,
    nameArabic: 'واعلموا',
    nameEnglish: 'Wa A\'lamu',
    startSurah: 8,
    startVerse: 41,
    endSurah: 9,
    endVerse: 92,
    pages: Array.from({ length: 20 }, (_, i) => i + 181),
  },
  {
    number: 11,
    nameArabic: 'يعتذرون',
    nameEnglish: 'Ya\'tazirun',
    startSurah: 9,
    startVerse: 93,
    endSurah: 11,
    endVerse: 5,
    pages: Array.from({ length: 20 }, (_, i) => i + 201),
  },
  {
    number: 12,
    nameArabic: 'وما من دابة',
    nameEnglish: 'Wa Ma Min Dabbah',
    startSurah: 11,
    startVerse: 6,
    endSurah: 12,
    endVerse: 52,
    pages: Array.from({ length: 20 }, (_, i) => i + 221),
  },
  {
    number: 13,
    nameArabic: 'وما أبرئ',
    nameEnglish: 'Wa Ma Ubri',
    startSurah: 12,
    startVerse: 53,
    endSurah: 14,
    endVerse: 52,
    pages: Array.from({ length: 20 }, (_, i) => i + 241),
  },
  {
    number: 14,
    nameArabic: 'ربما',
    nameEnglish: 'Rubama',
    startSurah: 15,
    startVerse: 1,
    endSurah: 16,
    endVerse: 128,
    pages: Array.from({ length: 20 }, (_, i) => i + 261),
  },
  {
    number: 15,
    nameArabic: 'سبحان',
    nameEnglish: 'Subhana',
    startSurah: 17,
    startVerse: 1,
    endSurah: 18,
    endVerse: 74,
    pages: Array.from({ length: 20 }, (_, i) => i + 281),
  },
  {
    number: 16,
    nameArabic: 'قال ألم',
    nameEnglish: 'Qal Alam',
    startSurah: 18,
    startVerse: 75,
    endSurah: 20,
    endVerse: 135,
    pages: Array.from({ length: 20 }, (_, i) => i + 301),
  },
  {
    number: 17,
    nameArabic: 'اقترب',
    nameEnglish: 'Iqtaraba',
    startSurah: 21,
    startVerse: 1,
    endSurah: 22,
    endVerse: 78,
    pages: Array.from({ length: 20 }, (_, i) => i + 321),
  },
  {
    number: 18,
    nameArabic: 'قد أفلح',
    nameEnglish: 'Qad Aflaha',
    startSurah: 23,
    startVerse: 1,
    endSurah: 25,
    endVerse: 20,
    pages: Array.from({ length: 20 }, (_, i) => i + 341),
  },
  {
    number: 19,
    nameArabic: 'وقال الذين',
    nameEnglish: 'Wa Qalallazina',
    startSurah: 25,
    startVerse: 21,
    endSurah: 27,
    endVerse: 59,
    pages: Array.from({ length: 20 }, (_, i) => i + 361),
  },
  {
    number: 20,
    nameArabic: 'أمن خلق',
    nameEnglish: 'Amman Khalaqa',
    startSurah: 27,
    startVerse: 60,
    endSurah: 29,
    endVerse: 45,
    pages: Array.from({ length: 20 }, (_, i) => i + 381),
  },
  {
    number: 21,
    nameArabic: 'اتل ما أوحي',
    nameEnglish: 'Utlu Ma Uhiya',
    startSurah: 29,
    startVerse: 46,
    endSurah: 33,
    endVerse: 30,
    pages: Array.from({ length: 20 }, (_, i) => i + 401),
  },
  {
    number: 22,
    nameArabic: 'ومن يقنت',
    nameEnglish: 'Wa Man Yaqnut',
    startSurah: 33,
    startVerse: 31,
    endSurah: 36,
    endVerse: 27,
    pages: Array.from({ length: 20 }, (_, i) => i + 421),
  },
  {
    number: 23,
    nameArabic: 'ومالي',
    nameEnglish: 'Wa Mali',
    startSurah: 36,
    startVerse: 28,
    endSurah: 39,
    endVerse: 31,
    pages: Array.from({ length: 20 }, (_, i) => i + 441),
  },
  {
    number: 24,
    nameArabic: 'فمن أظلم',
    nameEnglish: 'Faman Azlam',
    startSurah: 39,
    startVerse: 32,
    endSurah: 41,
    endVerse: 46,
    pages: Array.from({ length: 20 }, (_, i) => i + 461),
  },
  {
    number: 25,
    nameArabic: 'إليه يرد',
    nameEnglish: 'Ilayhi Yuraddu',
    startSurah: 41,
    startVerse: 47,
    endSurah: 45,
    endVerse: 37,
    pages: Array.from({ length: 20 }, (_, i) => i + 481),
  },
  {
    number: 26,
    nameArabic: 'حم',
    nameEnglish: 'Ha Meem',
    startSurah: 46,
    startVerse: 1,
    endSurah: 51,
    endVerse: 30,
    pages: Array.from({ length: 20 }, (_, i) => i + 501),
  },
  {
    number: 27,
    nameArabic: 'قال فما خطبكم',
    nameEnglish: 'Qala Fama Khatbukum',
    startSurah: 51,
    startVerse: 31,
    endSurah: 57,
    endVerse: 29,
    pages: Array.from({ length: 20 }, (_, i) => i + 521),
  },
  {
    number: 28,
    nameArabic: 'قد سمع',
    nameEnglish: 'Qad Sami\'a',
    startSurah: 58,
    startVerse: 1,
    endSurah: 66,
    endVerse: 12,
    pages: Array.from({ length: 20 }, (_, i) => i + 541),
  },
  {
    number: 29,
    nameArabic: 'تبارك',
    nameEnglish: 'Tabarakal',
    startSurah: 67,
    startVerse: 1,
    endSurah: 77,
    endVerse: 50,
    pages: Array.from({ length: 20 }, (_, i) => i + 561),
  },
  {
    number: 30,
    nameArabic: 'عم',
    nameEnglish: 'Amma',
    startSurah: 78,
    startVerse: 1,
    endSurah: 114,
    endVerse: 6,
    pages: Array.from({ length: 24 }, (_, i) => i + 581), // Last Juz has 24 pages (581-604)
  },
];

/**
 * Get Juz information by number
 */
export function getJuzInfo(juzNumber: number): JuzInfo | null {
  if (juzNumber < 1 || juzNumber > 30) return null;
  return AJZAA[juzNumber - 1];
}

/**
 * Get all verses in a Juz (using API)
 */
export async function getVersesForJuz(
  juzNumber: number,
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
      `https://api.quran.com/api/v4/verses/by_juz/${juzNumber}?language=ar&words=false&translations=131&fields=${textField}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch juz verses');
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
    console.error('Error fetching verses for juz:', error);
    return [];
  }
}
