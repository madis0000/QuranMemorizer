import type { MemorizationProgress } from '@/types';
import { useMemorizationStore } from '@/store/useMemorizationStore';

/**
 * Initialize demo data for testing the review system
 * This adds sample verses with various memory strengths and review dates
 */
export function initializeDemoData() {
  const store = useMemorizationStore.getState();

  // Check if we already have data
  if (store.progress.size > 0) {
    console.log('Demo data already exists');
    return;
  }

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Sample verses from Al-Fatihah and other popular surahs
  const demoVerses: Array<Partial<MemorizationProgress>> = [
    // Al-Fatihah (Due for review)
    {
      verseKey: '1:1',
      strength: 0.8,
      lastReviewed: twoDaysAgo,
      nextReview: yesterday, // Overdue
      totalReviews: 5,
      consecutiveCorrect: 2,
      efactor: 2.4,
      interval: 3,
    },
    {
      verseKey: '1:2',
      strength: 0.65,
      lastReviewed: yesterday,
      nextReview: now, // Due today
      totalReviews: 3,
      consecutiveCorrect: 1,
      efactor: 2.2,
      interval: 2,
    },
    {
      verseKey: '1:3',
      strength: 0.5,
      lastReviewed: twoDaysAgo,
      nextReview: now, // Due today
      totalReviews: 4,
      consecutiveCorrect: 0,
      efactor: 2.0,
      interval: 1,
    },

    // Al-Ikhlas (Strong memory)
    {
      verseKey: '112:1',
      strength: 0.9,
      lastReviewed: yesterday,
      nextReview: threeDaysFromNow, // Not due yet
      totalReviews: 10,
      consecutiveCorrect: 5,
      efactor: 2.6,
      interval: 7,
    },
    {
      verseKey: '112:2',
      strength: 0.85,
      lastReviewed: twoDaysAgo,
      nextReview: tomorrow, // Not due yet
      totalReviews: 8,
      consecutiveCorrect: 4,
      efactor: 2.5,
      interval: 6,
    },

    // Ayatul Kursi (Weak - needs review)
    {
      verseKey: '2:255',
      strength: 0.3,
      lastReviewed: twoDaysAgo,
      nextReview: yesterday, // Overdue
      totalReviews: 2,
      consecutiveCorrect: 0,
      efactor: 1.8,
      interval: 1,
    },

    // Al-Falaq (Due today)
    {
      verseKey: '113:1',
      strength: 0.7,
      lastReviewed: yesterday,
      nextReview: now, // Due today
      totalReviews: 6,
      consecutiveCorrect: 2,
      efactor: 2.3,
      interval: 3,
    },
    {
      verseKey: '113:2',
      strength: 0.6,
      lastReviewed: twoDaysAgo,
      nextReview: now, // Due today
      totalReviews: 5,
      consecutiveCorrect: 1,
      efactor: 2.1,
      interval: 2,
    },
  ];

  // Initialize each verse in the store
  demoVerses.forEach((verse) => {
    if (verse.verseKey) {
      store.initializeVerse(verse.verseKey);

      // Update with demo data
      const progress = store.getProgress(verse.verseKey);
      if (progress) {
        const newProgressMap = new Map(store.progress);
        newProgressMap.set(verse.verseKey, {
          ...progress,
          ...verse,
          mistakes: [],
        } as MemorizationProgress);

        // Directly update the store
        useMemorizationStore.setState({ progress: newProgressMap });
      }
    }
  });

  // Refresh the review queue
  store.refreshReviewQueue();

  console.log(`✅ Demo data initialized: ${demoVerses.length} verses added`);
  console.log(`📋 Review queue: ${store.reviewQueue.length} verses due`);
}

/**
 * Clear all demo data
 */
export function clearDemoData() {
  const store = useMemorizationStore.getState();
  store.resetProgress();
  console.log('🗑️ Demo data cleared');
}

/**
 * Get demo data statistics
 */
export function getDemoDataStats() {
  const store = useMemorizationStore.getState();
  const progress = Array.from(store.progress.values());

  return {
    totalVerses: progress.length,
    dueForReview: store.reviewQueue.length,
    averageStrength: progress.reduce((sum, p) => sum + p.strength, 0) / progress.length || 0,
    strongVerses: progress.filter(p => p.strength >= 0.7).length,
    weakVerses: progress.filter(p => p.strength < 0.4).length,
  };
}
