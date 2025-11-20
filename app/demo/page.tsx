'use client';

import { useState, useEffect } from 'react';
import { VerseCard } from '@/components/VerseCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Verse, MemorizationProgress } from '@/types';
import { useUIStore } from '@/store/useUIStore';

// Initial sample verse data (will be loaded from API)
const initialVerse: Verse = {
  key: '1:1',
  text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  transliteration: 'Bismillah ir-Rahman ir-Raheem',
  surahNumber: 1,
  ayahNumber: 1,
  juzNumber: 1,
  audioUrl: '', // Will be loaded from API
};

const sampleProgress: MemorizationProgress = {
  verseKey: '1:1',
  strength: 0.75,
  lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  nextReview: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  totalReviews: 12,
  consecutiveCorrect: 3,
  mistakes: [],
  efactor: 2.3,
  interval: 7,
};

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [sampleVerse, setSampleVerse] = useState<Verse>(initialVerse);
  const [loading, setLoading] = useState(true);

  // Get selected reciter from settings
  const currentReciter = useUIStore((state) => state.currentReciter);
  const translationLanguage = useUIStore((state) => state.translationLanguage);

  // Load verse from API on mount
  useEffect(() => {
    loadVerse();
  }, [currentReciter, translationLanguage]);

  const loadVerse = async () => {
    try {
      setLoading(true);
      // Use server-side API route to avoid CORS issues with OAuth2
      const response = await fetch(`/api/quran/verse?key=1:1&translation=${translationLanguage}&audio=${currentReciter}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const verse = await response.json();
      setSampleVerse(verse);
    } catch (error) {
      console.error('Error loading verse:', error);
      // Use fallback verse if API fails
      setSampleVerse(initialVerse);
    } finally {
      setLoading(false);
    }
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!sampleVerse.audioUrl) {
      alert('Audio URL not available. The API may not have returned audio data.');
      return;
    }

    if (!audioElement) {
      try {
        // Create audio element on first play
        const audio = new Audio(sampleVerse.audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.onplay = () => setIsPlaying(true);
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          alert('Could not play audio. The audio source may not be accessible.');
        };
        setAudioElement(audio);
        await audio.play();
      } catch (error) {
        console.error('Error creating audio:', error);
        alert('Could not play audio. Please check console for details.');
      }
    } else {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading verse from Quran Foundation API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100">
          Component Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore the beautiful components built for the Quran Memorizer app.
          This page demonstrates the VerseCard and AudioPlayer components in action.
        </p>
        {sampleVerse.audioUrl && (
          <p className="text-xs text-green-600 dark:text-green-400">
            ✅ API Connected - Audio URL Loaded
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="verse-card" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="verse-card">Verse Card</TabsTrigger>
          <TabsTrigger value="audio-player">Audio Player</TabsTrigger>
          <TabsTrigger value="combined">Combined</TabsTrigger>
        </TabsList>

        {/* Verse Card Demo */}
        <TabsContent value="verse-card" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VerseCard Component</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The VerseCard component displays Quranic verses with Arabic text, translation,
                transliteration, and memorization progress tracking.
              </p>

              <div className="grid gap-4">
                {/* With Progress */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">With Progress Tracking</h3>
                  <VerseCard
                    verse={sampleVerse}
                    progress={sampleProgress}
                    showTranslation={true}
                    showTransliteration={true}
                    onPlay={handlePlayPause}
                    onMarkReviewed={() => alert('Verse marked as reviewed!')}
                    isPlaying={isPlaying}
                  />
                </div>

                {/* Without Progress */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">New Verse (No Progress)</h3>
                  <VerseCard
                    verse={{
                      ...sampleVerse,
                      key: '1:2',
                      text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                      translation: 'All praise is due to Allah, Lord of the worlds.',
                      transliteration: 'Al-hamdu lillahi rabbil-alameen',
                      ayahNumber: 2,
                    }}
                    showTranslation={true}
                    showTransliteration={false}
                  />
                </div>

                {/* Arabic Only */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Arabic Only (Recall Test Mode)</h3>
                  <VerseCard
                    verse={{
                      ...sampleVerse,
                      key: '1:3',
                      text: 'الرَّحْمَٰنِ الرَّحِيمِ',
                      translation: 'The Entirely Merciful, the Especially Merciful.',
                      ayahNumber: 3,
                    }}
                    showTranslation={false}
                    showTransliteration={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Player Demo */}
        <TabsContent value="audio-player" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AudioPlayer Component</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Full-featured audio player with speed control, volume adjustment, repeat modes,
                and progress tracking. Perfect for listening to beautiful Quranic recitations.
              </p>

              <AudioPlayer
                audioUrl="https://verses.quran.com/Abdul_Basit/mp3/001001.mp3"
                title="Al-Fatihah, Verse 1"
                subtitle="Reciter: Abdul Basit Abdul Samad"
                onPlay={() => console.log('Playing')}
                onPause={() => console.log('Paused')}
                onEnded={() => console.log('Ended')}
              />

              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <p><strong>Features:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Play/Pause controls</li>
                  <li>Skip forward/backward (10 seconds)</li>
                  <li>Volume control with mute option</li>
                  <li>Playback speed adjustment (0.5x - 2x)</li>
                  <li>Repeat modes (none, one, all)</li>
                  <li>Progress bar with seeking</li>
                  <li>Time display (current/duration)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combined Demo */}
        <TabsContent value="combined" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Memorization Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                This is how verse memorization and audio playback work together in the app.
                You can read the verse, listen to the recitation, and track your progress.
              </p>

              {/* Verse Card */}
              <VerseCard
                verse={sampleVerse}
                progress={sampleProgress}
                showTranslation={true}
                showTransliteration={true}
                onPlay={handlePlayPause}
                onMarkReviewed={() => alert('Great job! Verse progress updated.')}
                isPlaying={isPlaying}
              />

              {/* Audio Player */}
              <AudioPlayer
                audioUrl="https://verses.quran.com/Abdul_Basit/mp3/001001.mp3"
                title="Listen to the recitation"
                subtitle="Abdul Basit Abdul Samad"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary-500">75%</div>
                    <div className="text-sm text-muted-foreground mt-1">Memory Strength</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary-500">12</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Reviews</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary-500">3</div>
                    <div className="text-sm text-muted-foreground mt-1">Streak</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardHeader>
          <CardTitle className="text-primary-900 dark:text-primary-100">
            Next Steps in Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            These components are ready to be integrated into the full memorization flow.
            Coming next:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-primary-700 dark:text-primary-300 ml-4">
            <li>Review queue page with smart scheduling</li>
            <li>Surah selection and navigation</li>
            <li>Progress dashboard with analytics</li>
            <li>Supabase integration for cloud sync</li>
            <li>Gamification system (achievements, XP, levels)</li>
            <li>Social features (study circles, accountability)</li>
            <li>AI-powered learning insights</li>
          </ul>
          <Button className="mt-4" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
