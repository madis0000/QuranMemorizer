'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, BookMarked, Star } from 'lucide-react';
import type { Verse, MemorizationProgress } from '@/types';
import { cn } from '@/lib/utils';

interface VerseCardProps {
  verse: Verse;
  progress?: MemorizationProgress | null;
  showTranslation?: boolean;
  showTransliteration?: boolean;
  showTajweed?: boolean;
  onPlay?: () => void;
  onMarkReviewed?: () => void;
  isPlaying?: boolean;
  className?: string;
}

export function VerseCard({
  verse,
  progress,
  showTranslation = true,
  showTransliteration = false,
  showTajweed = true,
  onPlay,
  onMarkReviewed,
  isPlaying = false,
  className,
}: VerseCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const strength = progress?.strength || 0;
  const strengthPercentage = strength * 100;

  // Determine strength color
  const getStrengthColor = () => {
    if (strength >= 0.7) return 'text-green-600 dark:text-green-400';
    if (strength >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={cn('w-full transition-smooth hover:shadow-lg', className)}>
      <CardContent className="pt-6 space-y-4">
        {/* Verse Reference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Surah {verse.surahNumber}, Ayah {verse.ayahNumber}
            </span>
          </div>

          {progress && (
            <div className="flex items-center gap-2">
              <Star className={cn('w-4 h-4', getStrengthColor())} fill="currentColor" />
              <span className={cn('text-xs font-semibold', getStrengthColor())}>
                {Math.round(strengthPercentage)}%
              </span>
            </div>
          )}
        </div>

        {/* Arabic Text */}
        <div
          className={cn(
            'arabic-text text-center py-6 cursor-pointer select-none',
            showTajweed && 'tajweed-enabled'
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {!isFlipped ? (
            <p className="leading-loose text-2xl md:text-3xl">{verse.text}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Click to reveal...
            </p>
          )}
        </div>

        {/* Transliteration */}
        {showTransliteration && verse.transliteration && !isFlipped && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground italic">
              {verse.transliteration}
            </p>
          </div>
        )}

        {/* Translation */}
        {showTranslation && verse.translation && !isFlipped && (
          <div className="border-t pt-4">
            <p className="text-base leading-relaxed text-foreground">
              {verse.translation}
            </p>
          </div>
        )}

        {/* Memory Strength Progress */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Memory Strength</span>
              <span className={cn('font-semibold', getStrengthColor())}>
                {strength >= 0.7 ? 'Strong' : strength >= 0.4 ? 'Moderate' : 'Weak'}
              </span>
            </div>
            <Progress value={strengthPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last reviewed: {new Date(progress.lastReviewed).toLocaleDateString()}</span>
              <span>Reviews: {progress.totalReviews}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onPlay && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPlay}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Listen</span>
              </>
            )}
          </Button>
        )}

        {onMarkReviewed && (
          <Button
            size="sm"
            onClick={onMarkReviewed}
            className="flex-1"
          >
            Mark as Reviewed
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFlipped(!isFlipped)}
          title={isFlipped ? 'Show verse' : 'Hide verse (test recall)'}
        >
          👁️
        </Button>
      </CardFooter>
    </Card>
  );
}
