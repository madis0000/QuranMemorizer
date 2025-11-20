/**
 * Prisma Database Seeding Script
 * Seeds the database with all Quran data:
 * - 114 Surahs
 * - 6,236 Verses (with Uthmani, Simple, and Tajweed text)
 * - Translations
 * - Audio URLs
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load .env.local file
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Quran.com API configuration
const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const QURAN_FOUNDATION_API = 'https://api.qurancdn.com';

// Alternative: Use QuranCDN directly (more stable)
const USE_CDN_DIRECT = true;

// Delay helper to avoid rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch with retry logic
async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  delayMs = 1000
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`📡 Fetching: ${url} (attempt ${attempt + 1}/${maxRetries})`);
      const response = await fetch(url);

      if (!response.ok) {
        if (attempt < maxRetries - 1) {
          console.log(`⚠️  HTTP ${response.status}, retrying in ${delayMs}ms...`);
          await delay(delayMs);
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        console.log(`⚠️  Error: ${error}, retrying in ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
}

// Seed Surahs metadata
async function seedSurahs() {
  console.log('\n📖 Seeding Surahs...\n');

  try {
    // Try QuranCDN first, fallback to Quran.com
    let response;
    try {
      response = await fetchWithRetry(`${QURAN_FOUNDATION_API}/chapters`);
    } catch (error) {
      console.log('⚠️  QuranCDN failed, trying Quran.com API...');
      response = await fetchWithRetry(`${QURAN_API_BASE}/chapters`);
    }

    const surahs = response.chapters;

    for (const surah of surahs) {
      await prisma.surah.upsert({
        where: { number: surah.id },
        update: {
          nameArabic: surah.name_arabic,
          nameEnglish: surah.name_complex || surah.name_simple,
          nameSimple: surah.name_simple,
          revelationType: surah.revelation_place,
          versesCount: surah.verses_count,
          bismillahPre: surah.bismillah_pre !== false, // Default to true
        },
        create: {
          number: surah.id,
          nameArabic: surah.name_arabic,
          nameEnglish: surah.name_complex || surah.name_simple,
          nameSimple: surah.name_simple,
          revelationType: surah.revelation_place,
          versesCount: surah.verses_count,
          bismillahPre: surah.bismillah_pre !== false, // Default to true
        },
      });

      console.log(`✅ Surah ${surah.id}: ${surah.name_simple} (${surah.verses_count} verses)`);
    }

    console.log(`\n✨ Successfully seeded ${surahs.length} Surahs!\n`);
  } catch (error) {
    console.error('❌ Error seeding Surahs:', error);
    throw error;
  }
}

// Seed Verses for a specific Surah
async function seedVersesForSurah(surahNumber: number) {
  try {
    const surah = await prisma.surah.findUnique({
      where: { number: surahNumber },
    });

    if (!surah) {
      throw new Error(`Surah ${surahNumber} not found in database`);
    }

    console.log(`\n📝 Seeding verses for Surah ${surahNumber}: ${surah.nameSimple}...\n`);

    // Use Quran.com API for verses (more reliable)
    // Fetch Uthmani script (regular)
    const uthmaniData = await fetchWithRetry(
      `${QURAN_API_BASE}/quran/verses/uthmani?chapter_number=${surahNumber}`
    );

    // Fetch Simple/Imlaei script
    const simpleData = await fetchWithRetry(
      `${QURAN_API_BASE}/quran/verses/imlaei?chapter_number=${surahNumber}`
    );

    // Fetch Uthmani Tajweed (with HTML markup)
    let tajweedData;
    try {
      tajweedData = await fetchWithRetry(
        `${QURAN_API_BASE}/quran/verses/uthmani_tajweed?chapter_number=${surahNumber}`
      );
    } catch (error) {
      console.log(`⚠️  Tajweed data not available for Surah ${surahNumber}`);
      tajweedData = null;
    }

    // Fetch translation (Sahih International - ID 131)
    const translationData = await fetchWithRetry(
      `${QURAN_API_BASE}/quran/translations/131?chapter_number=${surahNumber}`
    );

    // Fetch audio URLs (Alafasy - ID 7)
    let audioData;
    try {
      audioData = await fetchWithRetry(
        `${QURAN_API_BASE}/chapter_recitations/7/${surahNumber}`
      );
    } catch (error) {
      console.log(`⚠️  Audio data not available for Surah ${surahNumber}`);
      audioData = null;
    }

    const verses = uthmaniData.verses;

    for (let i = 0; i < verses.length; i++) {
      const verse = verses[i];
      const verseKey = verse.verse_key;
      const verseNumber = parseInt(verseKey.split(':')[1]);

      // Get corresponding data from other endpoints
      const simpleVerse = simpleData.verses[i];
      const tajweedVerse = tajweedData?.verses?.[i];
      const translationVerse = translationData?.translations?.[i];
      const audioVerse = audioData?.audio_files?.[i];

      await prisma.verse.upsert({
        where: { verseKey: verseKey },
        update: {
          textUthmani: verse.text_uthmani,
          textSimple: simpleVerse?.text_imlaei || simpleVerse?.text_uthmani || verse.text_uthmani,
          textUthmaniTajweed: tajweedVerse?.text_uthmani_tajweed || null,
          translationEn: translationVerse?.text || null,
          audioUrl: audioVerse?.url || null,
          juzNumber: verse.juz_number,
          hizbNumber: verse.hizb_number,
          rubNumber: verse.rub_el_hizb,
          pageNumber: verse.page_number,
        },
        create: {
          surahId: surah.id,
          verseNumber: verseNumber,
          verseKey: verseKey,
          textUthmani: verse.text_uthmani,
          textSimple: simpleVerse?.text_imlaei || simpleVerse?.text_uthmani || verse.text_uthmani,
          textUthmaniTajweed: tajweedVerse?.text_uthmani_tajweed || null,
          translationEn: translationVerse?.text || null,
          audioUrl: audioVerse?.url || null,
          juzNumber: verse.juz_number,
          hizbNumber: verse.hizb_number,
          rubNumber: verse.rub_el_hizb,
          pageNumber: verse.page_number,
        },
      });

      console.log(`  ✅ Verse ${verseKey}`);
    }

    console.log(`\n✨ Successfully seeded ${verses.length} verses for Surah ${surahNumber}!\n`);

    // Rate limiting: delay between surahs
    await delay(500);
  } catch (error) {
    console.error(`❌ Error seeding verses for Surah ${surahNumber}:`, error);
    throw error;
  }
}

// Seed all verses
async function seedAllVerses() {
  console.log('\n📚 Seeding All Verses (6,236 total)...\n');

  for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
    try {
      await seedVersesForSurah(surahNumber);
    } catch (error) {
      console.error(`❌ Failed to seed Surah ${surahNumber}, continuing with next...`);
      // Continue with next surah even if one fails
    }
  }

  console.log('\n🎉 All verses seeded successfully!\n');
}

// Seed Reciters
async function seedReciters() {
  console.log('\n🎙️  Seeding Reciters...\n');

  try {
    // Try CDN first, fallback to Quran.com
    let response;
    try {
      response = await fetchWithRetry(`${QURAN_FOUNDATION_API}/resources/recitations`);
    } catch (error) {
      console.log('⚠️  QuranCDN failed, trying Quran.com API...');
      response = await fetchWithRetry(`${QURAN_API_BASE}/resources/recitations`);
    }

    const recitations = response.recitations;

    for (const recitation of recitations) {
      await prisma.reciter.upsert({
        where: { identifier: recitation.reciter_name },
        update: {
          nameArabic: recitation.translated_name?.name || recitation.reciter_name,
          nameEnglish: recitation.reciter_name,
          style: recitation.style || 'Murattal',
        },
        create: {
          identifier: recitation.reciter_name,
          nameArabic: recitation.translated_name?.name || recitation.reciter_name,
          nameEnglish: recitation.reciter_name,
          style: recitation.style || 'Murattal',
        },
      });

      console.log(`✅ Reciter: ${recitation.reciter_name}`);
    }

    console.log(`\n✨ Successfully seeded ${recitations.length} Reciters!\n`);
  } catch (error) {
    console.error('❌ Error seeding Reciters:', error);
    // Don't throw - reciters are optional
    console.log('⚠️  Continuing without reciters...');
  }
}

// Main seeding function
async function main() {
  console.log('\n🌟 ========================================');
  console.log('🌟  QURAN MEMORIZER - DATABASE SEEDING');
  console.log('🌟 ========================================\n');

  try {
    // Step 1: Seed Surahs
    await seedSurahs();

    // Step 2: Seed all Verses (this will take some time)
    await seedAllVerses();

    // Step 3: Seed Reciters
    await seedReciters();

    console.log('\n✅ ========================================');
    console.log('✅  DATABASE SEEDING COMPLETED!');
    console.log('✅ ========================================\n');

    // Print summary
    const surahCount = await prisma.surah.count();
    const verseCount = await prisma.verse.count();
    const reciterCount = await prisma.reciter.count();

    console.log('📊 Summary:');
    console.log(`   - Surahs: ${surahCount}/114`);
    console.log(`   - Verses: ${verseCount}/6236`);
    console.log(`   - Reciters: ${reciterCount}`);
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Execute seeding
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
