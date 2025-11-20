import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prisma client singleton
const prisma = new PrismaClient();

// Server-side OAuth2 token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // If server error (5xx) and not last attempt, retry
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Attempt ${attempt + 1} failed with ${response.status}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed with error. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

// Fetch verse from database
async function fetchVerseFromDatabase(
  verseKey: string,
  textType: string,
  withTajweed: boolean
) {
  try {
    console.log(`🗄️  Checking database for verse ${verseKey}...`);

    const verse = await prisma.verse.findUnique({
      where: { verseKey },
      include: { surah: true },
    });

    if (!verse) {
      console.log(`❌ Verse ${verseKey} not found in database`);
      return null;
    }

    console.log(`✅ Verse ${verseKey} found in database`);

    // Select text based on type and Tajweed preference
    let text: string;
    let hasTajweed = false;

    if (withTajweed && textType === 'uthmani' && verse.textUthmaniTajweed) {
      // Use Uthmani Tajweed (with HTML markup)
      text = verse.textUthmaniTajweed;
      hasTajweed = true;
    } else if (textType === 'uthmani') {
      // Use regular Uthmani
      text = verse.textUthmani;
      hasTajweed = withTajweed; // Enable programmatic Tajweed detection
    } else {
      // Use Simple/Imlaei
      text = verse.textSimple;
      hasTajweed = withTajweed; // Enable programmatic Tajweed detection
    }

    return {
      key: verseKey,
      text,
      translation: verse.translationEn || '',
      transliteration: '',
      surahNumber: verse.surah.number,
      ayahNumber: verse.verseNumber,
      juzNumber: verse.juzNumber || 1,
      audioUrl: verse.audioUrl || `https://verses.quran.com/Abdul_Basit/mp3/${verseKey.replace(':', '').padStart(6, '0')}.mp3`,
      hasTajweed,
    };
  } catch (error) {
    console.error('❌ Database error:', error);
    return null;
  }
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Get new token
  const oauthEndpoint = `${process.env.NEXT_PUBLIC_QURAN_OAUTH_ENDPOINT}/oauth2/token`;
  const clientId = process.env.NEXT_PUBLIC_QURAN_CLIENT_ID || '';
  const clientSecret = process.env.NEXT_PUBLIC_QURAN_CLIENT_SECRET || '';

  // Use Basic Authentication (client_secret_basic) instead of POST body (client_secret_post)
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  console.log('OAuth Request:', {
    endpoint: oauthEndpoint,
    clientId: clientId,
    authMethod: 'client_secret_basic',
  });

  const response = await fetch(oauthEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OAuth Error Response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    throw new Error(`OAuth failed: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Set expiry to 5 minutes before actual expiry
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  console.log('OAuth Success - Token obtained');
  return cachedToken;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const verseKey = searchParams.get('key');
    const translation = searchParams.get('translation') || 'en-sahih-international';
    const audio = searchParams.get('audio') || 'ar.alafasy';
    const textType = searchParams.get('textType') || 'uthmani'; // 'uthmani' or 'simple'
    const withTajweed = searchParams.get('tajweed') === 'true'; // Enable Tajweed highlighting

    if (!verseKey) {
      return NextResponse.json(
        { error: 'Verse key is required' },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 1: Try fetching from database first
    // ============================================
    const dbVerse = await fetchVerseFromDatabase(verseKey, textType, withTajweed);

    if (dbVerse) {
      console.log(`✅ Returning verse from database: ${verseKey}`);
      return NextResponse.json(dbVerse);
    }

    // ============================================
    // STEP 2: Fallback to external APIs
    // ============================================
    console.log(`⚠️  Verse not in database, fetching from external API: ${verseKey}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Build API URL
    const params = new URLSearchParams();
    if (translation) params.append('translation', translation);
    if (audio) params.append('audio', audio);

    const apiUrl = `${process.env.NEXT_PUBLIC_QURAN_API_BASE_URL}/v1/verses/${verseKey}${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    console.log('Fetching verse from:', apiUrl);

    // Fetch verse from Quran API with retry logic
    let response = await fetchWithRetry(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }, 2, 500); // 2 retries with 500ms base delay

    let data;

    // If Quran Foundation API fails, use public Quran.com API as fallback
    if (!response.ok) {
      console.warn('Quran Foundation API failed, using public Quran.com API as fallback');

      // Select text field based on textType and Tajweed preference
      let textField = textType === 'uthmani' ? 'text_uthmani' : 'text_imlaei';

      // Add Tajweed field if requested (only available for Uthmani)
      if (withTajweed && textType === 'uthmani') {
        textField = 'text_uthmani_tajweed';
      }

      // Use public Quran.com API (no auth required) with retry
      const fallbackUrl = `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=131&audio=7&fields=${textField}`;
      console.log('Fetching from fallback:', fallbackUrl, '| Tajweed enabled:', withTajweed);

      response = await fetchWithRetry(fallbackUrl, {}, 3, 1000); // 3 retries with 1s base delay

      if (!response.ok) {
        throw new Error(`Both APIs failed: ${response.statusText}`);
      }

      data = await response.json();

      // Transform Quran.com response to our format
      const verse = data.verse;

      // Generate fallback audio URL for Abdul Basit
      const paddedKey = verseKey.replace(':', '').padStart(6, '0');
      let audioUrl = verse.audio?.url;

      // Check if audio URL is absolute, if not make it absolute
      if (audioUrl && !audioUrl.startsWith('http')) {
        audioUrl = `https://verses.quran.com/${audioUrl}`;
      } else if (!audioUrl) {
        audioUrl = `https://verses.quran.com/Abdul_Basit/mp3/${paddedKey}.mp3`;
      }

      // Get text based on type and Tajweed preference
      let verseText;
      if (withTajweed && textType === 'uthmani') {
        // Uthmani with Tajweed: Use API markup
        verseText = verse.text_uthmani_tajweed;
      } else {
        // Regular text (will use programmatic detection if Tajweed enabled)
        verseText = textType === 'uthmani' ? verse.text_uthmani : verse.text_imlaei;
      }

      console.log('Transformed Quran.com data:', {
        text: verseText?.substring(0, 50),
        hasTranslation: !!verse.translations?.[0],
        audioUrl,
        tajweedEnabled: withTajweed,
        textType
      });

      data = {
        text: verseText,
        translation: verse.translations?.[0]?.text || '',
        transliteration: '', // Not available in this API
        audio_url: audioUrl,
        // Enable Tajweed for both Uthmani and Simple when requested
        // Uthmani uses API markup, Simple uses programmatic detection
        has_tajweed: withTajweed,
      };
    } else {
      data = await response.json();
    }

    // Format response
    const [surahNumber, ayahNumber] = verseKey.split(':').map(Number);

    return NextResponse.json({
      key: verseKey,
      text: data.text || data.arabic || '',
      translation: data.translation,
      transliteration: data.transliteration,
      surahNumber,
      ayahNumber,
      juzNumber: data.juz_number || 1,
      audioUrl: data.audio_url || `https://verses.quran.com/Abdul_Basit/mp3/${verseKey.replace(':', '').padStart(6, '0')}.mp3`,
      hasTajweed: data.has_tajweed || false,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch verse' },
      { status: 500 }
    );
  }
}
