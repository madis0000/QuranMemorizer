import type { ReviewQuality, SM2Result, MemorizationProgress } from '@/types';

/**
 * SM-2 (SuperMemo 2) Algorithm Implementation
 *
 * This is a proven spaced repetition algorithm that calculates optimal review intervals
 * based on how well you remember something. The better you remember, the longer until
 * the next review.
 */

export class SpacedRepetitionService {
  /**
   * Calculate the next review interval using SM-2 algorithm
   *
   * @param quality - User's recall quality (0-5)
   *   0: Complete blackout
   *   1: Incorrect, but familiar
   *   2: Incorrect, but easy to recall after seeing answer
   *   3: Correct, but difficult
   *   4: Correct, with some hesitation
   *   5: Perfect recall
   *
   * @param repetitions - Number of consecutive correct reviews
   * @param efactor - Easiness factor (1.3 - 2.5, default 2.5)
   * @param interval - Current interval in days
   */
  calculateSM2(
    quality: ReviewQuality,
    repetitions: number = 0,
    efactor: number = 2.5,
    interval: number = 0
  ): SM2Result {
    let newEfactor = efactor;
    let newRepetitions = repetitions;
    let newInterval = interval;

    // Calculate new easiness factor
    newEfactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ensure efactor stays within bounds
    if (newEfactor < 1.3) {
      newEfactor = 1.3;
    }

    // If quality is less than 3, reset repetitions and interval
    if (quality < 3) {
      newRepetitions = 0;
      newInterval = 1; // Review tomorrow
    } else {
      newRepetitions = repetitions + 1;

      // Calculate new interval based on repetition number
      if (newRepetitions === 1) {
        newInterval = 1; // First review: 1 day
      } else if (newRepetitions === 2) {
        newInterval = 6; // Second review: 6 days
      } else {
        // Subsequent reviews: multiply previous interval by efactor
        newInterval = Math.round(interval * newEfactor);
      }
    }

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      efactor: newEfactor,
    };
  }

  /**
   * Calculate the next review date based on current progress
   */
  calculateNextReviewDate(
    lastReviewDate: Date,
    interval: number
  ): Date {
    const nextReview = new Date(lastReviewDate);
    nextReview.setDate(nextReview.getDate() + interval);
    return nextReview;
  }

  /**
   * Update memorization progress after a review session
   */
  updateProgress(
    currentProgress: MemorizationProgress,
    quality: ReviewQuality
  ): MemorizationProgress {
    const sm2Result = this.calculateSM2(
      quality,
      currentProgress.consecutiveCorrect,
      currentProgress.efactor,
      currentProgress.interval
    );

    const now = new Date();
    const nextReviewDate = this.calculateNextReviewDate(now, sm2Result.interval);

    // Calculate memory strength (0-1 scale)
    // Based on efactor and consecutive correct reviews
    const strength = Math.min(
      1,
      (currentProgress.efactor / 2.5) *
      Math.min(1, currentProgress.consecutiveCorrect / 5) *
      (quality / 5)
    );

    return {
      ...currentProgress,
      strength,
      lastReviewed: now,
      nextReview: nextReviewDate,
      totalReviews: currentProgress.totalReviews + 1,
      consecutiveCorrect: quality >= 3 ? sm2Result.repetitions : 0,
      efactor: sm2Result.efactor,
      interval: sm2Result.interval,
      mistakes: quality < 3
        ? [...currentProgress.mistakes] // Could add new mistake here
        : currentProgress.mistakes,
    };
  }

  /**
   * Calculate retention probability using Ebbinghaus forgetting curve
   * R = e^(-t/S)
   * where t is time since last review, S is memory strength
   */
  calculateRetentionProbability(
    lastReviewDate: Date,
    memoryStrength: number
  ): number {
    const hoursSinceReview = (Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60);
    const S = memoryStrength * 24 * 30; // Strength in hours (max ~1 month for perfect memory)

    const retention = Math.exp(-hoursSinceReview / S);
    return Math.max(0, Math.min(1, retention));
  }

  /**
   * Determine if a verse should be reviewed now based on scheduled date
   * and retention probability
   */
  shouldReviewNow(
    progress: MemorizationProgress,
    aggressiveness: number = 0.8 // 0-1, higher = more reviews
  ): boolean {
    const now = new Date();

    // If scheduled review date has passed, definitely review
    if (now >= progress.nextReview) {
      return true;
    }

    // Calculate retention probability
    const retention = this.calculateRetentionProbability(
      progress.lastReviewed,
      progress.strength
    );

    // Review if retention drops below threshold
    return retention < aggressiveness;
  }

  /**
   * Get verses that should be reviewed today
   */
  getReviewQueue(
    allProgress: Map<string, MemorizationProgress>,
    maxReviews: number = 20
  ): string[] {
    const now = new Date();
    const dueVerses: { key: string; priority: number }[] = [];

    allProgress.forEach((progress, verseKey) => {
      if (this.shouldReviewNow(progress)) {
        // Calculate priority score
        // Higher priority for: overdue verses, low strength, low efactor
        const daysOverdue = Math.max(0,
          (now.getTime() - progress.nextReview.getTime()) / (1000 * 60 * 60 * 24)
        );

        const priority =
          daysOverdue * 10 + // Overdue verses get high priority
          (1 - progress.strength) * 5 + // Low strength verses
          (2.5 - progress.efactor) * 3; // Difficult verses

        dueVerses.push({ key: verseKey, priority });
      }
    });

    // Sort by priority (highest first) and take top maxReviews
    return dueVerses
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxReviews)
      .map(v => v.key);
  }

  /**
   * Initialize progress for a new verse
   */
  initializeProgress(verseKey: string): MemorizationProgress {
    return {
      verseKey,
      strength: 0,
      lastReviewed: new Date(),
      nextReview: new Date(), // Due immediately
      totalReviews: 0,
      consecutiveCorrect: 0,
      mistakes: [],
      efactor: 2.5, // Default easiness factor
      interval: 0,
    };
  }

  /**
   * Calculate statistics for a user's memorization
   */
  calculateStats(allProgress: Map<string, MemorizationProgress>) {
    const progressArray = Array.from(allProgress.values());

    if (progressArray.length === 0) {
      return {
        totalVerses: 0,
        averageStrength: 0,
        strongVerses: 0,
        weakVerses: 0,
        dueToday: 0,
        overdue: 0,
      };
    }

    const now = new Date();
    const strong = progressArray.filter(p => p.strength >= 0.7).length;
    const weak = progressArray.filter(p => p.strength < 0.3).length;
    const dueToday = progressArray.filter(p =>
      p.nextReview.toDateString() === now.toDateString()
    ).length;
    const overdue = progressArray.filter(p => p.nextReview < now).length;

    const averageStrength = progressArray.reduce(
      (sum, p) => sum + p.strength, 0
    ) / progressArray.length;

    return {
      totalVerses: progressArray.length,
      averageStrength: Math.round(averageStrength * 100) / 100,
      strongVerses: strong,
      weakVerses: weak,
      dueToday,
      overdue,
    };
  }

  /**
   * Predict when a user will complete memorizing a set number of verses
   */
  predictCompletionDate(
    currentProgress: number, // number of verses memorized
    targetProgress: number, // target number of verses
    dailyRate: number // average verses memorized per day
  ): Date | null {
    if (dailyRate <= 0 || currentProgress >= targetProgress) {
      return null;
    }

    const remainingVerses = targetProgress - currentProgress;
    const daysRequired = Math.ceil(remainingVerses / dailyRate);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysRequired);

    return completionDate;
  }
}

// Export singleton instance
export const spacedRepetition = new SpacedRepetitionService();
