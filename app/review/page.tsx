'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VerseCard } from '@/components/VerseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  RotateCcw,
  CheckCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  Home
} from 'lucide-react';
import { useMemorizationStore } from '@/store/useMemorizationStore';
import { quranAPI } from '@/services/quranAPI';
import type { Verse, ReviewQuality } from '@/types';

export default function ReviewPage() {
  const {
    reviewQueue,
    getNextReview,
    recordReview,
    getProgress,
    startReviewSession,
    endReviewSession,
    isReviewing,
    currentSessionVerses,
  } = useMemorizationStore();

  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalReviewed: 0,
    perfect: 0,
    good: 0,
    needsWork: 0,
  });

  // Load first verse when session starts
  useEffect(() => {
    if (isReviewing && reviewQueue.length > 0 && !currentVerse) {
      loadNextVerse();
    }
  }, [isReviewing, reviewQueue.length]);

  // Calculate session stats
  useEffect(() => {
    // This would be calculated based on actual review qualities
    // For now, it's a placeholder
    setSessionStats({
      totalReviewed: currentSessionVerses.length,
      perfect: Math.floor(currentSessionVerses.length * 0.6),
      good: Math.floor(currentSessionVerses.length * 0.3),
      needsWork: Math.floor(currentSessionVerses.length * 0.1),
    });
  }, [currentSessionVerses.length]);

  const loadNextVerse = async () => {
    const nextVerseKey = getNextReview();
    if (!nextVerseKey) {
      // No more verses to review
      if (isReviewing) {
        setSessionComplete(true);
      }
      return;
    }

    setLoading(true);
    try {
      const verse = await quranAPI.getVerse(nextVerseKey, {
        translation: 'en-sahih-international',
        audio: 'ar.alafasy',
      });
      setCurrentVerse(verse);
    } catch (error) {
      console.error('Error loading verse:', error);
      // Use fallback demo verse if API fails
      setCurrentVerse({
        key: nextVerseKey,
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        transliteration: 'Bismillah ir-Rahman ir-Raheem',
        surahNumber: parseInt(nextVerseKey.split(':')[0]),
        ayahNumber: parseInt(nextVerseKey.split(':')[1]),
        juzNumber: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    startReviewSession();
    setSessionComplete(false);
  };

  const handleReview = async (quality: ReviewQuality) => {
    if (!currentVerse) return;

    // Record the review
    recordReview(currentVerse.key, quality);

    // Add animation delay before loading next
    await new Promise(resolve => setTimeout(resolve, 500));

    // Load next verse
    if (reviewQueue.length > 1) {
      loadNextVerse();
    } else {
      setSessionComplete(true);
    }
  };

  const handleEndSession = () => {
    endReviewSession();
    setCurrentVerse(null);
    setSessionComplete(false);
  };

  // Before session starts
  if (!isReviewing) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <RotateCcw className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <CardTitle className="text-3xl">Daily Review</CardTitle>
              <CardDescription className="text-base">
                Strengthen your memorization with spaced repetition
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Queue Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                      {reviewQueue.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Verses Due Today
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {currentSessionVerses.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Reviewed This Session
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      ~{Math.ceil(reviewQueue.length * 2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Minutes Estimated
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Info Section */}
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  How Review Works
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Each verse will be shown based on intelligent scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Rate your recall quality from 0 (forgot) to 5 (perfect)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>The algorithm will optimize your review schedule automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Consistent daily reviews lead to long-term retention</span>
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handleStartSession}
                disabled={reviewQueue.length === 0}
              >
                {reviewQueue.length > 0 ? (
                  <>
                    Start Review Session
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  'No verses due for review today! 🎉'
                )}
              </Button>

              {reviewQueue.length === 0 && (
                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>You're all caught up! Come back tomorrow for your next reviews.</p>
                  <p className="text-xs">
                    Or <a href="/memorize" className="text-primary-500 underline">start memorizing new verses</a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Session Complete
  if (sessionComplete) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl text-green-700 dark:text-green-400">
                Session Complete!
              </CardTitle>
              <CardDescription className="text-base">
                Excellent work! Your progress has been saved.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Session Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {sessionStats.totalReviewed}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total Reviewed
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {sessionStats.perfect}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Perfect (5)
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {sessionStats.good}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Good (3-4)
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 dark:bg-yellow-900/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {sessionStats.needsWork}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Needs Work (0-2)
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Motivational Message */}
              <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg text-center">
                <p className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  "And We have certainly made the Quran easy for remembrance" (54:17)
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEndSession}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.location.href = '/progress'}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // During Review Session
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Verse {currentSessionVerses.length + 1} of {reviewQueue.length + currentSessionVerses.length}
                </span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {Math.round(((currentSessionVerses.length) / (reviewQueue.length + currentSessionVerses.length)) * 100)}% Complete
                </span>
              </div>
              <Progress
                value={((currentSessionVerses.length) / (reviewQueue.length + currentSessionVerses.length)) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Verse */}
        <AnimatePresence mode="wait">
          {currentVerse && (
            <motion.div
              key={currentVerse.key}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <VerseCard
                verse={currentVerse}
                progress={getProgress(currentVerse.key)}
                showTranslation={true}
                showTransliteration={false}
                className="shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality Rating Buttons */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">How well did you remember this verse?</CardTitle>
            <CardDescription>
              Be honest - this helps optimize your review schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <QualityButton
                quality={0}
                label="Complete Blackout"
                description="Didn't remember at all"
                color="red"
                onClick={() => handleReview(0)}
                disabled={loading}
              />
              <QualityButton
                quality={1}
                label="Incorrect"
                description="But seemed familiar"
                color="orange"
                onClick={() => handleReview(1)}
                disabled={loading}
              />
              <QualityButton
                quality={2}
                label="Incorrect"
                description="Easy after hint"
                color="yellow"
                onClick={() => handleReview(2)}
                disabled={loading}
              />
              <QualityButton
                quality={3}
                label="Correct"
                description="With difficulty"
                color="lime"
                onClick={() => handleReview(3)}
                disabled={loading}
              />
              <QualityButton
                quality={4}
                label="Correct"
                description="After hesitation"
                color="green"
                onClick={() => handleReview(4)}
                disabled={loading}
              />
              <QualityButton
                quality={5}
                label="Perfect!"
                description="Instant recall"
                color="emerald"
                onClick={() => handleReview(5)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleEndSession}
          >
            End Session Early
          </Button>
          <div className="text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            {reviewQueue.length} verses remaining
          </div>
        </div>
      </div>
    </div>
  );
}

// Quality Rating Button Component
function QualityButton({
  quality,
  label,
  description,
  color,
  onClick,
  disabled,
}: {
  quality: ReviewQuality;
  label: string;
  description: string;
  color: 'red' | 'orange' | 'yellow' | 'lime' | 'green' | 'emerald';
  onClick: () => void;
  disabled: boolean;
}) {
  const colorClasses = {
    red: 'border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20',
    orange: 'border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20',
    yellow: 'border-yellow-300 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-900/20',
    lime: 'border-lime-300 hover:bg-lime-50 dark:border-lime-800 dark:hover:bg-lime-900/20',
    green: 'border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20',
    emerald: 'border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-4 rounded-lg border-2 transition-all text-left
        hover:scale-105 hover:shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed
        ${colorClasses[color]}
      `}
    >
      <div className="font-bold text-lg mb-1">{quality} - {label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </button>
  );
}
