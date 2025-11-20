import type { Verse, Surah, QuranAPIConfig, APIResponse } from '@/types';

class QuranAPIService {
  private config: QuranAPIConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_QURAN_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_QURAN_CLIENT_SECRET || '',
      oauthEndpoint: process.env.NEXT_PUBLIC_QURAN_OAUTH_ENDPOINT || '',
      apiBaseUrl: process.env.NEXT_PUBLIC_QURAN_API_BASE_URL || '',
    };
  }

  /**
   * Authenticate with Quran Foundation API using OAuth2 client credentials flow
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.config.oauthEndpoint}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry to be safe
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    } catch (error) {
      console.error('Quran API authentication error:', error);
      throw error;
    }
  }

  /**
   * Check if token is expired and refresh if needed
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Make an authenticated API request
   */
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    await this.ensureValidToken();

    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get a specific verse by key (e.g., "1:1" for Al-Fatihah, verse 1)
   */
  async getVerse(
    verseKey: string,
    options?: {
      translation?: string; // Translation ID
      transliteration?: boolean;
      tafsir?: string; // Tafsir ID
      audio?: string; // Reciter ID
    }
  ): Promise<Verse> {
    const params = new URLSearchParams();
    if (options?.translation) params.append('translation', options.translation);
    if (options?.transliteration) params.append('transliteration', 'true');
    if (options?.tafsir) params.append('tafsir', options.tafsir);
    if (options?.audio) params.append('audio', options.audio);

    const queryString = params.toString();
    const endpoint = `/v1/verses/${verseKey}${queryString ? `?${queryString}` : ''}`;

    const data = await this.makeRequest<any>(endpoint);

    return this.formatVerse(data);
  }

  /**
   * Get all verses from a Surah
   */
  async getSurahVerses(
    surahNumber: number,
    options?: {
      translation?: string;
      transliteration?: boolean;
      audio?: string;
    }
  ): Promise<Verse[]> {
    const params = new URLSearchParams();
    if (options?.translation) params.append('translation', options.translation);
    if (options?.transliteration) params.append('transliteration', 'true');
    if (options?.audio) params.append('audio', options.audio);

    const queryString = params.toString();
    const endpoint = `/v1/surahs/${surahNumber}/verses${queryString ? `?${queryString}` : ''}`;

    const data = await this.makeRequest<any>(endpoint);

    return data.verses?.map((v: any) => this.formatVerse(v)) || [];
  }

  /**
   * Get a range of verses
   */
  async getVerseRange(
    startKey: string,
    endKey: string,
    options?: {
      translation?: string;
      audio?: string;
    }
  ): Promise<Verse[]> {
    const params = new URLSearchParams();
    params.append('start', startKey);
    params.append('end', endKey);
    if (options?.translation) params.append('translation', options.translation);
    if (options?.audio) params.append('audio', options.audio);

    const endpoint = `/v1/verses/range?${params.toString()}`;
    const data = await this.makeRequest<any>(endpoint);

    return data.verses?.map((v: any) => this.formatVerse(v)) || [];
  }

  /**
   * Get list of all Surahs
   */
  async getAllSurahs(): Promise<Surah[]> {
    const data = await this.makeRequest<any>('/v1/surahs');

    return data.surahs?.map((s: any) => ({
      number: s.number,
      name: s.name,
      englishName: s.english_name,
      arabicName: s.arabic_name,
      numberOfAyahs: s.number_of_ayahs,
      revelationType: s.revelation_type,
    })) || [];
  }

  /**
   * Get a specific Surah's information
   */
  async getSurah(surahNumber: number): Promise<Surah> {
    const data = await this.makeRequest<any>(`/v1/surahs/${surahNumber}`);

    return {
      number: data.number,
      name: data.name,
      englishName: data.english_name,
      arabicName: data.arabic_name,
      numberOfAyahs: data.number_of_ayahs,
      revelationType: data.revelation_type,
    };
  }

  /**
   * Search for verses by text
   */
  async searchVerses(
    query: string,
    options?: {
      language?: string;
      size?: number;
      page?: number;
    }
  ): Promise<APIResponse<Verse[]>> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options?.language) params.append('language', options.language);
    if (options?.size) params.append('size', options.size.toString());
    if (options?.page) params.append('page', options.page.toString());

    const endpoint = `/v1/search?${params.toString()}`;
    const data = await this.makeRequest<any>(endpoint);

    return {
      data: data.results?.map((v: any) => this.formatVerse(v)) || [],
      timestamp: new Date(),
    };
  }

  /**
   * Get audio URL for a verse
   */
  async getVerseAudio(verseKey: string, reciterId: string): Promise<string> {
    const endpoint = `/v1/verses/${verseKey}/audio/${reciterId}`;
    const data = await this.makeRequest<any>(endpoint);

    return data.audio_url || '';
  }

  /**
   * Get available translations
   */
  async getTranslations(): Promise<{ id: string; name: string; language: string }[]> {
    const data = await this.makeRequest<any>('/v1/translations');

    return data.translations?.map((t: any) => ({
      id: t.id,
      name: t.name,
      language: t.language,
    })) || [];
  }

  /**
   * Get available reciters
   */
  async getReciters(): Promise<{ id: string; name: string; style: string }[]> {
    const data = await this.makeRequest<any>('/v1/reciters');

    return data.reciters?.map((r: any) => ({
      id: r.id,
      name: r.name,
      arabicName: r.arabic_name || r.name,
      style: r.style || 'Murattal',
    })) || [];
  }

  /**
   * Get Tafsir (interpretation) for a verse
   */
  async getTafsir(verseKey: string, tafsirId: string): Promise<string> {
    const endpoint = `/v1/verses/${verseKey}/tafsir/${tafsirId}`;
    const data = await this.makeRequest<any>(endpoint);

    return data.text || '';
  }

  /**
   * Format API verse data to our Verse type
   */
  private formatVerse(data: any): Verse {
    const [surahNumber, ayahNumber] = data.key?.split(':').map(Number) || [0, 0];

    return {
      key: data.key || `${surahNumber}:${ayahNumber}`,
      text: data.text || data.arabic || '',
      translation: data.translation,
      transliteration: data.transliteration,
      surahNumber,
      ayahNumber,
      juzNumber: data.juz_number || 1,
      audioUrl: data.audio_url,
    };
  }

  /**
   * Get verse of the day (random meaningful verse)
   */
  async getVerseOfTheDay(): Promise<Verse> {
    // Popular verses that are commonly memorized
    const popularVerses = [
      '1:1', '2:255', '112:1', '113:1', '114:1', // Al-Fatihah, Ayatul Kursi, Last 3 Surahs
      '55:13', '3:26', '2:286', '59:22', '67:2', // Beautiful verses
    ];

    const randomIndex = Math.floor(Math.random() * popularVerses.length);
    return this.getVerse(popularVerses[randomIndex], { translation: 'en-sahih-international' });
  }
}

// Export singleton instance
export const quranAPI = new QuranAPIService();
