/**
 * Test Seeding Script - Al-Fatiha only
 * Use this to test database integration without relying on external APIs
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load .env.local file
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌟 ========================================');
  console.log('🌟  TEST SEED - Al-Fatiha (Surah 1)');
  console.log('🌟 ========================================\n');

  // Seed Surah 1 - Al-Fatiha
  const fatiha = await prisma.surah.upsert({
    where: { number: 1 },
    update: {
      nameArabic: 'الفاتحة',
      nameEnglish: 'Al-Fatihah',
      nameSimple: 'Al-Fatihah',
      revelationType: 'Meccan',
      versesCount: 7,
      bismillahPre: true,
    },
    create: {
      number: 1,
      nameArabic: 'الفاتحة',
      nameEnglish: 'Al-Fatihah',
      nameSimple: 'Al-Fatihah',
      revelationType: 'Meccan',
      versesCount: 7,
      bismillahPre: true,
    },
  });

  console.log('✅ Surah 1: Al-Fatihah created\n');

  // Verses of Al-Fatiha
  const verses = [
    {
      verseNumber: 1,
      uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      simple: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      juz: 1,
      page: 1,
    },
    {
      verseNumber: 2,
      uthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      simple: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      translation: '[All] praise is [due] to Allah, Lord of the worlds -',
      juz: 1,
      page: 1,
    },
    {
      verseNumber: 3,
      uthmani: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      simple: 'الرَّحْمَنِ الرَّحِيمِ',
      translation: 'The Entirely Merciful, the Especially Merciful,',
      juz: 1,
      page: 1,
    },
    {
      verseNumber: 4,
      uthmani: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
      simple: 'مَالِكِ يَوْمِ الدِّينِ',
      translation: 'Sovereign of the Day of Recompense.',
      juz: 1,
      page: 1,
    },
    {
      verseNumber: 5,
      uthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      simple: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: 'It is You we worship and You we ask for help.',
      juz: 1,
      page: 1,
    },
    {
      verseNumber: 6,
      uthmani: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      simple: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      translation: 'Guide us to the straight path -',
      juz: 1,
      page: 1,
    },
    {
      verseNumber: 7,
      uthmani: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      simple: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      translation:
        'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
      juz: 1,
      page: 1,
    },
  ];

  for (const verse of verses) {
    const verseKey = `1:${verse.verseNumber}`;

    await prisma.verse.upsert({
      where: { verseKey },
      update: {
        textUthmani: verse.uthmani,
        textSimple: verse.simple,
        textUthmaniTajweed: null, // Will be populated when we can fetch from API
        translationEn: verse.translation,
        audioUrl: `https://verses.quran.com/Abdul_Basit/mp3/00100${verse.verseNumber}.mp3`,
        juzNumber: verse.juz,
        pageNumber: verse.page,
      },
      create: {
        surahId: fatiha.id,
        verseNumber: verse.verseNumber,
        verseKey,
        textUthmani: verse.uthmani,
        textSimple: verse.simple,
        textUthmaniTajweed: null,
        translationEn: verse.translation,
        audioUrl: `https://verses.quran.com/Abdul_Basit/mp3/00100${verse.verseNumber}.mp3`,
        juzNumber: verse.juz,
        pageNumber: verse.page,
      },
    });

    console.log(`  ✅ Verse ${verseKey}`);
  }

  console.log('\n✅ ========================================');
  console.log('✅  TEST SEED COMPLETED!');
  console.log('✅ ========================================\n');

  // Summary
  const surahCount = await prisma.surah.count();
  const verseCount = await prisma.verse.count();

  console.log('📊 Summary:');
  console.log(`   - Surahs: ${surahCount}`);
  console.log(`   - Verses: ${verseCount}`);
  console.log('\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
