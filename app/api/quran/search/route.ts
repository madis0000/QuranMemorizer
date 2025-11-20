import { NextResponse } from 'next/server';
import { normalizeArabicText } from '@/lib/arabicUtils';
import { prisma } from '@/lib/prisma';

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

// Calculate similarity score (0-1, where 1 is perfect match)
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeArabicText(str1);
  const normalized2 = normalizeArabicText(str2);

  // Quick exact match check
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // Check if query is a substring of the verse
  if (normalized2.includes(normalized1)) {
    // Partial match - higher score for longer matches
    return 0.7 + (normalized1.length / normalized2.length) * 0.3;
  }

  // Use Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  if (maxLength === 0) return 0;

  const similarity = 1 - distance / maxLength;
  return Math.max(0, similarity);
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [Search API] Searching for:', query);

    const normalizedQuery = normalizeArabicText(query);
    console.log('🔍 [Search API] Normalized query:', normalizedQuery);

    // PRIORITY 1: Search local database first (much faster!)
    try {
      console.log('🗄️ [Search API] Searching local database...');

      // Test database connection
      await prisma.$connect();
      console.log('✅ [Search API] Database connected successfully');

      // Fetch verses for matching
      // Since Prisma's "contains" is diacritic-sensitive and we need normalized matching,
      // we fetch a reasonable number of verses and do normalization in JavaScript

      // Strategy: Extract first meaningful word from query to filter by surah
      const normalizedQuery = normalizeArabicText(query);
      console.log('🗄️ [Search API] Normalized search query:', normalizedQuery);

      // Fetch verses - prioritize shorter surahs which are more commonly recited
      // For voice search, users typically recite short, well-known surahs
      const verses = await prisma.verse.findMany({
        take: 1000, // Fetch more verses for better matching
        include: {
          surah: true,
        },
        orderBy: {
          surahId: 'desc', // Start with later surahs (Juz 30 - commonly memorized)
        },
      });

      console.log(`🗄️ [Search API] Found ${verses.length} potential matches in database`);

      if (verses.length > 0) {
        // Calculate similarity for each verse
        const matches = verses.map((verse) => {
          const verseText = verse.textUthmani || verse.textSimple || '';
          const confidence = calculateSimilarity(query, verseText);

          return {
            verseKey: verse.verseKey,
            surahNumber: verse.surah.number,
            verseNumber: verse.verseNumber,
            text: verseText,
            confidence,
          };
        });

        // Sort by confidence and filter
        const sortedMatches = matches
          .filter((m) => m.confidence > 0.3)
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5);

        if (sortedMatches.length > 0) {
          console.log(`✅ [Search API] Found ${sortedMatches.length} matches in database`);
          return NextResponse.json({ matches: sortedMatches });
        }
      }

      console.log('⚠️ [Search API] No good matches in database, falling back to external API...');
    } catch (dbError) {
      console.error('❌ [Search API] Database search failed:', dbError);
      console.error('❌ [Search API] Error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      console.log('⚠️ [Search API] Falling back to external API...');
    }

    // FALLBACK: Use Quran.com search API if database search fails
    const searchUrl = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=20&language=ar`;
    console.log('🔍 [Search API] Fetching from external API:', searchUrl);

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('🔍 [Search API] External API response status:', response.status);

      // Handle 204 No Content response
      if (response.status === 204) {
        console.log('⚠️ [Search API] External API returned no content (204)');
        return NextResponse.json({ matches: [] });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Search API] External API error response:', errorText);
        throw new Error(`External search API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 [Search API] External API data structure:', {
        hasSearch: !!data.search,
        hasResults: !!data.search?.results,
        resultsLength: data.search?.results?.length || 0,
      });

      if (!data.search || !data.search.results || data.search.results.length === 0) {
        console.log('❌ [Search API] No results found from external API');
        return NextResponse.json({ matches: [] });
      }

    // Process external API results
    const matches = data.search.results.map((result: any) => {
      const verseKey = result.verse_key;
      const [surahNumber, verseNumber] = verseKey.split(':').map(Number);
      const verseText = result.text || '';
      const confidence = calculateSimilarity(query, verseText);

      return {
        verseKey,
        surahNumber,
        verseNumber,
        text: verseText,
        confidence,
      };
    });

      const sortedMatches = matches
        .filter((m: any) => m.confidence > 0.3)
        .sort((a: any, b: any) => b.confidence - a.confidence)
        .slice(0, 5);

      console.log(`✅ [Search API] Found ${sortedMatches.length} matches from external API`);

      return NextResponse.json({ matches: sortedMatches });
    } catch (externalApiError) {
      console.error('❌ [Search API] External API failed:', externalApiError);
      throw externalApiError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('❌ [Search API] Final error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
