'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BookMarked, ArrowRight } from 'lucide-react';
import { getVersesForJuz, getJuzInfo } from '@/data/quranJuz';
import { PracticeMode } from '@/components/PracticeMode';
import { useUIStore } from '@/store/useUIStore';

interface VerseData {
  verseKey: string;
  text: string;
  surahNumber: number;
  verseNumber: number;
  hasTajweed?: boolean;
}

export default function JuzPracticePage() {
  const params = useParams();
  const router = useRouter();
  const juzNumber = parseInt(params.juzNumber as string);

  const [verses, setVerses] = useState<VerseData[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const juzInfo = getJuzInfo(juzNumber);

  // Get UI preferences
  const { arabicFont } = useUIStore();

  useEffect(() => {
    async function fetchJuzVerses() {
      try {
        setLoading(true);
        setError(null);

        // First, get the verse keys for this Juz from the external API
        const versesData = await getVersesForJuz(juzNumber, arabicFont);

        if (versesData.length === 0) {
          throw new Error('No verses found for this Juz');
        }

        // Now fetch each verse from our local API with Tajweed support
        const tajweedVerses = await Promise.all(
          versesData.map(async (v) => {
            try {
              const response = await fetch(
                `/api/quran/verse?key=${v.verseKey}&textType=${arabicFont}&tajweed=true`
              );
              if (!response.ok) {
                // Fallback to original data if our API fails
                return {
                  verseKey: v.verseKey,
                  text: v.text,
                  surahNumber: parseInt(v.surahNumber.toString()),
                  verseNumber: parseInt(v.verseNumber.toString()),
                  hasTajweed: false,
                };
              }
              const data = await response.json();
              return {
                verseKey: v.verseKey,
                text: data.text,
                surahNumber: parseInt(v.surahNumber.toString()),
                verseNumber: parseInt(v.verseNumber.toString()),
                hasTajweed: data.hasTajweed || false,
              };
            } catch {
              // Fallback to original data on error
              return {
                verseKey: v.verseKey,
                text: v.text,
                surahNumber: parseInt(v.surahNumber.toString()),
                verseNumber: parseInt(v.verseNumber.toString()),
                hasTajweed: false,
              };
            }
          })
        );

        setVerses(tajweedVerses);
      } catch (err) {
        console.error('Error fetching Juz verses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Juz');
      } finally {
        setLoading(false);
      }
    }

    if (juzNumber >= 1 && juzNumber <= 30) {
      fetchJuzVerses();
    } else {
      setError('Invalid Juz number. Must be between 1 and 30.');
      setLoading(false);
    }
  }, [juzNumber, arabicFont]);

  const handleClose = () => {
    router.push('/memorize');
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    } else {
      // Move to next Juz
      if (juzNumber < 30) {
        router.push(`/memorize/juz/${juzNumber + 1}`);
      }
    }
  };

  const handlePreviousVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    } else {
      // Move to previous Juz
      if (juzNumber > 1) {
        router.push(`/memorize/juz/${juzNumber - 1}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading Juz {juzNumber}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || verses.length === 0 || !juzInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Juz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {error || 'Unable to load the Juz. Please try again.'}
            </p>
            <Button onClick={handleClose} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Juz Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentVerse = verses[currentVerseIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Juz Header */}
      <div className="mb-6 space-y-4">
        <Button onClick={handleClose} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Juz Selection
        </Button>

        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {juzNumber}
                </div>
                <div>
                  <h2 className="text-3xl font-bold font-['Amiri']" dir="rtl">
                    {juzInfo.nameArabic}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Juz {juzNumber} • {juzInfo.nameEnglish}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {verses.length} verses • Pages {juzInfo.pages[0]}-{juzInfo.pages[juzInfo.pages.length - 1]}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-primary">
                  {currentVerseIndex + 1} / {verses.length}
                </p>
                <div className="w-32 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-300"
                    style={{ width: `${((currentVerseIndex + 1) / verses.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Mode */}
      <PracticeMode
        verseKey={currentVerse.verseKey}
        arabicText={currentVerse.text}
        audioUrl={`https://verses.quran.com/Abdul_Basit/mp3/${currentVerse.verseKey.replace(':', '').padStart(6, '0')}.mp3`}
        onClose={handleClose}
        onNextVerse={handleNextVerse}
        onPreviousVerse={currentVerseIndex > 0 || juzNumber > 1 ? handlePreviousVerse : undefined}
        currentVerse={currentVerseIndex + 1}
        hasTajweed={currentVerse.hasTajweed}
      />

      {/* Juz Navigation Footer */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          onClick={() => juzNumber > 1 && router.push(`/memorize/juz/${juzNumber - 1}`)}
          disabled={juzNumber <= 1}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous Juz
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Juz {juzNumber} of 30
          </p>
        </div>

        <Button
          onClick={() => juzNumber < 30 && router.push(`/memorize/juz/${juzNumber + 1}`)}
          disabled={juzNumber >= 30}
          variant="outline"
        >
          Next Juz
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
