import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, Streak, DailyGoal, UnitProgress, UnitType } from '@/lib/memorization/types';
import { ACHIEVEMENTS, checkAchievementUnlock } from '@/lib/memorization/gamification';

interface GamificationStore {
  // Achievements
  achievements: Achievement[];
  unlockedCount: number;

  // Streaks
  streak: Streak;

  // Daily Goals
  dailyGoals: Record<string, DailyGoal>; // key: YYYY-MM-DD

  // Unit Progress (for all types: verse, page, juz, etc.)
  unitProgress: Record<string, UnitProgress>; // key: unitId

  // Statistics
  totalPracticeTime: number; // in seconds
  totalVersesCompleted: number;
  totalPerfectWords: number;

  // Actions
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  updateStreak: () => void;
  breakStreak: () => void;
  setDailyGoal: (date: string, minutes: number, verses: number) => void;
  updateDailyProgress: (minutes: number, verses: number) => void;
  recordUnitProgress: (progress: Omit<UnitProgress, 'lastPracticed'>) => void;
  getUnitProgress: (unitId: string) => UnitProgress | null;
  addPracticeTime: (seconds: number) => void;
  incrementVersesCompleted: (count: number) => void;
  incrementPerfectWords: (count: number) => void;
  resetAllProgress: () => void;

  // Getters
  getAchievementsByCategory: (category: string) => Achievement[];
  getTodayGoal: () => DailyGoal | null;
  getProgressByUnitType: (unitType: UnitType) => UnitProgress[];
}

const today = () => new Date().toISOString().split('T')[0];

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      achievements: ACHIEVEMENTS.map(a => ({ ...a })),
      unlockedCount: 0,
      streak: {
        current: 0,
        longest: 0,
        lastPracticeDate: '',
        freezesAvailable: 3,
      },
      dailyGoals: {},
      unitProgress: {},
      totalPracticeTime: 0,
      totalVersesCompleted: 0,
      totalPerfectWords: 0,

      // Unlock achievement
      unlockAchievement: (achievementId) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, unlocked: true, unlockedAt: Date.now() }
              : a
          ),
          unlockedCount: state.unlockedCount + 1,
        }));
      },

      // Update achievement progress
      updateAchievementProgress: (achievementId, progress) => {
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement) return state;

          const shouldUnlock = checkAchievementUnlock(achievement, progress);

          return {
            achievements: state.achievements.map((a) =>
              a.id === achievementId
                ? {
                    ...a,
                    progress,
                    unlocked: shouldUnlock ? true : a.unlocked,
                    unlockedAt: shouldUnlock ? Date.now() : a.unlockedAt,
                  }
                : a
            ),
            unlockedCount: shouldUnlock
              ? state.unlockedCount + 1
              : state.unlockedCount,
          };
        });
      },

      // Update streak
      updateStreak: () => {
        set((state) => {
          const todayStr = today();
          const lastPractice = state.streak.lastPracticeDate;

          // Already practiced today
          if (lastPractice === todayStr) {
            return state;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          // Continuing streak from yesterday
          if (lastPractice === yesterdayStr) {
            const newCurrent = state.streak.current + 1;
            return {
              streak: {
                ...state.streak,
                current: newCurrent,
                longest: Math.max(newCurrent, state.streak.longest),
                lastPracticeDate: todayStr,
              },
            };
          }

          // Starting new streak
          return {
            streak: {
              ...state.streak,
              current: 1,
              longest: Math.max(1, state.streak.longest),
              lastPracticeDate: todayStr,
            },
          };
        });

        // Update streak-related achievements
        const currentStreak = get().streak.current;
        get().updateAchievementProgress('three-day-streak', currentStreak);
        get().updateAchievementProgress('week-warrior', currentStreak);
        get().updateAchievementProgress('month-champion', currentStreak);
        get().updateAchievementProgress('hundred-day-legend', currentStreak);
      },

      // Break streak
      breakStreak: () => {
        set((state) => ({
          streak: {
            ...state.streak,
            current: 0,
          },
        }));
      },

      // Set daily goal
      setDailyGoal: (date, minutes, verses) => {
        set((state) => ({
          dailyGoals: {
            ...state.dailyGoals,
            [date]: {
              date,
              targetMinutes: minutes,
              targetVerses: verses,
              actualMinutes: state.dailyGoals[date]?.actualMinutes || 0,
              actualVerses: state.dailyGoals[date]?.actualVerses || 0,
              completed: false,
            },
          },
        }));
      },

      // Update daily progress
      updateDailyProgress: (minutes, verses) => {
        const todayStr = today();
        set((state) => {
          const todayGoal = state.dailyGoals[todayStr];
          if (!todayGoal) return state;

          const newActualMinutes = todayGoal.actualMinutes + minutes;
          const newActualVerses = todayGoal.actualVerses + verses;
          const completed =
            newActualMinutes >= todayGoal.targetMinutes &&
            newActualVerses >= todayGoal.targetVerses;

          return {
            dailyGoals: {
              ...state.dailyGoals,
              [todayStr]: {
                ...todayGoal,
                actualMinutes: newActualMinutes,
                actualVerses: newActualVerses,
                completed,
              },
            },
          };
        });
      },

      // Record unit progress
      recordUnitProgress: (progress) => {
        set((state) => ({
          unitProgress: {
            ...state.unitProgress,
            [progress.unitId]: {
              ...progress,
              lastPracticed: Date.now(),
            },
          },
        }));
      },

      // Get unit progress
      getUnitProgress: (unitId) => {
        return get().unitProgress[unitId] || null;
      },

      // Add practice time
      addPracticeTime: (seconds) => {
        set((state) => ({
          totalPracticeTime: state.totalPracticeTime + seconds,
        }));
      },

      // Increment verses completed
      incrementVersesCompleted: (count) => {
        set((state) => {
          const newTotal = state.totalVersesCompleted + count;

          // Update verse-count achievements
          state.updateAchievementProgress('first-verse', newTotal);
          state.updateAchievementProgress('ten-verses', newTotal);
          state.updateAchievementProgress('fifty-verses', newTotal);
          state.updateAchievementProgress('hundred-verses', newTotal);

          return {
            totalVersesCompleted: newTotal,
          };
        });
      },

      // Increment perfect words
      incrementPerfectWords: (count) => {
        set((state) => ({
          totalPerfectWords: state.totalPerfectWords + count,
        }));
      },

      // Reset all progress
      resetAllProgress: () => {
        set({
          achievements: ACHIEVEMENTS.map((a) => ({ ...a })),
          unlockedCount: 0,
          streak: {
            current: 0,
            longest: 0,
            lastPracticeDate: '',
            freezesAvailable: 3,
          },
          dailyGoals: {},
          unitProgress: {},
          totalPracticeTime: 0,
          totalVersesCompleted: 0,
          totalPerfectWords: 0,
        });
      },

      // Get achievements by category
      getAchievementsByCategory: (category) => {
        return get().achievements.filter((a) => a.category === category);
      },

      // Get today's goal
      getTodayGoal: () => {
        const todayStr = today();
        return get().dailyGoals[todayStr] || null;
      },

      // Get progress by unit type
      getProgressByUnitType: (unitType) => {
        const allProgress = Object.values(get().unitProgress);
        return allProgress.filter((p) => p.unitType === unitType);
      },
    }),
    {
      name: 'gamification-storage',
      // Handle Map and complex types serialization if needed
    }
  )
);
