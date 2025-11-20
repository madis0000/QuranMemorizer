'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Clock, Target, TrendingUp, AlertCircle, CheckCircle2, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export interface SessionStats {
  totalWords: number;
  perfectWords: number; // Correct on first try
  totalAttempts: number;
  accuracy: number; // 0-100
  timeSpent: number; // milliseconds
  stuckWords: string[]; // Words that required multiple attempts
  hintsUsed: number;
  isPerfectRun: boolean; // All words correct on first try
}

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  stats: SessionStats;
  verseKey: string;
}

export function SessionSummaryModal({
  isOpen,
  onClose,
  onRetry,
  stats,
  verseKey,
}: SessionSummaryModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti for perfect runs
  useEffect(() => {
    if (isOpen && stats.isPerfectRun && !showConfetti) {
      setShowConfetti(true);

      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, stats.isPerfectRun, showConfetti]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 75) return 'text-yellow-400';
    if (accuracy >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAccuracyGradient = (accuracy: number): string => {
    if (accuracy >= 90) return 'from-green-500 to-emerald-500';
    if (accuracy >= 75) return 'from-yellow-500 to-amber-500';
    if (accuracy >= 60) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getFeedbackMessage = (): string => {
    if (stats.isPerfectRun) {
      return 'Outstanding! Perfect recitation! 🌟';
    }
    if (stats.accuracy >= 90) {
      return 'Excellent work! Keep it up! 💪';
    }
    if (stats.accuracy >= 75) {
      return 'Great job! You\'re improving! 📈';
    }
    if (stats.accuracy >= 60) {
      return 'Good effort! Practice makes perfect! 🎯';
    }
    return 'Keep practicing! You\'re making progress! 🌱';
  };

  const getSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (stats.stuckWords.length > 0) {
      suggestions.push(`Focus on these words: ${stats.stuckWords.slice(0, 3).join(', ')}`);
    }

    if (stats.accuracy < 75) {
      suggestions.push('Try practicing with slower speech for better accuracy');
    }

    if (stats.hintsUsed > stats.totalWords / 2) {
      suggestions.push('Try to recall words before using hints');
    }

    if (stats.totalAttempts > stats.totalWords * 2) {
      suggestions.push('Review the verse before starting practice');
    }

    if (suggestions.length === 0) {
      suggestions.push('Keep up the excellent work!');
    }

    return suggestions;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl max-w-2xl w-full p-8 pointer-events-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {stats.isPerfectRun ? (
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                  ) : (
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {stats.isPerfectRun ? 'Perfect Run!' : 'Practice Complete!'}
                    </h2>
                    <p className="text-sm text-gray-400">Verse {verseKey}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Feedback Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-xl border border-purple-500/20"
              >
                <p className="text-lg font-medium text-white text-center">
                  {getFeedbackMessage()}
                </p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Accuracy */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Accuracy</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
                      {stats.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full bg-gradient-to-r ${getAccuracyGradient(stats.accuracy)} rounded-full`}
                    />
                  </div>
                </motion.div>

                {/* Time Spent */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Time</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-400">
                      {formatTime(stats.timeSpent)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(stats.timeSpent / stats.totalWords / 1000)}s per word
                  </p>
                </motion.div>

                {/* Perfect Words */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-400">Perfect Words</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-400">
                      {stats.perfectWords}
                    </span>
                    <span className="text-gray-500">/ {stats.totalWords}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((stats.perfectWords / stats.totalWords) * 100)}% first-try success
                  </p>
                </motion.div>

                {/* Total Attempts */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm text-gray-400">Attempts</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-indigo-400">
                      {stats.totalAttempts}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg {(stats.totalAttempts / stats.totalWords).toFixed(1)} per word
                  </p>
                </motion.div>
              </div>

              {/* Suggestions */}
              {getSuggestions().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 p-4 bg-amber-900/20 rounded-xl border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    <h3 className="text-sm font-semibold text-amber-400">Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {getSuggestions().map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <Button
                  onClick={onRetry}
                  variant="default"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Practice Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-600 hover:bg-gray-800 text-white font-semibold py-6 rounded-xl"
                >
                  Close
                </Button>
                {/* Future: Share button
                <Button
                  onClick={() => {}}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-800 text-white py-6 px-6 rounded-xl"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                */}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
