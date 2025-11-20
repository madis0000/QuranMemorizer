'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, BookOpen, ArrowRight, FileText, BookMarked } from 'lucide-react';
import { SURAHS } from '@/data/quranData';
import { PracticeMode } from '@/components/PracticeMode';
import { useUIStore } from '@/store/useUIStore';

interface VerseData {
  verseKey: string;
  text: string;
  verseNumber: number;
  hasTajweed?: boolean;
}

export default function FullSurahPracticePage() {
  const params = useParams();
  const router = useRouter();
  const surahNumber = parseInt(params.surahNumber as string);

  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<'full' | 'pages'>('full'); // New state
  const [currentPage, setCurrentPage] = useState(0); // For page-by-page mode

  const surahInfo = SURAHS.find(s => s.number === surahNumber);
  const { arabicFont } = useUIStore();
  const showTajweed = true; // Always enable Tajweed for beautiful Quranic display

  useEffect(() => {
    async function fetchSurahVerses() {
      try {
        setLoading(true);
        setError(null);

        if (!surahInfo) {
          throw new Error('Surah not found');
        }

        // Fetch all verses for this surah with the appropriate text format
        const versePromises = [];
        for (let i = 1; i <= surahInfo.verses; i++) {
          versePromises.push(
            fetch(`/api/quran/verse?key=${surahNumber}:${i}&textType=${arabicFont}&tajweed=${showTajweed}`)
              .then(res => res.json())
              .then(data => ({
                verseKey: `${surahNumber}:${i}`,
                text: data.text,
                verseNumber: i,
                hasTajweed: data.hasTajweed || false,
              }))
          );
        }

        const versesData = await Promise.all(versePromises);
        setVerses(versesData);

        // Auto-select page mode for long surahs (more than 30 verses)
        if (surahInfo.verses > 30) {
          setPracticeMode('pages');
        }
      } catch (err) {
        console.error('Error fetching surah verses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load surah');
      } finally {
        setLoading(false);
      }
    }

    if (surahNumber >= 1 && surahNumber <= 114) {
      fetchSurahVerses();
    } else {
      setError('Invalid surah number. Must be between 1 and 114.');
      setLoading(false);
    }
  }, [surahNumber, surahInfo, arabicFont, showTajweed]);

  const handleClose = () => {
    router.push('/memorize');
  };

  const handleNextSurah = () => {
    if (surahNumber < 114) {
      router.push(`/memorize/surah/${surahNumber + 1}`);
    }
  };

  const handlePreviousSurah = () => {
    if (surahNumber > 1) {
      router.push(`/memorize/surah/${surahNumber - 1}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading Surah {surahInfo?.name || surahNumber}...</p>
            <p className="text-sm text-muted-foreground">
              {surahInfo?.verses} verses
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !surahInfo || verses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Surah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {error || 'Unable to load the surah. Please try again.'}
            </p>
            <Button onClick={handleClose} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Surah Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Page-based chunking (10-15 verses per page, adjustable based on surah length)
  const versesPerPage = surahInfo && surahInfo.verses > 100 ? 10 : surahInfo && surahInfo.verses > 50 ? 12 : 15;
  const pages: VerseData[][] = [];
  for (let i = 0; i < verses.length; i += versesPerPage) {
    pages.push(verses.slice(i, i + versesPerPage));
  }

  // Get current content based on practice mode
  const getCurrentVerses = () => {
    if (practiceMode === 'full') {
      return verses;
    } else {
      return pages[currentPage] || [];
    }
  };

  const currentVerses = getCurrentVerses();
  const currentText = currentVerses.map(v => v.text).join(' ');
  const currentVerseKey = practiceMode === 'full'
    ? `Surah ${surahInfo?.name} (${surahNumber})`
    : `${surahInfo?.name} - Page ${currentPage + 1}/${pages.length} (Verses ${currentVerses[0]?.verseNumber}-${currentVerses[currentVerses.length - 1]?.verseNumber})`;

  const firstVerseAudio = `https://verses.quran.com/Abdul_Basit/mp3/${surahNumber.toString().padStart(3, '0')}001.mp3`;

  // Handlers for page navigation
  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (surahNumber < 114) {
      handleNextSurah();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (surahNumber > 1) {
      handlePreviousSurah();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Surah Header */}
      <div className="mb-6 space-y-4">
        <Button onClick={handleClose} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Surah Selection
        </Button>

        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{surahInfo.name}</h2>
                    <Badge variant="secondary" className="font-arabic">
                      {surahInfo.arabic}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Surah {surahNumber} • {surahInfo.verses} verses • {surahInfo.revelation}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Practice Mode</p>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {practiceMode === 'full' ? 'Full Surah' : `Page ${currentPage + 1}/${pages.length}`}
                </Badge>
              </div>
            </div>

            {/* Mode Selector - Show for long surahs */}
            {surahInfo.verses > 20 && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm font-semibold text-muted-foreground">Practice Style:</span>
                <div className="flex gap-2">
                  <Button
                    variant={practiceMode === 'full' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPracticeMode('full');
                      setCurrentPage(0);
                    }}
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Full Surah
                    <Badge variant="secondary" className="ml-1">{surahInfo.verses} verses</Badge>
                  </Button>
                  <Button
                    variant={practiceMode === 'pages' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPracticeMode('pages')}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Page by Page
                    <Badge variant="secondary" className="ml-1">{pages.length} pages</Badge>
                  </Button>
                </div>
              </div>
            )}

            {/* Page Navigation - Show in page mode */}
            {practiceMode === 'pages' && pages.length > 1 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Page
                </Button>
                <div className="text-sm font-medium">
                  Page {currentPage + 1} of {pages.length}
                  <span className="text-muted-foreground ml-2">
                    (Verses {currentVerses[0]?.verseNumber}-{currentVerses[currentVerses.length - 1]?.verseNumber})
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === pages.length - 1}
                >
                  Next Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Practice Mode */}
      <PracticeMode
        verseKey={currentVerseKey}
        arabicText={currentText}
        audioUrl={firstVerseAudio}
        onClose={handleClose}
        onNextVerse={practiceMode === 'pages' ? handleNextPage : (surahNumber < 114 ? handleNextSurah : undefined)}
        onPreviousVerse={practiceMode === 'pages' ? handlePreviousPage : (surahNumber > 1 ? handlePreviousSurah : undefined)}
        currentVerse={practiceMode === 'pages' ? currentPage + 1 : surahNumber}
        totalVerses={practiceMode === 'pages' ? pages.length : 114}
        hasTajweed={currentVerses.some(v => v.hasTajweed)}
      />

      {/* Surah Navigation Footer */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          onClick={handlePreviousSurah}
          disabled={surahNumber <= 1}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous Surah
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Surah {surahNumber} of 114
          </p>
        </div>

        <Button
          onClick={handleNextSurah}
          disabled={surahNumber >= 114}
          variant="outline"
        >
          Next Surah
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
