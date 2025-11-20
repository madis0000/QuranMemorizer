'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { PracticeMode } from '@/components/PracticeMode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SURAHS } from '@/data/quranData';
import { useUIStore } from '@/store/useUIStore';
import { TajweedRulesSettings } from '@/components/TajweedRulesSettings';

interface VerseData {
  key: string;
  text: string;
  audioUrl?: string;
  translation?: string;
  hasTajweed?: boolean;
}

export default function TajweedPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const surahNumber = params.surahNumber as string;
  const verseNumber = searchParams.get('verse') || '1';
  const verseKey = `${surahNumber}:${verseNumber}`;

  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Tajweed section ALWAYS uses Uthmani script with Tajweed enabled
  const textType = 'uthmani'; // Always use Uthmani for Tajweed
  const showTajweed = true;

  // Get surah metadata to check total verses
  const surahInfo = SURAHS.find(s => s.number === parseInt(surahNumber));
  const totalVerses = surahInfo?.verses || 0;
  const currentVerseNum = parseInt(verseNumber);
  const isLastVerse = currentVerseNum >= totalVerses;

  useEffect(() => {
    async function fetchVerse() {
      try {
        setLoading(true);
        setError(null);

        console.log('🎨 [Tajweed] Fetching verse with Tajweed enabled:', {
          verseKey,
          textType,
          showTajweed
        });

        const response = await fetch(
          `/api/quran/verse?key=${verseKey}&translation=en-sahih-international&audio=ar.alafasy&textType=${textType}&tajweed=${showTajweed}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch verse');
        }

        const data = await response.json();

        console.log('🎨 [Tajweed] API Response:', {
          hasText: !!data.text,
          textPreview: data.text?.substring(0, 100),
          hasTajweed: data.hasTajweed
        });

        setVerseData({
          key: verseKey,
          text: data.text,
          audioUrl: data.audioUrl,
          translation: data.translation,
          hasTajweed: data.hasTajweed || false,
        });
      } catch (err) {
        console.error('❌ [Tajweed] Error fetching verse:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load verse';
        setError(`${errorMessage}. The Quran API may be temporarily unavailable.`);
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, [verseKey, textType, retryCount]); // showTajweed is always true

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  const handleClose = () => {
    router.push('/tajweed');
  };

  const handleNextVerse = () => {
    const nextVerse = parseInt(verseNumber) + 1;
    router.push(`/tajweed/${surahNumber}?verse=${nextVerse}`);
  };

  const handlePreviousVerse = () => {
    const prevVerse = Math.max(1, parseInt(verseNumber) - 1);
    router.push(`/tajweed/${surahNumber}?verse=${prevVerse}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
            <p className="text-muted-foreground">Loading verse with Tajweed colors...</p>
            {retryCount > 0 && (
              <p className="text-sm text-amber-600">Retry attempt {retryCount}...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error || !verseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Error Loading Verse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                {error || 'Unable to load the verse. Please try again.'}
              </p>
              <p className="text-xs text-muted-foreground">
                This is usually a temporary issue with the Quran API servers. Please try again in a few moments.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="bg-purple-600 hover:bg-purple-700">
                <span className="mr-2">🔄</span>
                Retry
              </Button>
              <Button onClick={handleClose} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tajweed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tajweed Rules Settings */}
      <TajweedRulesSettings />

      <div className="mb-6 flex items-center justify-between">
        <Button onClick={handleClose} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tajweed Selection
        </Button>
        <div className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-600">🎨 Tajweed Mode Active</p>
        </div>
      </div>

      <PracticeMode
        verseKey={verseData.key}
        arabicText={verseData.text}
        audioUrl={verseData.audioUrl}
        onClose={handleClose}
        onNextVerse={isLastVerse ? undefined : handleNextVerse}
        onPreviousVerse={handlePreviousVerse}
        currentVerse={parseInt(verseNumber)}
        totalVerses={totalVerses}
        hasTajweed={verseData.hasTajweed}
      />
    </div>
  );
}
