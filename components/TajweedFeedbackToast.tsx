'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAccuracyColor, getAccuracyFeedback } from '@/lib/tajweedRuleDetector';

export interface TajweedFeedback {
  id: string;
  type: 'madd' | 'qalqalah' | 'ikhfa' | 'idgham' | 'iqlab' | 'ghunnah';
  ruleName: string;
  arabicName: string;
  accuracy: number;
  colorCode: string;
  details?: {
    expectedCounts?: number;
    actualDuration?: number;
    letterText?: string;
  };
}

interface TajweedFeedbackToastProps {
  feedbacks: TajweedFeedback[];
  onDismiss: (id: string) => void;
}

export function TajweedFeedbackToast({ feedbacks, onDismiss }: TajweedFeedbackToastProps) {
  console.log('🎨 [Toast] Rendering with feedbacks:', feedbacks.length, feedbacks);

  const getIcon = (type: TajweedFeedback['type']) => {
    switch (type) {
      case 'madd': return '━';
      case 'qalqalah': return '◉';
      case 'ikhfa': return '≋';
      case 'idgham': return '⊕';
      case 'iqlab': return '⇄';
      case 'ghunnah': return '∼';
    }
  };

  const getDetailedFeedback = (feedback: TajweedFeedback): string => {
    const { type, accuracy, details } = feedback;

    if (type === 'madd' && details?.expectedCounts && details?.actualDuration) {
      const expectedMs = details.expectedCounts * 500;
      const diff = Math.abs(details.actualDuration - expectedMs);
      const diffCounts = Math.round(diff / 500);

      if (accuracy >= 0.9) {
        return `Perfect timing! ${details.expectedCounts} counts`;
      } else if (details.actualDuration < expectedMs) {
        return `Hold ${diffCounts} count${diffCounts > 1 ? 's' : ''} longer`;
      } else {
        return `Shorten by ${diffCounts} count${diffCounts > 1 ? 's' : ''}`;
      }
    }

    if (type === 'qalqalah') {
      if (accuracy >= 0.9) return 'Excellent bounce!';
      if (accuracy >= 0.75) return 'Good echo, try more emphasis';
      return 'Add more bounce to the sound';
    }

    if (type === 'ikhfa') {
      if (accuracy >= 0.9) return 'Perfect hiding with nasalization!';
      if (accuracy >= 0.75) return 'Good, add slight nasal tone';
      return 'Conceal the sound more gently';
    }

    if (type === 'idgham') {
      if (accuracy >= 0.9) return 'Perfect merging!';
      if (accuracy >= 0.75) return 'Good, blend letters smoothly';
      return 'Merge the sounds together';
    }

    if (type === 'iqlab') {
      if (accuracy >= 0.9) return 'Perfect conversion to meem!';
      if (accuracy >= 0.75) return 'Good, emphasize the meem sound';
      return 'Convert to meem with nasalization';
    }

    if (type === 'ghunnah') {
      if (accuracy >= 0.9) return 'Perfect nasalization!';
      if (accuracy >= 0.75) return 'Good nasal tone';
      return 'Add more nasal resonance';
    }

    return getAccuracyFeedback(accuracy, feedback.ruleName);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none max-w-md">
      <AnimatePresence mode="popLayout">
        {feedbacks.map((feedback, index) => {
          const accuracyColor = getAccuracyColor(feedback.accuracy);
          const detailedFeedback = getDetailedFeedback(feedback);

          return (
            <motion.div
              key={feedback.id}
              layout
              initial={{ opacity: 0, x: 400, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 40,
                mass: 1,
                exit: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1], // Smooth ease-out curve
                }
              }}
              className="pointer-events-auto"
            >
              <div
                className="bg-gradient-to-br from-purple-900/98 to-indigo-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/40 p-4 min-w-[320px] max-w-md"
                style={{
                  boxShadow: `0 8px 32px ${feedback.colorCode}40, 0 0 0 1px ${feedback.colorCode}20`,
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{
                      backgroundColor: feedback.colorCode + '33',
                      border: `2px solid ${feedback.colorCode}`,
                      boxShadow: `0 0 16px ${feedback.colorCode}66`,
                    }}
                  >
                    <span className="text-xl">{getIcon(feedback.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-base leading-tight truncate">
                      {feedback.arabicName}
                    </h4>
                    <p className="text-purple-200 text-xs truncate">{feedback.ruleName}</p>
                  </div>
                  <button
                    onClick={() => onDismiss(feedback.id)}
                    className="text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
                    aria-label="Dismiss"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4l8 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Accuracy Bar */}
                <div className="mb-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feedback.accuracy * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${feedback.colorCode}, ${accuracyColor})`,
                        boxShadow: `0 0 8px ${accuracyColor}`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-white/60">Accuracy</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: accuracyColor }}
                    >
                      {Math.round(feedback.accuracy * 100)}%
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <div
                  className="rounded-lg p-2.5 text-sm"
                  style={{
                    backgroundColor: accuracyColor + '20',
                    border: `1px solid ${accuracyColor}40`,
                  }}
                >
                  <p
                    className="font-medium leading-tight"
                    style={{ color: accuracyColor }}
                  >
                    {detailedFeedback}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
