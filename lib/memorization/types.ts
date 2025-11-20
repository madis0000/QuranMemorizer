// Memorization Unit Types - Core type system for multi-mode memorization

export type UnitType = 'verse' | 'page' | 'rub' | 'hizb' | 'juz' | 'context';

export interface MemorizationUnit {
  id: string;
  type: UnitType;
  title: string;
  arabicTitle: string;
  description: string;
  verses: VerseReference[];
  metadata: UnitMetadata;
}

export interface VerseReference {
  surahNumber: number;
  verseNumber: number;
  key: string; // Format: "surah:verse" e.g., "1:1"
}

export interface UnitMetadata {
  estimatedTime: number; // in minutes
  wordCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  pageNumber?: number;
  rubNumber?: number;
  hizbNumber?: number;
  juzNumber?: number;
}

export interface UnitProgress {
  unitId: string;
  unitType: UnitType;
  completedVerses: string[];
  totalVerses: number;
  accuracy: number;
  attempts: number;
  perfectCount: number;
  lastPracticed: number;
  masteryLevel: MasteryLevel;
  timeSpent: number; // in seconds
  streak: number;
}

export type MasteryLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'master';

export interface PracticeSettings {
  unitType: UnitType;
  unitId: string;
  memoryMode: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  strictness: 'lenient' | 'medium' | 'strict';
  autoAdvance: boolean;
  showTranslation: boolean;
  playAudio: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'practice' | 'mastery' | 'streak' | 'speed' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD
  targetMinutes: number;
  targetVerses: number;
  actualMinutes: number;
  actualVerses: number;
  completed: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  lastPracticeDate: string; // YYYY-MM-DD
  freezesAvailable: number;
}

export interface VoiceQualityMetrics {
  clarity: number; // 0-100
  pace: number; // 0-100 (50 is ideal)
  confidence: number; // 0-100
  consistency: number; // 0-100
  overallScore: number; // 0-100
}
