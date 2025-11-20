// Core Quran types
export interface Verse {
  key: string; // e.g., "1:1" for Surah 1, Ayah 1
  text: string;
  translation?: string;
  transliteration?: string;
  surahNumber: number;
  ayahNumber: number;
  juzNumber: number;
  audioUrl?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
}

// Memorization types
export interface MemorizationProgress {
  verseKey: string;
  strength: number; // 0-1, based on SM-2 algorithm
  lastReviewed: Date;
  nextReview: Date;
  totalReviews: number;
  consecutiveCorrect: number;
  mistakes: MistakePattern[];
  efactor: number; // SM-2 easiness factor
  interval: number; // Days until next review
}

export interface MistakePattern {
  timestamp: Date;
  mistakeType: 'pronunciation' | 'word-order' | 'skip' | 'addition';
  details: string;
}

export interface ReviewSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  versesReviewed: string[];
  accuracy: number;
  totalTime: number; // in seconds
  moodBefore?: 'excellent' | 'good' | 'okay' | 'tired';
  moodAfter?: 'excellent' | 'good' | 'okay' | 'tired';
}

// Spaced Repetition types
export interface SM2Result {
  interval: number;
  repetitions: number;
  efactor: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Complete blackout
// 1: Incorrect, but familiar
// 2: Incorrect, but easy to recall after seeing answer
// 3: Correct, but difficult
// 4: Correct, with some hesitation
// 5: Perfect recall

// Gamification types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'memorization' | 'consistency' | 'social' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  title: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'review' | 'memorize' | 'listen' | 'perfect-recall';
  target: number;
  progress: number;
  xpReward: number;
  expiresAt: Date;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  learningStyle: ('visual' | 'auditory' | 'kinesthetic')[];
  dailyGoal: number; // verses per day
  preferredReciter?: string;
  timezone: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar' | 'ur' | 'id' | 'fr';
  translationLanguage: string;
  autoPlay: boolean;
  playbackSpeed: number;
  notificationsEnabled: boolean;
  reminderTime?: string; // HH:mm format
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  showTajweed: boolean;
  showTransliteration: boolean;
}

// Analytics types
export interface UserStats {
  totalVerses: number;
  totalSurahs: number;
  currentStreak: number;
  longestStreak: number;
  totalReviewSessions: number;
  averageAccuracy: number;
  totalStudyTime: number; // in minutes
  versesThisWeek: number;
  versesThisMonth: number;
  retentionRate: number;
  strongestSurahs: number[];
  weakestVerses: string[];
}

export interface LearningPattern {
  bestTimeToStudy: string; // HH:mm format
  optimalSessionLength: number; // in minutes
  learningVelocity: number; // verses per day average
  consistencyScore: number; // 0-100
  forgettingCurve: { days: number; retention: number }[];
}

// API types
export interface QuranAPIConfig {
  clientId: string;
  clientSecret: string;
  oauthEndpoint: string;
  apiBaseUrl: string;
}

export interface APIResponse<T> {
  data: T;
  error?: string;
  timestamp: Date;
}

// Store types
export interface MemorizationStore {
  currentVerse: Verse | null;
  reviewQueue: string[];
  isReviewing: boolean;
  progress: Map<string, MemorizationProgress>;
  setCurrentVerse: (verse: Verse | null) => void;
  addToReviewQueue: (verseKey: string) => void;
  recordReview: (verseKey: string, quality: ReviewQuality) => void;
  getNextReview: () => string | null;
}

export interface UIStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  audioPlaying: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setAudioPlaying: (playing: boolean) => void;
}
