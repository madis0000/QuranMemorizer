// Gamification System - Achievements, Badges, Streaks, and Levels

import type { Achievement, MasteryLevel } from './types';

/**
 * All available achievements in the app
 */
export const ACHIEVEMENTS: Achievement[] = [
  // PRACTICE Category
  {
    id: 'first-verse',
    title: 'First Steps',
    description: 'Complete your first verse practice',
    icon: '🌱',
    category: 'practice',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'ten-verses',
    title: 'Consistent Learner',
    description: 'Practice 10 verses',
    icon: '📖',
    category: 'practice',
    requirement: 10,
    progress: 0,
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'fifty-verses',
    title: 'Dedicated Student',
    description: 'Practice 50 verses',
    icon: '📚',
    category: 'practice',
    requirement: 50,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'hundred-verses',
    title: 'Hafiz in Training',
    description: 'Practice 100 verses',
    icon: '⭐',
    category: 'practice',
    requirement: 100,
    progress: 0,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 'first-juz',
    title: 'Juz Master',
    description: 'Complete memorizing your first Juz',
    icon: '🎯',
    category: 'practice',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'epic',
  },

  // MASTERY Category
  {
    id: 'perfect-verse',
    title: 'Perfect Recitation',
    description: 'Get 100% accuracy on a verse',
    icon: '💎',
    category: 'mastery',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'gold-master',
    title: 'Gold Master',
    description: 'Achieve Gold mastery level on 5 verses',
    icon: '🥇',
    category: 'mastery',
    requirement: 5,
    progress: 0,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 'platinum-master',
    title: 'Platinum Excellence',
    description: 'Achieve Platinum mastery on 3 verses',
    icon: '💍',
    category: 'mastery',
    requirement: 3,
    progress: 0,
    unlocked: false,
    rarity: 'legendary',
  },
  {
    id: 'memory-master',
    title: 'Memory Master',
    description: 'Get all words perfect (first try) in Memory Challenge Mode',
    icon: '🏆',
    category: 'mastery',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'flawless-page',
    title: 'Flawless Page',
    description: 'Complete an entire page with 95%+ accuracy',
    icon: '✨',
    category: 'mastery',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'epic',
  },

  // STREAK Category
  {
    id: 'three-day-streak',
    title: 'Building Habit',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    progress: 0,
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    requirement: 7,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'month-champion',
    title: 'Month Champion',
    description: 'Practice for 30 days in a row',
    icon: '🌟',
    category: 'streak',
    requirement: 30,
    progress: 0,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 'hundred-day-legend',
    title: 'Legendary Dedication',
    description: 'Practice for 100 days in a row',
    icon: '👑',
    category: 'streak',
    requirement: 100,
    progress: 0,
    unlocked: false,
    rarity: 'legendary',
  },

  // SPEED Category
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Complete a verse in under 2 minutes',
    icon: '⚡',
    category: 'speed',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'common',
  },
  {
    id: 'speed-reader',
    title: 'Speed Reader',
    description: 'Complete 5 verses in under 10 minutes total',
    icon: '💨',
    category: 'speed',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },

  // SPECIAL Category
  {
    id: 'ramadan-warrior',
    title: 'Ramadan Warrior',
    description: 'Practice during Ramadan',
    icon: '🌙',
    category: 'special',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Practice before Fajr time',
    icon: '🌅',
    category: 'special',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'night-owl',
    title: 'Night Worshipper',
    description: 'Practice during the last third of the night',
    icon: '🦉',
    category: 'special',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: 'friday-devotee',
    title: 'Friday Devotee',
    description: 'Practice Surah Al-Kahf on Friday',
    icon: '🕌',
    category: 'special',
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: 'rare',
  },
];

/**
 * Mastery level thresholds and requirements
 */
