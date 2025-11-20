'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { getVersesForPage } from '@/data/quranPages';
import { PracticeMode } from '@/components/PracticeMode';
import { useUIStore } from '@/store/useUIStore';

interface VerseData {
  verseKey: string;
  text: string;
  surahNumber: number;
  verseNumber: number;
  hasTajweed?: boolean;
}

export default function PagePracticePage() {
  const params = useParams();
  const router = useRouter();
  const pageNumber = parseInt(params.pageNumber as string);

  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get UI preferences
  const { arabicFont } = useUIStore();

  useEffect(() => {
    async function fetchPageVerses() {
      try {
        setLoading(true);
        setError(null);

        // First, get the verse keys for this page from the external API
        const versesData = await getVersesForPage(pageNumber, arabicFont);

        if (versesData.length === 0) {
          throw new Error('No verses found for this page');
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
        console.error('Error fetching page verses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    }

    if (pageNumber >= 1 && pageNumber <= 604) {
      fetchPageVerses();
    } else {
      setError('Invalid page number. Must be between 1 and 604.');
      setLoading(false);
    }
  }, [pageNumber, arabicFont]);

  const handleClose = () => {
    router.push('/memorize');
  };

  const handleNextPage = () => {
    if (pageNumber < 604) {
      router.push(`/memorize/page/${pageNumber + 1}`);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      router.push(`/memorize/page/${pageNumber - 1}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading page {pageNumber}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || verses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {error || 'Unable to load the page. Please try again.'}
            </p>
            <Button onClick={handleClose} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Page Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Combine all verses into one text for full-page practice
  const fullPageText = verses.map(v => v.text).join(' ');
  const juzNumber = Math.ceil(pageNumber / 20);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 space-y-4">
        <Button onClick={handleClose} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Page Selection
        </Button>

        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Page {pageNumber}</h2>
                  <p className="text-sm text-muted-foreground">
                    Juz {juzNumber} • {verses.length} verses • Complete page practice
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Page Range</p>
                <p className="text-lg font-bold text-primary">
                  {verses[0]?.verseKey} - {verses[verses.length - 1]?.verseKey}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Page Practice Mode */}
      <PracticeMode
        verseKey={`Page ${pageNumber}`}
        arabicText={fullPageText}
        audioUrl={`https://verses.quran.com/Abdul_Basit/mp3/${verses[0]?.verseKey.replace(':', '').padStart(6, '0')}.mp3`}
        onClose={handleClose}
        onNextVerse={pageNumber < 604 ? handleNextPage : undefined}
        onPreviousVerse={pageNumber > 1 ? handlePreviousPage : undefined}
        currentVerse={pageNumber}
        hasTajweed={verses.some(v => v.hasTajweed)}
      />

      {/* Page Navigation Footer */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          onClick={handlePreviousPage}
          disabled={pageNumber <= 1}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous Page
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Page {pageNumber} of 604
          </p>
        </div>

        <Button
          onClick={handleNextPage}
          disabled={pageNumber >= 604}
          variant="outline"
        >
          Next Page
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
