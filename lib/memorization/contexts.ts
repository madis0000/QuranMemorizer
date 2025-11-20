// Context-based verse groupings - Thematic organization of verses

import type { MemorizationUnit, VerseReference } from './types';

export interface Context {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  theme: string;
  category: ContextCategory;
  verses: VerseReference[];
  color: string;
  icon: string;
}

export type ContextCategory =
  | 'belief' // Aqeedah
  | 'worship' // Ibadah
  | 'morals' // Akhlaq
  | 'stories' // Stories of Prophets
  | 'law' // Fiqh/Rulings
  | 'afterlife' // Akhirah
  | 'nature' // Creation & Nature
  | 'guidance' // Hidayah
  | 'protection' // Duas & Protection
  | 'gratitude'; // Shukr

/**
 * Curated thematic contexts for meaningful memorization
 */
export const CONTEXTS: Context[] = [
  {
    id: 'ayat-kursi',
    title: 'Ayat al-Kursi & Protection',
    arabicTitle: 'آية الكرسي والحماية',
    description: 'The Verse of the Throne and verses of protection',
    theme: 'Protection and Allah\'s Greatness',
    category: 'protection',
    verses: [
      { surahNumber: 2, verseNumber: 255, key: '2:255' }, // Ayat al-Kursi
      { surahNumber: 2, verseNumber: 256, key: '2:256' },
      { surahNumber: 2, verseNumber: 257, key: '2:257' },
    ],
    color: 'from-blue-500 to-cyan-500',
    icon: '🛡️'
  },
  {
    id: 'last-two-baqarah',
    title: 'Last Two Verses of Al-Baqarah',
    arabicTitle: 'آخر آيتين من البقرة',
    description: 'Protection from Shaitan and beautiful dua',
    theme: 'Faith and Protection',
    category: 'protection',
    verses: [
      { surahNumber: 2, verseNumber: 285, key: '2:285' },
      { surahNumber: 2, verseNumber: 286, key: '2:286' },
    ],
    color: 'from-purple-500 to-pink-500',
    icon: '🌙'
  },
  {
    id: 'morning-protection',
    title: 'Morning Protection (Al-Falaq & An-Nas)',
    arabicTitle: 'المعوذتان',
    description: 'The two Surahs of seeking refuge',
    theme: 'Protection from Evil',
    category: 'protection',
    verses: [
      { surahNumber: 113, verseNumber: 1, key: '113:1' },
      { surahNumber: 113, verseNumber: 2, key: '113:2' },
      { surahNumber: 113, verseNumber: 3, key: '113:3' },
      { surahNumber: 113, verseNumber: 4, key: '113:4' },
      { surahNumber: 113, verseNumber: 5, key: '113:5' },
      { surahNumber: 114, verseNumber: 1, key: '114:1' },
      { surahNumber: 114, verseNumber: 2, key: '114:2' },
      { surahNumber: 114, verseNumber: 3, key: '114:3' },
      { surahNumber: 114, verseNumber: 4, key: '114:4' },
      { surahNumber: 114, verseNumber: 5, key: '114:5' },
      { surahNumber: 114, verseNumber: 6, key: '114:6' },
    ],
    color: 'from-green-500 to-teal-500',
    icon: '☀️'
  },
  {
    id: 'tawheed-verses',
    title: 'Verses of Pure Monotheism',
    arabicTitle: 'آيات التوحيد',
    description: 'Beautiful verses about the Oneness of Allah',
    theme: 'Tawheed and Faith',
    category: 'belief',
    verses: [
      { surahNumber: 112, verseNumber: 1, key: '112:1' },
      { surahNumber: 112, verseNumber: 2, key: '112:2' },
      { surahNumber: 112, verseNumber: 3, key: '112:3' },
      { surahNumber: 112, verseNumber: 4, key: '112:4' },
      { surahNumber: 59, verseNumber: 22, key: '59:22' },
      { surahNumber: 59, verseNumber: 23, key: '59:23' },
      { surahNumber: 59, verseNumber: 24, key: '59:24' },
    ],
    color: 'from-indigo-500 to-purple-500',
    icon: '☪️'
  },
  {
    id: 'jannah-description',
    title: 'Description of Paradise',
    arabicTitle: 'وصف الجنة',
    description: 'Beautiful verses describing Paradise',
    theme: 'Paradise and Reward',
    category: 'afterlife',
    verses: [
      { surahNumber: 55, verseNumber: 46, key: '55:46' },
      { surahNumber: 55, verseNumber: 47, key: '55:47' },
      { surahNumber: 55, verseNumber: 48, key: '55:48' },
      { surahNumber: 55, verseNumber: 49, key: '55:49' },
      { surahNumber: 55, verseNumber: 50, key: '55:50' },
    ],
    color: 'from-emerald-500 to-green-500',
    icon: '🌺'
  },
  {
    id: 'patient-grateful',
    title: 'Verses on Patience & Gratitude',
    arabicTitle: 'الصبر والشكر',
    description: 'Cultivating patience and thankfulness',
    theme: 'Character Development',
    category: 'morals',
    verses: [
      { surahNumber: 2, verseNumber: 153, key: '2:153' },
      { surahNumber: 2, verseNumber: 154, key: '2:154' },
      { surahNumber: 2, verseNumber: 155, key: '2:155' },
      { surahNumber: 2, verseNumber: 156, key: '2:156' },
      { surahNumber: 2, verseNumber: 157, key: '2:157' },
      { surahNumber: 14, verseNumber: 7, key: '14:7' },
    ],
    color: 'from-amber-500 to-orange-500',
    icon: '🌟'
  },
  {
    id: 'trust-in-allah',
    title: 'Trust in Allah (Tawakkul)',
    arabicTitle: 'التوكل على الله',
    description: 'Verses about relying on Allah',
    theme: 'Faith and Trust',
    category: 'belief',
    verses: [
      { surahNumber: 65, verseNumber: 2, key: '65:2' },
      { surahNumber: 65, verseNumber: 3, key: '65:3' },
      { surahNumber: 3, verseNumber: 159, key: '3:159' },
    ],
    color: 'from-sky-500 to-blue-500',
    icon: '🤲'
  },
  {
    id: 'repentance-forgiveness',
    title: 'Repentance & Forgiveness',
    arabicTitle: 'التوبة والمغفرة',
    description: 'Hope, mercy and Allah\'s forgiveness',
    theme: 'Mercy and Hope',
    category: 'guidance',
    verses: [
      { surahNumber: 39, verseNumber: 53, key: '39:53' },
      { surahNumber: 39, verseNumber: 54, key: '39:54' },
      { surahNumber: 4, verseNumber: 110, key: '4:110' },
      { surahNumber: 25, verseNumber: 70, key: '25:70' },
    ],
    color: 'from-rose-500 to-pink-500',
    icon: '💚'
  },
  {
    id: 'nature-signs',
    title: 'Signs in Nature',
    arabicTitle: 'آيات الله في الكون',
    description: 'Reflecting on Allah\'s creation',
    theme: 'Nature and Creation',
    category: 'nature',
    verses: [
      { surahNumber: 88, verseNumber: 17, key: '88:17' },
      { surahNumber: 88, verseNumber: 18, key: '88:18' },
      { surahNumber: 88, verseNumber: 19, key: '88:19' },
      { surahNumber: 88, verseNumber: 20, key: '88:20' },
    ],
    color: 'from-lime-500 to-green-500',
    icon: '🌍'
  },
  {
    id: 'friday-kahf',
    title: 'Friday\'s Treasure (Surah Al-Kahf)',
    arabicTitle: 'سورة الكهف',
    description: 'First 10 verses - Protection from Dajjal',
    theme: 'Weekly Practice',
    category: 'protection',
    verses: [
      { surahNumber: 18, verseNumber: 1, key: '18:1' },
      { surahNumber: 18, verseNumber: 2, key: '18:2' },
      { surahNumber: 18, verseNumber: 3, key: '18:3' },
      { surahNumber: 18, verseNumber: 4, key: '18:4' },
      { surahNumber: 18, verseNumber: 5, key: '18:5' },
      { surahNumber: 18, verseNumber: 6, key: '18:6' },
      { surahNumber: 18, verseNumber: 7, key: '18:7' },
      { surahNumber: 18, verseNumber: 8, key: '18:8' },
      { surahNumber: 18, verseNumber: 9, key: '18:9' },
      { surahNumber: 18, verseNumber: 10, key: '18:10' },
    ],
    color: 'from-violet-500 to-purple-500',
    icon: '📿'
  },
];