export const MASTERY_LEVELS: Record<MasteryLevel, {
  name: string;
  arabicName: string;
  color: string;
  minAccuracy: number;
  minAttempts: number;
  badge: string;
  description: string;
}> = {
  none: {
    name: 'Not Started',
    arabicName: 'لم يبدأ',
    color: 'text-gray-400',
    minAccuracy: 0,
    minAttempts: 0,
    badge: '⚪',
    description: 'Begin your journey',
  },
  bronze: {
    name: 'Bronze',
    arabicName: 'برونز',
    color: 'text-orange-600',
    minAccuracy: 70,
    minAttempts: 3,
    badge: '🥉',
    description: 'Good start! Keep practicing',
  },
  silver: {
    name: 'Silver',
    arabicName: 'فضي',
    color: 'text-gray-400',
    minAccuracy: 80,
    minAttempts: 5,
    badge: '🥈',
    description: 'Well done! You\'re improving',
  },
  gold: {
    name: 'Gold',
    arabicName: 'ذهبي',
    color: 'text-yellow-500',
    minAccuracy: 90,
    minAttempts: 7,
    badge: '🥇',
    description: 'Excellent mastery!',
  },
  platinum: {
    name: 'Platinum',
    arabicName: 'بلاتيني',
    color: 'text-cyan-400',
    minAccuracy: 95,
    minAttempts: 10,
    badge: '💎',
    description: 'Outstanding perfection!',
  },
  master: {
    name: 'Master',
    arabicName: 'متقن',
    color: 'text-purple-500',
    minAccuracy: 98,
    minAttempts: 15,
    badge: '👑',
    description: 'True mastery achieved!',
  },
};

/**
 * Calculate mastery level based on performance
 */
export function calculateMasteryLevel(accuracy: number, attempts: number): MasteryLevel {
  if (accuracy >= 98 && attempts >= 15) return 'master';
  if (accuracy >= 95 && attempts >= 10) return 'platinum';
  if (accuracy >= 90 && attempts >= 7) return 'gold';
  if (accuracy >= 80 && attempts >= 5) return 'silver';
  if (accuracy >= 70 && attempts >= 3) return 'bronze';
  return 'none';
}

/**
 * Get next mastery level requirements
 */
export function getNextMasteryLevel(currentLevel: MasteryLevel): {
  nextLevel: MasteryLevel | null;
  requirements: string;
} {
  const levels: MasteryLevel[] = ['none', 'bronze', 'silver', 'gold', 'platinum', 'master'];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === levels.length - 1) {
    return { nextLevel: null, requirements: 'Maximum level reached!' };
  }

  const nextLevel = levels[currentIndex + 1];
  const requirements = MASTERY_LEVELS[nextLevel];

  return {
    nextLevel,
    requirements: `${requirements.minAccuracy}% accuracy with ${requirements.minAttempts}+ sessions`,
  };
}

/**
 * Check if achievement should be unlocked
 */
export function checkAchievementUnlock(
  achievement: Achievement,
  currentProgress: number
): boolean {
  return !achievement.unlocked && currentProgress >= achievement.requirement;
}

/**
 * Get achievement progress percentage
 */
export function getAchievementProgress(achievement: Achievement): number {
  return Math.min((achievement.progress / achievement.requirement) * 100, 100);
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400';
    case 'rare':
      return 'text-blue-600 dark:text-blue-400';
    case 'epic':
      return 'text-purple-600 dark:text-purple-400';
    case 'legendary':
      return 'text-yellow-600 dark:text-yellow-400';
  }
}

/**
 * Get rarity label
 */
export function getRarityLabel(rarity: Achievement['rarity']): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Calculate streak bonus multiplier
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 100) return 3.0;
  if (streakDays >= 30) return 2.5;
  if (streakDays >= 14) return 2.0;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.2;
  return 1.0;
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streakDays: number): string {
  if (streakDays === 0) return 'Start your journey today! 🌱';
  if (streakDays === 1) return 'Great start! Keep it up! 💪';
  if (streakDays === 3) return 'Building a habit! 🔥';
  if (streakDays === 7) return 'One week strong! ⚡';
  if (streakDays === 14) return 'Two weeks of dedication! 🌟';
  if (streakDays === 30) return 'One month! You\'re on fire! 🔥🔥';
  if (streakDays === 100) return 'LEGENDARY 100-day streak! 👑';
  if (streakDays >= 365) return 'ONE YEAR! Truly inspiring! 🎆';

  return `${streakDays} days strong! Keep going! 💎`;
}

/**
 * Check if streak is at risk (last practice was yesterday)
 */
export function isStreakAtRisk(lastPracticeDate: string): boolean {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastPractice = new Date(lastPracticeDate);

  return lastPractice.toDateString() === yesterday.toDateString();
}

/**
 * Calculate daily goal progress percentage
 */
export function getDailyGoalProgress(actual: number, target: number): number {
  return Math.min((actual / target) * 100, 100);
}
