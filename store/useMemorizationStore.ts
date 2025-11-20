import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Verse, MemorizationProgress, ReviewQuality } from '@/types';
import { spacedRepetition } from '@/services/spacedRepetition';

interface PracticeSession {
  verseKey: string;
  timestamp: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  duration?: number;
}

interface MemorizationStore {
  // Current state
  currentVerse: Verse | null;
  reviewQueue: string[];
  isReviewing: boolean;
  currentSessionVerses: string[];

  // Progress tracking
  progress: Map<string, MemorizationProgress>;
  practiceHistory: PracticeSession[];

  // Actions
  setCurrentVerse: (verse: Verse | null) => void;
  addToReviewQueue: (verseKey: string) => void;
  removeFromReviewQueue: (verseKey: string) => void;
  recordReview: (verseKey: string, quality: ReviewQuality) => void;
  getNextReview: () => string | null;
  startReviewSession: () => void;
  endReviewSession: () => void;
  initializeVerse: (verseKey: string) => void;
  getProgress: (verseKey: string) => MemorizationProgress | null;
  getAllProgress: () => Map<string, MemorizationProgress>;
  refreshReviewQueue: () => void;
  resetProgress: () => void;
  addPracticeSession: (session: Omit<PracticeSession, 'timestamp'>) => void;
  getPracticeHistory: (verseKey?: string) => PracticeSession[];
  getVersePracticeStats: (verseKey: string) => {
    totalSessions: number;
    averageAccuracy: number;
    lastPracticed: number | null;
    bestAccuracy: number;
  };
}

export const useMemorizationStore = create<MemorizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentVerse: null,
      reviewQueue: [],
      isReviewing: false,
      currentSessionVerses: [],
      progress: new Map<string, MemorizationProgress>(),
      practiceHistory: [],

      // Set the current verse being studied
      setCurrentVerse: (verse) => {
        set({ currentVerse: verse });
      },

      // Add a verse to the review queue
      addToReviewQueue: (verseKey) => {
        set((state) => {
          if (!state.reviewQueue.includes(verseKey)) {
            return { reviewQueue: [...state.reviewQueue, verseKey] };
          }
          return state;
        });
      },

      // Remove a verse from the review queue
      removeFromReviewQueue: (verseKey) => {
        set((state) => ({
          reviewQueue: state.reviewQueue.filter((key) => key !== verseKey),
        }));
      },

      // Record a review and update progress
      recordReview: (verseKey, quality) => {
        set((state) => {
          const currentProgress = state.progress.get(verseKey);

          if (!currentProgress) {
            // Initialize if not exists
            const newProgress = spacedRepetition.initializeProgress(verseKey);
            const updatedProgress = spacedRepetition.updateProgress(newProgress, quality);

            const newProgressMap = new Map(state.progress);
            newProgressMap.set(verseKey, updatedProgress);

            return {
              progress: newProgressMap,
              currentSessionVerses: [...state.currentSessionVerses, verseKey],
            };
          }

          // Update existing progress
          const updatedProgress = spacedRepetition.updateProgress(currentProgress, quality);

          const newProgressMap = new Map(state.progress);
          newProgressMap.set(verseKey, updatedProgress);

          return {
            progress: newProgressMap,
            currentSessionVerses: state.currentSessionVerses.includes(verseKey)
              ? state.currentSessionVerses
              : [...state.currentSessionVerses, verseKey],
          };
        });

        // Remove from queue if quality is good (4 or 5)
        if (quality >= 4) {
          get().removeFromReviewQueue(verseKey);
        }
      },

      // Get the next verse to review
      getNextReview: () => {
        const { reviewQueue } = get();
        return reviewQueue.length > 0 ? reviewQueue[0] : null;
      },

      // Start a review session
      startReviewSession: () => {
        set({
          isReviewing: true,
          currentSessionVerses: [],
        });

        // Refresh the review queue
        get().refreshReviewQueue();
      },

      // End a review session
      endReviewSession: () => {
        set({
          isReviewing: false,
          currentVerse: null,
        });
      },

      // Initialize progress for a new verse
      initializeVerse: (verseKey) => {
        set((state) => {
          if (state.progress.has(verseKey)) {
            return state; // Already initialized
          }

          const newProgress = spacedRepetition.initializeProgress(verseKey);
          const newProgressMap = new Map(state.progress);
          newProgressMap.set(verseKey, newProgress);

          return {
            progress: newProgressMap,
            reviewQueue: [...state.reviewQueue, verseKey],
          };
        });
      },

      // Get progress for a specific verse
      getProgress: (verseKey) => {
        return get().progress.get(verseKey) || null;
      },

      // Get all progress
      getAllProgress: () => {
        return new Map(get().progress);
      },

      // Refresh the review queue based on current progress
      refreshReviewQueue: () => {
        const { progress } = get();
        const queue = spacedRepetition.getReviewQueue(progress, 20);

        set({ reviewQueue: queue });
      },

      // Reset all progress (use with caution!)
      resetProgress: () => {
        set({
          progress: new Map(),
          reviewQueue: [],
          currentVerse: null,
          isReviewing: false,
          currentSessionVerses: [],
          practiceHistory: [],
        });
      },

      // Add a practice session
      addPracticeSession: (session) => {
        set((state) => ({
          practiceHistory: [
            ...state.practiceHistory,
            {
              ...session,
              timestamp: Date.now(),
            },
          ],
        }));
      },

      // Get practice history (all or for specific verse)
      getPracticeHistory: (verseKey) => {
        const { practiceHistory } = get();
        if (verseKey) {
          return practiceHistory.filter((session) => session.verseKey === verseKey);
        }
        return practiceHistory;
      },

      // Get practice statistics for a verse
      getVersePracticeStats: (verseKey) => {
        const sessions = get().getPracticeHistory(verseKey);

        if (sessions.length === 0) {
          return {
            totalSessions: 0,
            averageAccuracy: 0,
            lastPracticed: null,
            bestAccuracy: 0,
          };
        }

        const totalSessions = sessions.length;
        const averageAccuracy = Math.round(
          sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions
        );
        const lastPracticed = Math.max(...sessions.map((s) => s.timestamp));
        const bestAccuracy = Math.max(...sessions.map((s) => s.accuracy));

        return {
          totalSessions,
          averageAccuracy,
          lastPracticed,
          bestAccuracy,
        };
      },
    }),
    {
      name: 'memorization-storage', // localStorage key
      // Custom storage to handle Map serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          const { state } = JSON.parse(str);
          // Convert progress object back to Map
          if (state.progress) {
            state.progress = new Map(Object.entries(state.progress));
          }

          return { state };
        },
        setItem: (name, value) => {
          const { state } = value;
          // Convert Map to object for JSON serialization
          const serializedState = {
            ...state,
            progress: state.progress ? Object.fromEntries(state.progress) : {},
          };

          localStorage.setItem(name, JSON.stringify({ state: serializedState }));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