/**
 * Convert context to memorization unit
 */
export function contextToUnit(context: Context): MemorizationUnit {
  return {
    id: context.id,
    type: 'context',
    title: context.title,
    arabicTitle: context.arabicTitle,
    description: context.description,
    verses: context.verses,
    metadata: {
      estimatedTime: context.verses.length * 2, // ~2 min per verse
      wordCount: 0, // Calculate from API
      difficulty: context.verses.length <= 5 ? 'beginner' : context.verses.length <= 10 ? 'intermediate' : 'advanced',
      category: context.theme,
      tags: [context.category, context.theme],
    }
  };
}

/**
 * Get contexts by category
 */
export function getContextsByCategory(category: ContextCategory): Context[] {
  return CONTEXTS.filter(c => c.category === category);
}

/**
 * Get recommended contexts for beginners
 */
export function getBeginnerContexts(): Context[] {
  return CONTEXTS.filter(c => c.verses.length <= 7);
}

/**
 * Get daily practice contexts (short, impactful)
 */
export function getDailyPracticeContexts(): Context[] {
  return CONTEXTS.filter(c => c.verses.length <= 5);
}

/**
 * Search contexts by keyword
 */
export function searchContexts(query: string): Context[] {
  const lowerQuery = query.toLowerCase();
  return CONTEXTS.filter(c =>
    c.title.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.theme.toLowerCase().includes(lowerQuery)
  );
}
