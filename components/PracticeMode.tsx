'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StuckWordModal } from '@/components/StuckWordModal';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { CompactParametersPanel } from '@/components/CompactParametersPanel';
import { TajweedText } from '@/components/TajweedText';
import { TajweedAssistant } from '@/components/TajweedAssistant';
import { SessionSummaryModal, SessionStats } from '@/components/SessionSummaryModal';
import { applyTajweedColors } from '@/lib/tajweedDetector';
import { useMemorizationStore } from '@/store/useMemorizationStore';
import { useUIStore } from '@/store/useUIStore';
import {
  cleanQuranicText,
  splitIntoWords,
  matchArabicWords,
  normalizeArabicText
} from '@/lib/arabicUtils';
import {
  splitTajweedHtmlByWords,
  renderTajweedWordWithMemoryMode,
  TajweedWord
} from '@/lib/tajweedHtmlUtils';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  Mic,
  MicOff,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  Trophy,
  AlertCircle,
  ArrowLeft,
  Keyboard
} from 'lucide-react';

interface Word {
  text: string;
  tajweedHtml?: string;    // HTML with Tajweed tags (optional, for Tajweed mode)
  status: 'pending' | 'correct' | 'incorrect' | 'current';
  position: number;
  attempts: number;        // Track attempt count for this word
  isRevealed: boolean;     // Track if word is visible (for Memory Challenge Mode)
  isPerfect: boolean;      // True if correct on first try
  hintsShown: number;      // Number of hint letters shown (0 = no hints)
  duplicateIndex?: number; // If word appears multiple times, which occurrence is this (1-based)
  totalDuplicates?: number; // Total number of times this word appears in the verse
}

interface PracticeModeProps {
  verseKey: string;
  arabicText: string;
  audioUrl?: string;
  onClose: () => void;
  onNextVerse?: () => void;
  onPreviousVerse?: () => void;
  currentVerse?: number;
  totalVerses?: number;
  hasTajweed?: boolean;
}

// Declare Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type StrictnessLevel = 'lenient' | 'medium' | 'strict';
type MemoryDifficulty = 'easy' | 'medium' | 'hard';

export function PracticeMode({ verseKey, arabicText, audioUrl, onClose, onNextVerse, onPreviousVerse, currentVerse, totalVerses, hasTajweed = false }: PracticeModeProps) {
  const { addPracticeSession } = useMemorizationStore();
  const { showDuplicateBadges, tajweedAssistantEnabled } = useUIStore();

  // Helper function: Strip HTML tags for word processing when Tajweed is enabled
  const cleanTextForProcessing = (text: string): string => {
    if (!hasTajweed) return text;
    // Remove all HTML tags but keep the text content
    return text.replace(/<[^>]+>/g, '');
  };

  const [isListening, setIsListening] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [strictness, setStrictness] = useState<StrictnessLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('strictness');
      return (saved as StrictnessLevel) || 'medium';
    }
    return 'medium';
  });

  // Memory Challenge Mode state with localStorage persistence
  const [isMemoryMode, setIsMemoryMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isMemoryMode');
      return saved === 'true';
    }
    return false;
  });
  const [memoryDifficulty, setMemoryDifficulty] = useState<MemoryDifficulty>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memoryDifficulty');
      return (saved as MemoryDifficulty) || 'medium';
    }
    return 'medium';
  });
  const [perfectWords, setPerfectWords] = useState(0);
  const [stuckTimer, setStuckTimer] = useState<number | null>(null);
  const [stuckWordIndex, setStuckWordIndex] = useState<number | null>(null);
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [stuckWord, setStuckWord] = useState('');
  const [stuckAttempts, setStuckAttempts] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Session Summary Modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  // Auto-advance state
  const [autoAdvance, setAutoAdvance] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoAdvance');
      console.log('🔄 [Auto-Advance] Initializing from localStorage:', saved);
      return saved === 'true';
    }
    return false;
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  // Sync practice settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('💾 [Auto-Advance] Syncing to localStorage:', autoAdvance);
      localStorage.setItem('autoAdvance', String(autoAdvance));
    }
  }, [autoAdvance]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('💾 [Memory Mode] Syncing to localStorage:', isMemoryMode);
      localStorage.setItem('isMemoryMode', String(isMemoryMode));
    }
  }, [isMemoryMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('💾 [Memory Difficulty] Syncing to localStorage:', memoryDifficulty);
      localStorage.setItem('memoryDifficulty', memoryDifficulty);
    }
  }, [memoryDifficulty]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('💾 [Strictness] Syncing to localStorage:', strictness);
      localStorage.setItem('strictness', strictness);
    }
  }, [strictness]);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stuckTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to track current values for event handlers (avoid closure issues)
  const isMemoryModeRef = useRef(isMemoryMode);
  const memoryDifficultyRef = useRef(memoryDifficulty);
  const lastProcessedTranscriptRef = useRef<string>('');

  // Keep refs in sync with state
  useEffect(() => {
    isMemoryModeRef.current = isMemoryMode;
    console.log(`🔄 [Ref Sync] isMemoryModeRef updated to: ${isMemoryMode}`);
  }, [isMemoryMode]);

  useEffect(() => {
    memoryDifficultyRef.current = memoryDifficulty;
  }, [memoryDifficulty]);

  // Get matching threshold based on strictness level
  const getMatchingThreshold = () => {
    switch (strictness) {
      case 'strict':
        return 0.9; // 90% match required
      case 'medium':
        return 0.7; // 70% match required
      case 'lenient':
        return 0.5; // 50% match required
      default:
        return 0.7;
    }
  };

  // Get hint threshold based on difficulty level
  const getHintThreshold = () => {
    switch (memoryDifficulty) {
      case 'easy':
        return 2; // Show hints after 2 attempts
      case 'medium':
        return 3; // Show hints after 3 attempts
      case 'hard':
        return 999; // Never show hints
      default:
        return 3;
    }
  };

  // Play success sound
  const playSuccessSound = () => {
    try {
      // Using Web Audio API to generate a pleasant success tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Pleasant high tone
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio playback not available:', error);
    }
  };

  // Play error sound
  const playErrorSound = () => {
    try {
      // Using Web Audio API to generate a subtle error tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 200; // Lower tone for error
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio playback not available:', error);
    }
  };

  // Convert number to Arabic-Indic numerals (٠-٩)
  const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };

  // Extract ALL verse numbers and their positions from the HTML
  // IMPORTANT: Must use the same cleaning logic as splitTajweedHtmlByWords
  const extractVerseMarkers = (text: string): Array<{ number: string; position: number }> => {
    const markers: Array<{ number: string; position: number }> = [];
    const regex = /<span[^>]*class=["']?end["']?[^>]*>(.*?)<\/span>/gi;

    // Step 1: Find all verse markers in the ORIGINAL text
    let match;
    const foundMarkers: Array<{ number: string; htmlPosition: number }> = [];

    while ((match = regex.exec(text)) !== null) {
      foundMarkers.push({
        number: match[1].trim(),
        htmlPosition: match.index,
      });
    }

    // Step 2: Remove verse markers from text (same as splitTajweedHtmlByWords)
    const cleanedText = text.replace(/<span[^>]*class=["']?end["']?[^>]*>.*?<\/span>/gi, '');

    // Step 3: For each marker, find its position in the cleaned word array
    for (const marker of foundMarkers) {
      // Get text before this marker in ORIGINAL HTML
      const textBeforeMarker = text.substring(0, marker.htmlPosition);

      // Remove verse markers from text before this marker
      const cleanedTextBefore = textBeforeMarker.replace(/<span[^>]*class=["']?end["']?[^>]*>.*?<\/span>/gi, '');

      // Strip all HTML tags to get plain text
      const plainTextBefore = cleanedTextBefore.replace(/<[^>]+>/g, '');

      // Count words (same logic as splitTajweedHtmlByWords)
      const wordsBeforeMarker = plainTextBefore
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 0).length;

      markers.push({
        number: marker.number,
        position: wordsBeforeMarker,
      });

      console.log(`📍 [Verse Marker] Found verse ${marker.number} at word position ${wordsBeforeMarker} (after cleaning)`);
    }

    return markers;
  };

  const verseMarkers = extractVerseMarkers(arabicText);
  console.log('🎯 [Verse Markers] Total markers found:', verseMarkers.length);

  // Initialize words from Arabic text using robust utilities
  useEffect(() => {
    let arabicWords: Word[];

    if (hasTajweed && arabicText.includes('<tajweed')) {
      // Tajweed HTML mode: Split while preserving markup
      const tajweedWords = splitTajweedHtmlByWords(arabicText);

      // Detect duplicates based on plain text
      const wordOccurrences = new Map<string, number[]>();

      tajweedWords.forEach((tw, index) => {
        const normalized = normalizeArabicText(tw.plainText);
        if (!wordOccurrences.has(normalized)) {
          wordOccurrences.set(normalized, []);
        }
        wordOccurrences.get(normalized)!.push(index);
      });

      // Log duplicate words
      const duplicates = Array.from(wordOccurrences.entries()).filter(([_, positions]) => positions.length > 1);
      if (duplicates.length > 0) {
        console.log('🔄 Duplicate words detected:', duplicates.map(([word, positions]) => ({
          word,
          positions,
          count: positions.length
        })));
      }

      arabicWords = tajweedWords.map((tw, index) => {
        const normalized = normalizeArabicText(tw.plainText);
        const positions = wordOccurrences.get(normalized)!;
        const isDuplicate = positions.length > 1;
        const duplicateIndex = isDuplicate ? positions.indexOf(index) + 1 : undefined;

        return {
          text: tw.plainText,           // Plain text for matching
          tajweedHtml: tw.html,          // Store Tajweed HTML
          status: 'pending' as const,
          position: index,
          attempts: 0,
          isRevealed: !isMemoryMode,
          isPerfect: false,
          hintsShown: 0,
          duplicateIndex,
          totalDuplicates: isDuplicate ? positions.length : undefined,
        };
      });
    } else {
      // Plain text mode (existing logic)
      const processedText = cleanTextForProcessing(arabicText);
      const cleanedText = cleanQuranicText(processedText);
      const wordTexts = splitIntoWords(processedText);

      // Detect duplicate words and track their occurrences
      const wordOccurrences = new Map<string, number[]>();

      wordTexts.forEach((text, index) => {
        const normalized = normalizeArabicText(text);
        if (!wordOccurrences.has(normalized)) {
          wordOccurrences.set(normalized, []);
        }
        wordOccurrences.get(normalized)!.push(index);
      });

      // Log duplicate words
      const duplicates = Array.from(wordOccurrences.entries()).filter(([_, positions]) => positions.length > 1);
      if (duplicates.length > 0) {
        console.log('🔄 Duplicate words detected:', duplicates.map(([word, positions]) => ({
          word,
          positions,
          count: positions.length
        })));
      }

      arabicWords = wordTexts.map((text, index) => {
        const normalized = normalizeArabicText(text);
        const positions = wordOccurrences.get(normalized)!;
        const isDuplicate = positions.length > 1;
        const duplicateIndex = isDuplicate ? positions.indexOf(index) + 1 : undefined;

        return {
          text,
          tajweedHtml: undefined,  // No Tajweed HTML for plain text
          status: 'pending' as const,
          position: index,
          attempts: 0,
          isRevealed: !isMemoryMode,
          isPerfect: false,
          hintsShown: 0,
          duplicateIndex: duplicateIndex,
          totalDuplicates: isDuplicate ? positions.length : undefined,
        };
      });
    }

    setWords(arabicWords);
    setPerfectWords(0);
    setCurrentWordIndex(0);
    setIsComplete(false);
    setCountdown(null);
    setIsListening(false);

    // Clear any running countdown timers
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [arabicText, hasTajweed]); // Re-initialize when text or Tajweed setting changes

  // Save practice session when complete
  useEffect(() => {
    if (isComplete && words.length > 0) {
      const correctWords = words.filter(w => w.status === 'correct').length;
      const duration = startTime ? Date.now() - startTime : 0;

      // Calculate session statistics for modal
      const totalAttempts = words.reduce((sum, w) => sum + Math.max(1, w.attempts), 0);
      const stuckWordsList = words
        .filter(w => w.attempts > 1)
        .map(w => w.text)
        .slice(0, 5); // Top 5 stuck words
      const totalHintsUsed = words.reduce((sum, w) => sum + (w.hintsShown > 0 ? 1 : 0), 0);
      const isPerfectRun = words.every(w => w.isPerfect);
      const perfectWordsCount = words.filter(w => w.isPerfect).length;

      const stats: SessionStats = {
        totalWords: words.length,
        perfectWords: perfectWordsCount,
        totalAttempts,
        accuracy: Math.round((correctWords / words.length) * 100),
        timeSpent: duration,
        stuckWords: stuckWordsList,
        hintsUsed: totalHintsUsed,
        isPerfectRun,
      };

      setSessionStats(stats);
      setShowSummaryModal(true);

      // Save to Zustand store (for local state)
      addPracticeSession({
        verseKey,
        accuracy,
        totalWords: words.length,
        correctWords,
        duration,
      });

      // Save to PostgreSQL database
      fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseKey,
          accuracy,
          totalWords: words.length,
          correctWords,
          duration,
          perfectWords,
          isMemoryMode,
          difficulty: memoryDifficulty,
          strictness,
        }),
      })
        .then(res => res.json())
        .then(data => console.log('✅ Practice session saved to database:', data))
        .catch(err => console.error('❌ Failed to save practice session:', err));

      // Save progress metadata to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastVerse', verseKey);
        localStorage.setItem('lastPracticeTime', new Date().toISOString());
      }
    }
  }, [isComplete, words, accuracy, verseKey, startTime, addPracticeSession, perfectWords, isMemoryMode, memoryDifficulty, strictness]);

  // Stuck word modal trigger - when stuck threshold is reached, show modal
  useEffect(() => {
    console.log('⏱️ [Stuck Modal Effect] stuckWordIndex:', stuckWordIndex);
    if (stuckWordIndex !== null && stuckWordIndex < words.length) {
      const word = words[stuckWordIndex];
      console.log('🚨 [Stuck Modal] Showing modal for word:', word.text, 'attempts:', word.attempts);

      setStuckWord(word.text);
      setStuckAttempts(word.attempts);
      setShowStuckModal(true);
    }
  }, [stuckWordIndex, words]);

  // Clear stuck timer when moving to next word (defensive cleanup)
  useEffect(() => {
    if (stuckWordIndex !== null && currentWordIndex !== stuckWordIndex) {
      console.log('🔧 [Stuck Timer Cleanup] Current word changed - clearing stuck timer');
      setStuckTimer(null);
      setStuckWordIndex(null);
      if (stuckTimerIntervalRef.current) {
        clearInterval(stuckTimerIntervalRef.current);
        stuckTimerIntervalRef.current = null;
      }
    }
  }, [currentWordIndex, stuckWordIndex]);

  // Clear stuck timer when verse is completed (defensive cleanup)
  useEffect(() => {
    if (isComplete && (stuckTimer !== null || stuckWordIndex !== null)) {
      console.log('🔧 [Stuck Timer Cleanup] Verse completed - clearing stuck timer');
      setStuckTimer(null);
      setStuckWordIndex(null);
      if (stuckTimerIntervalRef.current) {
        clearInterval(stuckTimerIntervalRef.current);
        stuckTimerIntervalRef.current = null;
      }
    }
  }, [isComplete, stuckTimer, stuckWordIndex]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      console.log('Speech Recognition not available');
    } else {
      console.log('Speech Recognition available:', SpeechRecognition);
    }
  }, []);

  // Auto-start listening when arriving from auto-advance
  useEffect(() => {
    if (typeof window !== 'undefined' && isSupported && recognitionRef.current) {
      const shouldAutoStart = localStorage.getItem('autoStartListening') === 'true';
      console.log('🎤 [Auto-Start] Checking autoStartListening flag:', shouldAutoStart, 'autoAdvance:', autoAdvance);

      if (shouldAutoStart && autoAdvance && words.length > 0) {
        // Clear the flag immediately
        localStorage.removeItem('autoStartListening');
        console.log('🎤 [Auto-Start] Auto-starting microphone for continuous practice...');

        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          if (!isListening && !isComplete) {
            startListening();
          }
        }, 500);
      }
    }
  }, [words, isSupported, autoAdvance]); // Run when words are loaded

  // Initialize Speech Recognition (only once on mount)
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    console.log('Recognition initialized with lang:', recognition.lang);

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setErrorMessage('');
      // Clear deduplication ref when starting new recognition session
      lastProcessedTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      console.log('Recognition result:', event);
      let interimTranscript = '';
      let finalTranscript = '';
      let hasFinalResult = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log('Transcript part:', transcript, 'Final:', event.results[i].isFinal);
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          hasFinalResult = true;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = (finalTranscript + interimTranscript).trim();
      console.log('Current full transcript:', currentTranscript);
      setTranscript(currentTranscript);

      // Match words in real-time, but only count attempts on final results
      matchWords(currentTranscript, hasFinalResult);

      // Clear deduplication ref when we receive a final result (user finished speaking this phrase)
      // This allows the next spoken phrase to be counted as a new attempt
      if (hasFinalResult) {
        console.log('🔄 [Final Result] Clearing deduplication ref for next phrase');
        lastProcessedTranscriptRef.current = '';
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error, event);
      if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please try speaking closer to the microphone.');
      } else if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted');
      } else {
        setErrorMessage(`Error: ${event.error}. Try refreshing the page.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      // Don't auto-restart - let the user control when to start/stop
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        console.log('Cleaning up recognition on unmount');
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, [isSupported]); // Only depend on isSupported, not isListening!

  // Request microphone access for Tajweed Assistant audio analysis
  useEffect(() => {
    if (!tajweedAssistantEnabled || !hasTajweed) {
      // Cleanup existing stream if Tajweed Assistant is disabled
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      return;
    }

    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMediaStream(stream);
      })
      .catch((error) => {
        console.error('[Tajweed Assistant] Microphone access denied:', error);
      });

    // Cleanup on unmount
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tajweedAssistantEnabled, hasTajweed]);

  // Match transcribed words with expected words using robust algorithm
  const matchWords = (transcribedText: string, isFinalResult: boolean = false) => {
    // Use robust word splitting
    const transcribedWords = splitIntoWords(transcribedText);

    console.log('🎤 Transcribed words:', transcribedWords);
    console.log('🎤 Word count:', transcribedWords.length);
    console.log('🎤 Is final result:', isFinalResult);

    setWords(prevWords => {
      const newWords = [...prevWords];
      let correctCount = 0;

      // Find first word that is NOT already correct (skip already-matched words)
      let matchedIndex = newWords.findIndex(w => w.status !== 'correct');
      if (matchedIndex === -1) matchedIndex = newWords.length; // All words correct

      // CRITICAL FIX: Skip transcribed words that correspond to already-matched positions
      // BUT only if the transcript is long enough (contains the already-matched words)
      // When a new speech segment starts after a pause, the transcript resets to just the new words
      const numAlreadyMatched = matchedIndex;
      const shouldSkipWords = transcribedWords.length >= numAlreadyMatched;
      const wordsToSkip = shouldSkipWords ? numAlreadyMatched : 0;
      const newTranscribedWords = transcribedWords.slice(wordsToSkip);

      console.log(`🎯 Transcript length: ${transcribedWords.length}, Already matched: ${numAlreadyMatched}, Should skip: ${shouldSkipWords}`);
      console.log(`🎯 Skipping first ${wordsToSkip} transcribed words (already matched)`);
      console.log(`🎯 Processing ${newTranscribedWords.length} new transcribed words:`, newTranscribedWords);

      newTranscribedWords.forEach((spokenWord, idx) => {
        if (matchedIndex >= newWords.length) return;

        const expectedWord = newWords[matchedIndex].text;
        const currentWord = newWords[matchedIndex];

        console.log(`\n🔄 Matching word ${matchedIndex + 1}/${newWords.length} (starting from first non-correct word):`);
        console.log('  Expected:', expectedWord);
        console.log('  Spoken:', spokenWord);

        // Enhanced logging for duplicate words
        if (currentWord.totalDuplicates && currentWord.totalDuplicates > 1) {
          console.log(`  🔄 [DUPLICATE] This is occurrence ${currentWord.duplicateIndex}/${currentWord.totalDuplicates} of this word`);
        }

        // Use robust Arabic word matching with Levenshtein distance
        const isMatch = matchArabicWords(spokenWord, expectedWord, strictness);

        if (isMatch) {
          console.log('  ✅ MATCH!');
          // Word matched correctly!
          newWords[matchedIndex].status = 'correct';
          newWords[matchedIndex].isRevealed = true;

          // Clear stuck timer if it's running for this word
          if (stuckWordIndex === matchedIndex && stuckTimer !== null) {
            console.log('🎬 [Stuck Timer] Clearing timer - word pronounced correctly!');
            setStuckTimer(null);
            setStuckWordIndex(null);
            if (stuckTimerIntervalRef.current) {
              clearInterval(stuckTimerIntervalRef.current);
              stuckTimerIntervalRef.current = null;
            }
          }

          // Check if this is first attempt (perfect word)
          if (currentWord.attempts === 0) {
            newWords[matchedIndex].isPerfect = true;
            if (isMemoryMode) {
              setPerfectWords(prev => prev + 1);
            }
          }

          correctCount++;
          matchedIndex++;

          // Clear deduplication ref when moving to next word
          lastProcessedTranscriptRef.current = '';

          // Play success sound in memory mode
          if (isMemoryModeRef.current) {
            playSuccessSound();
          }
        } else {
          console.log('  ❌ NO MATCH');
          console.log(`🔍 [Debug] isMemoryMode: ${isMemoryModeRef.current}, memoryDifficulty: ${memoryDifficultyRef.current}`);
          // Word didn't match - in memory mode, increment attempts
          // Note: We're processing the word at matchedIndex, which is the current word being matched
          // DEFENSIVE CHECK: Only increment attempts if:
          // 1. Word is NOT already correct
          // 2. This is a NEW spoken attempt (not an interim result we've already processed)
          // 3. This is a FINAL result (user finished speaking), NOT an interim result
          const currentAttemptKey = `${matchedIndex}-${spokenWord}`;
          const shouldCountAttempt =
            isMemoryModeRef.current &&
            newWords[matchedIndex].status !== 'correct' &&
            lastProcessedTranscriptRef.current !== currentAttemptKey &&
            isFinalResult; // CRITICAL: Only count on final results to prevent rapid counting

          console.log(`🔍 [Dedup Check] currentAttemptKey: "${currentAttemptKey}", lastProcessed: "${lastProcessedTranscriptRef.current}", isFinal: ${isFinalResult}, shouldCount: ${shouldCountAttempt}`);

          if (shouldCountAttempt) {
            console.log('🔍 [Debug] Inside Memory Mode block - incrementing attempts (NEW attempt)');
            newWords[matchedIndex].attempts += 1;
            lastProcessedTranscriptRef.current = currentAttemptKey; // Mark this attempt as processed

            const hintThreshold = getHintThreshold();
            const attempts = newWords[matchedIndex].attempts;

            console.log(`⏱️ [Stuck Timer] Attempt ${attempts}/${hintThreshold}, difficulty: ${memoryDifficultyRef.current}, wordStatus: ${newWords[matchedIndex].status}`);

            // Check if stuck (reached threshold)
            // DEFENSIVE CHECKS: Only trigger stuck timer if:
            // 1. Word is NOT already correct
            // 2. Not in hard difficulty mode (hard mode doesn't show hints)
            const shouldTriggerModal = attempts === hintThreshold && memoryDifficultyRef.current !== 'hard' && newWords[matchedIndex].status !== 'correct';
            console.log(`🔍 [Stuck Check] attempts === hintThreshold: ${attempts === hintThreshold} (${attempts} === ${hintThreshold})`);
            console.log(`🔍 [Stuck Check] difficulty !== 'hard': ${memoryDifficultyRef.current !== 'hard'} (${memoryDifficultyRef.current})`);
            console.log(`🔍 [Stuck Check] status !== 'correct': ${newWords[matchedIndex].status !== 'correct'} (${newWords[matchedIndex].status})`);
            console.log(`🔍 [Stuck Check] shouldTriggerModal: ${shouldTriggerModal}`);

            if (shouldTriggerModal) {
              // Start stuck timer instead of showing hint immediately
              console.log('🎬 [Stuck Modal] TRIGGERING! Showing modal for word index:', matchedIndex, 'word:', newWords[matchedIndex].text);
              setStuckWordIndex(matchedIndex);
              setStuckTimer(5); // Start with 5 seconds
            } else if (attempts > hintThreshold && memoryDifficultyRef.current !== 'hard' && newWords[matchedIndex].status !== 'correct') {
              // Already showed timer, now show progressive hints
              if (attempts === hintThreshold + 1) {
                newWords[matchedIndex].hintsShown = 1; // Show first letter
              } else if (attempts === hintThreshold + 2) {
                newWords[matchedIndex].hintsShown = 2; // Show first 2 letters
              } else if (attempts >= hintThreshold + 3) {
                newWords[matchedIndex].hintsShown = 999; // Show full word
                newWords[matchedIndex].isRevealed = true;
              }
            }

            // Play error sound
            playErrorSound();
          }
        }
      });

      console.log(`\n📊 Matching summary: ${correctCount}/${newWords.length} words matched`);

      // Clear 'current' status from all words before setting new current word
      newWords.forEach(w => {
        if (w.status === 'current') {
          w.status = 'pending';
        }
      });

      // Set current word
      if (matchedIndex < newWords.length) {
        newWords[matchedIndex].status = 'current';
        setCurrentWordIndex(matchedIndex);
        console.log(`👉 Current word index: ${matchedIndex}`);
      } else {
        // All words matched!
        console.log('🎉 All words matched! Verse complete!');
        setIsComplete(true);
        setIsListening(false);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }

      // Calculate accuracy (considering attempts in memory mode)
      if (isMemoryMode) {
        const totalAttempts = newWords.reduce((sum, w) => sum + Math.max(1, w.attempts), 0);
        const acc = Math.round((correctCount / totalAttempts) * 100);
        setAccuracy(acc);
      } else {
        const acc = Math.round((correctCount / newWords.length) * 100);
        setAccuracy(acc);
      }

      return newWords;
    });
  };

  // Old matching functions removed - now using robust utilities from arabicUtils.ts

  // Start listening
  const startListening = () => {
    console.log('startListening called. Supported:', isSupported, 'Recognition:', recognitionRef.current);

    if (!isSupported) {
      setErrorMessage('Speech recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition not initialized. Please refresh the page.');
      return;
    }

    setIsListening(true);
    setErrorMessage('');

    // Set start time if this is the first time starting
    if (!startTime) {
      setStartTime(Date.now());
    }

    try {
      console.log('Attempting to start recognition...');
      recognitionRef.current.start();
      console.log('Recognition start() called successfully');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setErrorMessage(`Failed to start: ${error}. The microphone might already be in use.`);
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Reset practice
  const reset = (memoryModeOverride?: boolean) => {
    stopListening();
    const effectiveMemoryMode = memoryModeOverride !== undefined ? memoryModeOverride : isMemoryMode;
    setWords(prev => prev.map(w => ({
      ...w,
      status: 'pending',
      attempts: 0,
      isRevealed: !effectiveMemoryMode,
      isPerfect: false,
      hintsShown: 0,
      // Preserve duplicate tracking information
      duplicateIndex: w.duplicateIndex,
      totalDuplicates: w.totalDuplicates,
    })));
    setCurrentWordIndex(0);
    setAccuracy(0);
    setTranscript('');
    setIsComplete(false);
    setErrorMessage('');
    setStartTime(null);
    setPerfectWords(0);
    setStuckTimer(null);
    setStuckWordIndex(null);
    if (stuckTimerIntervalRef.current) {
      clearInterval(stuckTimerIntervalRef.current);
      stuckTimerIntervalRef.current = null;
    }
  };

  // Extend stuck timer by 5 seconds
  const extendStuckTimer = () => {
    setStuckTimer((prev) => (prev !== null ? prev + 5 : 5));
  };

  // Skip stuck timer and show hint now
  const skipStuckTimer = () => {
    if (stuckTimerIntervalRef.current) {
      clearInterval(stuckTimerIntervalRef.current);
      stuckTimerIntervalRef.current = null;
    }
    if (stuckWordIndex !== null) {
      setWords((prevWords) => {
        const newWords = [...prevWords];
        newWords[stuckWordIndex].hintsShown = 1;
        return newWords;
      });
    }
    setStuckTimer(null);
    setStuckWordIndex(null);
  };

  // Stuck Modal Handlers
  const handleStuckRetry = () => {
    console.log('🔄 [Stuck Modal] User clicked Retry');
    setShowStuckModal(false);
    // Reset attempts count for a fresh start (optional - can be commented out if you want to keep count)
    if (stuckWordIndex !== null) {
      setWords((prevWords) => {
        const newWords = [...prevWords];
        newWords[stuckWordIndex].attempts = 0;
        return newWords;
      });
    }
    setStuckWordIndex(null);
    setStuckTimer(null);
    // Clear the last processed transcript so attempts can be counted again
    lastProcessedTranscriptRef.current = '';
  };

  const handleStuckReveal = () => {
    console.log('👁️ [Stuck Modal] User clicked Reveal');

    // Capture the index before clearing state
    const indexToReveal = stuckWordIndex;

    // CRITICAL: Clear stuck state FIRST to prevent re-triggering
    // This must happen before updating words to avoid race conditions
    setShowStuckModal(false);
    setStuckWordIndex(null);
    setStuckTimer(null);
    lastProcessedTranscriptRef.current = '';

    // THEN: Update the word state
    if (indexToReveal !== null) {
      setWords((prevWords) => {
        const newWords = [...prevWords];
        newWords[indexToReveal].isRevealed = true;
        newWords[indexToReveal].status = 'correct'; // Mark as correct to move forward
        newWords[indexToReveal].hintsShown = 999;
        return newWords;
      });
    }
  };

  const handleStuckModalClose = () => {
    console.log('❌ [Stuck Modal] User closed modal');
    setShowStuckModal(false);
    setStuckWordIndex(null);
    setStuckTimer(null);
  };

  // Session Summary Modal Handlers
  const handleSummaryClose = () => {
    console.log('📊 [Summary Modal] User closed modal');
    setShowSummaryModal(false);

    // After closing modal, check if auto-advance should proceed
    if (autoAdvance && onNextVerse) {
      console.log('⏰ [Auto-Advance] Starting countdown after modal close...');
      setCountdown(3);

      // Clear any existing timers
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      countdownTimerRef.current = setTimeout(() => {
        console.log('🚀 [Auto-Advance] Countdown complete! Navigating to next verse...');
        // Set flag to auto-start listening on next verse
        if (typeof window !== 'undefined') {
          localStorage.setItem('autoStartListening', 'true');
          console.log('🎤 [Auto-Advance] Set autoStartListening flag for next verse');
        }
        onNextVerse();
        setCountdown(null);
      }, 3000);
    }
  };

  const handleSummaryRetry = () => {
    console.log('🔄 [Summary Modal] User clicked Practice Again');
    setShowSummaryModal(false);
    reset();
    // Small delay then auto-start listening
    setTimeout(() => {
      startListening();
    }, 500);
  };

  // Keyboard shortcuts setup
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: ' ',
        description: 'Start / Stop Microphone',
        action: () => {
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
        },
        condition: () => !isComplete && isSupported,
      },
      {
        key: 'r',
        description: 'Reset Practice',
        action: () => reset(),
        condition: () => !isComplete,
      },
      {
        key: 'h',
        description: 'Hear Correct Recitation',
        action: () => {
          if (audioUrl) {
            playCorrectAudio();
          }
        },
        condition: () => !!audioUrl,
      },
      {
        key: 'Enter',
        description: 'Next Verse',
        action: () => {
          if (onNextVerse) {
            // Cancel countdown timers
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            if (countdownTimerRef.current) {
              clearTimeout(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            setCountdown(null);
            onNextVerse();
          }
        },
        condition: () => isComplete && !!onNextVerse,
      },
      {
        key: 'Escape',
        description: 'Close Practice Mode',
        action: () => onClose(),
        condition: () => true,
      },
      {
        key: '?',
        description: 'Show Keyboard Shortcuts',
        action: () => setShowKeyboardHelp((prev) => !prev),
        condition: () => true,
      },
      {
        key: 'ArrowLeft',
        description: 'Previous Word',
        action: () => {
          console.log('⬅️ [Arrow Left] Pressed - moving to previous word');
          setCurrentWordIndex((prev) => {
            console.log('⬅️ [Arrow Left] Current index:', prev, '→', Math.max(0, prev - 1));
            return Math.max(0, prev - 1);
          });
        },
        condition: () => {
          console.log('⬅️ [Arrow Left] Condition check - isComplete:', isComplete);
          return !isComplete;
        },
      },
      {
        key: 'ArrowRight',
        description: 'Next Word',
        action: () => {
          console.log('➡️ [Arrow Right] Pressed - moving to next word, words.length:', words.length);
          setCurrentWordIndex((prev) => {
            console.log('➡️ [Arrow Right] Current index:', prev, '→', Math.min(words.length - 1, prev + 1));
            return Math.min(words.length - 1, prev + 1);
          });
        },
        condition: () => {
          console.log('➡️ [Arrow Right] Condition check - isComplete:', isComplete);
          return !isComplete;
        },
      },
    ],
    enabled: !showKeyboardHelp, // Disable shortcuts when help is open
  });

  // Play correct audio
  const playCorrectAudio = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
    }
  };

  // Get status color
  const getStatusColor = (status: Word['status']) => {
    switch (status) {
      case 'correct':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'incorrect':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'current':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  // Render word with hints or hidden placeholder
  const renderWordContent = (word: Word) => {
    if (!isMemoryMode || word.isRevealed) {
      // Show full word (normal mode or revealed in memory mode)
      return word.text;
    }

    // In memory mode and not revealed
    if (word.status !== 'current') {
      // Show placeholder for non-current words
      if (memoryDifficulty === 'hard') {
        return '___'; // Simple placeholder
      } else {
        // Show word length hint
        return '_'.repeat(Math.min(word.text.length, 10));
      }
    }

    // Current word - show hints based on attempts
    if (word.hintsShown === 0) {
      // No hints yet
      if (memoryDifficulty === 'hard') {
        return '___';
      } else {
        return '_'.repeat(Math.min(word.text.length, 10));
      }
    } else if (word.hintsShown === 1) {
      // Show first letter
      const firstChar = word.text[0];
      const rest = '_'.repeat(Math.min(word.text.length - 1, 9));
      return firstChar + rest;
    } else if (word.hintsShown === 2) {
      // Show first 2 letters
      const firstTwo = word.text.slice(0, 2);
      const rest = '_'.repeat(Math.min(word.text.length - 2, 8));
      return firstTwo + rest;
    } else {
      // Show full word
      return word.text;
    }
  };

  const correctWords = words.filter(w => w.status === 'correct').length;
  const totalWords = words.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full"
    >
      <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Practice Mode - Real-Time Assessment</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verse {verseKey} • Speak the verse word by word
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Browser Support Warning */}
            {!isSupported && (
              <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">Browser Not Supported</p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      Speech recognition requires Chrome or Edge browser. Please switch browsers to use this feature.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {correctWords} / {totalWords} words
                </span>
              </div>
              <Progress value={(correctWords / totalWords) * 100} className="h-2" />
            </div>

            {/* Accuracy and Perfect Words */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Accuracy</span>
                </div>
                <span className="text-2xl font-bold text-primary">{accuracy}%</span>
              </div>

              {isMemoryMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold">Perfect Words</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {perfectWords}/{totalWords}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Unified Tajweed Practice Section */}
            <div className="p-6 rounded-lg bg-white dark:bg-gray-950 border shadow-sm">
              <div className="flex flex-wrap gap-2 justify-end items-center" dir="rtl">
                {words.map((word, index) => {
                  // Check if there's a verse marker after this word
                  const markerAfterWord = verseMarkers.find(m => m.position === index + 1);

                  return (
                    <React.Fragment key={index}>
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: word.isPerfect && word.status === 'correct' ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          delay: index * 0.05,
                          scale: { duration: 0.5 }
                        }}
                        className={`text-3xl font-['Amiri'] px-3 py-2 rounded-lg transition-all duration-300 text-black dark:text-white ${getStatusColor(
                          word.status
                        )} ${word.isPerfect && word.status === 'correct' ? 'ring-2 ring-yellow-400 shadow-lg' : ''} ${
                          word.status === 'current' && isMemoryMode ? 'animate-pulse' : ''
                        } relative`}
                        style={{ color: 'inherit' }}
                      >
                        {word.tajweedHtml ? (
                          // Render Tajweed HTML with Memory Mode
                          <span
                            dir="rtl"
                            className="text-black dark:text-white"
                            dangerouslySetInnerHTML={{
                              __html: renderTajweedWordWithMemoryMode(
                                { html: word.tajweedHtml, plainText: word.text, position: index },
                                isMemoryMode,
                                word.isRevealed,
                                word.hintsShown,
                                memoryDifficulty,
                                word.status === 'current'
                              )
                            }}
                          />
                        ) : (
                          // Fallback: Plain text rendering (existing logic)
                          hasTajweed ? (
                            <span
                              dir="rtl"
                              className="text-black dark:text-white"
                              dangerouslySetInnerHTML={{
                                __html: applyTajweedColors(renderWordContent(word), true)
                              }}
                            />
                          ) : (
                            <span className="text-black dark:text-white">{renderWordContent(word)}</span>
                          )
                        )}

                        {/* Attempt counter */}
                        {word.attempts > 0 && isMemoryMode && word.status === 'current' && (
                          <span className="text-xs ml-1 text-red-500">({word.attempts})</span>
                        )}

                        {/* Duplicate indicator - Only show if enabled in settings */}
                        {showDuplicateBadges && word.totalDuplicates && word.totalDuplicates > 1 && (word.status === 'current' || word.isRevealed) && (
                          <span className="absolute -top-1 -right-1 text-[10px] bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {word.duplicateIndex}/{word.totalDuplicates}
                          </span>
                        )}
                      </motion.span>

                      {/* Verse Number Circle - Display after verse ends */}
                      {markerAfterWord && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg border-2 border-emerald-300 dark:border-emerald-500">
                            <span className="text-lg">{markerAfterWord.number}</span>
                          </div>
                        </motion.div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {isMemoryMode && (
                <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
                  <p>💡 Tip: Words reveal as you pronounce them correctly. Perfect words (first try) get a ⭐!</p>
                  <p className="text-xs">🎨 Tajweed colors help you pronounce correctly</p>
                  {showDuplicateBadges && (
                    <p className="text-xs">🔄 Blue badges (1/2, 2/2) show which occurrence of a duplicate word you're on</p>
                  )}
                </div>
              )}

              {/* Tajweed Color Legend */}
              {hasTajweed && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Tajweed Color Guide:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0088ff' }}></span>
                      <span className="text-gray-700 dark:text-gray-300">Qalqalah</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#169777' }}></span>
                      <span className="text-gray-700 dark:text-gray-300">Ikhfa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff7e1e' }}></span>
                      <span className="text-gray-700 dark:text-gray-300">Iqlab</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d500b7' }}></span>
                      <span className="text-gray-700 dark:text-gray-300">Idgham/Ghunna</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff0000' }}></span>
                      <span className="text-gray-700 dark:text-gray-300">Madd (Obligatory)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#aaaaaa' }}></span>
                      <span className="text-gray-700 dark:text-gray-300">Silent/Sukun</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stuck Timer Popup */}
            <AnimatePresence>
              {isMemoryMode && stuckTimer !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                      {/* Circular countdown similar to auto-advance */}
                      <svg className="w-16 h-16 -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-muted-foreground/20"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - stuckTimer / 5)}`}
                          className="text-orange-600 transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">{stuckTimer}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        🤔 Stuck? Hint coming in {stuckTimer}s...
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Need more time to remember? Or show the hint now?
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔧 [Stuck Timer] Extending timer...');
                            extendStuckTimer();
                          }}
                          size="sm"
                          variant="outline"
                          className="border-orange-500/50 hover:bg-orange-500/10"
                        >
                          ⏱️ Extend +5s
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔧 [Stuck Timer] Skipping timer, showing hint...');
                            skipStuckTimer();
                          }}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          💡 Show Hint Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Transcript */}
            {transcript && (
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground mb-2">What you said:</p>
                <p className="text-lg font-['Amiri']" dir="rtl">
                  {transcript}
                </p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3 flex-wrap">
              {!isListening ? (
                <Button
                  onClick={startListening}
                  disabled={!isSupported || isComplete}
                  className="flex-1 relative group"
                  size="lg"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Speaking
                  <kbd className="ml-2 px-2 py-0.5 text-xs font-semibold bg-white/20 border border-white/30 rounded">
                    Space
                  </kbd>
                </Button>
              ) : (
                <Button
                  onClick={stopListening}
                  variant="destructive"
                  className="flex-1 relative group"
                  size="lg"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop
                  <kbd className="ml-2 px-2 py-0.5 text-xs font-semibold bg-white/20 border border-white/30 rounded">
                    Space
                  </kbd>
                </Button>
              )}

              <Button onClick={reset} variant="outline" size="lg" className="relative group">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
                <kbd className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                  R
                </kbd>
              </Button>

              {audioUrl && (
                <Button onClick={playCorrectAudio} variant="outline" size="lg" className="relative group">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Hear Correct
                  <kbd className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                    H
                  </kbd>
                </Button>
              )}

              <Button
                onClick={() => setShowKeyboardHelp(true)}
                variant="ghost"
                size="lg"
                className="relative group"
                title="Show keyboard shortcuts"
              >
                <Keyboard className="w-5 h-5 mr-2" />
                Shortcuts
                <kbd className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                  ?
                </kbd>
              </Button>
            </div>

            {/* Completion Message */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-6 rounded-lg border ${
                    isMemoryMode && perfectWords === totalWords
                      ? 'bg-gradient-to-r from-yellow-100 to-green-100 dark:from-yellow-900/30 dark:to-green-900/30 border-yellow-300 dark:border-yellow-800'
                      : 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isMemoryMode && perfectWords === totalWords ? (
                      <span className="text-4xl">🏆</span>
                    ) : (
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                        {currentVerse && totalVerses && currentVerse >= totalVerses
                          ? '🎊 Surah Completed! Congratulations!'
                          : isMemoryMode && perfectWords === totalWords
                          ? '🎉 Perfect Memory Mastery! All words on first try!'
                          : 'Excellent! You completed the verse!'}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        {currentVerse && totalVerses && currentVerse >= totalVerses
                          ? `You've completed all ${totalVerses} verses of this surah! 🏆`
                          : `Final accuracy: ${accuracy}%`}
                        {!( currentVerse && totalVerses && currentVerse >= totalVerses) && isMemoryMode && ` • Perfect words: ${perfectWords}/${totalWords}`}
                        {!( currentVerse && totalVerses && currentVerse >= totalVerses) && isMemoryMode && perfectWords === totalWords && ' • 🏆 Memory Master Badge Earned!'}
                      </p>
                      {isMemoryMode && !(currentVerse && totalVerses && currentVerse >= totalVerses) && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                          Total attempts: {words.reduce((sum, w) => sum + Math.max(1, w.attempts), 0)}
                        </p>
                      )}
                      {currentVerse && totalVerses && currentVerse >= totalVerses && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                          Well done! You can now move to the next surah or review previous verses.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Auto-Advance Countdown */}
                  {autoAdvance && countdown !== null && onNextVerse && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                          <svg className="w-12 h-12 -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-muted-foreground/20"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - countdown / 3)}`}
                              className="text-blue-600 transition-all duration-1000 ease-linear"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">{countdown}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Auto-advancing to next verse...
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Click any button to cancel
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  {(onNextVerse || onPreviousVerse) && (
                    <div className="mt-4 flex gap-3 justify-center">
                      {onPreviousVerse && currentVerse && currentVerse > 1 && (
                        <Button
                          onClick={() => {
                            // Cancel countdown timers
                            if (countdownIntervalRef.current) {
                              clearInterval(countdownIntervalRef.current);
                              countdownIntervalRef.current = null;
                            }
                            if (countdownTimerRef.current) {
                              clearTimeout(countdownTimerRef.current);
                              countdownTimerRef.current = null;
                            }
                            setCountdown(null);
                            onPreviousVerse();
                          }}
                          variant="outline"
                          size="lg"
                          className="flex-1 max-w-xs"
                        >
                          <ArrowLeft className="w-5 h-5 mr-2" />
                          Previous Verse
                        </Button>
                      )}
                      {onNextVerse && (
                        <Button
                          onClick={() => {
                            // Cancel countdown timers
                            if (countdownIntervalRef.current) {
                              clearInterval(countdownIntervalRef.current);
                              countdownIntervalRef.current = null;
                            }
                            if (countdownTimerRef.current) {
                              clearTimeout(countdownTimerRef.current);
                              countdownTimerRef.current = null;
                            }
                            setCountdown(null);
                            onNextVerse();
                          }}
                          size="lg"
                          className="flex-1 max-w-xs bg-green-600 hover:bg-green-700"
                        >
                          Next Verse
                          <ArrowLeft className="w-5 h-5 ml-2 mr-2 rotate-180" />
                          <kbd className="px-2 py-0.5 text-xs font-semibold bg-white/20 border border-white/30 rounded">
                            ↵
                          </kbd>
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold">How to use:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click "Start Speaking" and recite the verse</li>
                <li>Words turn 🟢 green when correct, 🟡 yellow for current word</li>
                {isMemoryMode && (
                  <>
                    <li className="text-purple-600 dark:text-purple-400 font-semibold">
                      🧠 Memory Mode: Words are hidden until pronounced correctly
                    </li>
                    <li className="text-purple-600 dark:text-purple-400">
                      Hints appear after {getHintThreshold()} failed attempts (Easy/Medium only)
                    </li>
                    <li className="text-yellow-600 dark:text-yellow-400">
                      ⭐ Get all words right on first try for Memory Master badge!
                    </li>
                  </>
                )}
                <li className="text-blue-600 dark:text-blue-400">
                  🔄 Blue badges (1/2, 2/2) show your position for duplicate words in the verse
                </li>
                <li className="text-green-600 dark:text-green-400 font-semibold">
                  ⌨️ Use keyboard shortcuts for quick actions - Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">?</kbd> to see all
                </li>
                <li>Speak clearly and at a natural pace</li>
                <li>The system works best in a quiet environment</li>
                <li>Click "Hear Correct" to play the proper recitation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      {/* Floating Settings Panel */}
      <CompactParametersPanel
        autoAdvance={autoAdvance}
        onAutoAdvanceChange={(newValue) => {
          console.log('🔘 [Auto-Advance] Toggling to:', newValue);
          setAutoAdvance(newValue);
        }}
        isMemoryMode={isMemoryMode}
        onMemoryModeChange={(newMemoryMode) => {
          console.log(`🔄 [Memory Mode Toggle] Switching from ${isMemoryMode} to ${newMemoryMode}`);
          setIsMemoryMode(newMemoryMode);
          reset(newMemoryMode);
          console.log(`✅ [Memory Mode Toggle] State updated and practice reset with Memory Mode: ${newMemoryMode}`);
        }}
        memoryDifficulty={memoryDifficulty}
        onMemoryDifficultyChange={setMemoryDifficulty}
        strictness={strictness}
        onStrictnessChange={setStrictness}
      />

      {/* Stuck Word Modal */}
      <StuckWordModal
        isOpen={showStuckModal}
        word={stuckWord}
        attempts={stuckAttempts}
        maxAttempts={getHintThreshold()}
        onRetry={handleStuckRetry}
        onReveal={handleStuckReveal}
        onClose={handleStuckModalClose}
      />

      {/* Tajweed Assistant - Real-time pronunciation feedback */}
      {hasTajweed && tajweedAssistantEnabled && (
        <TajweedAssistant
          isEnabled={tajweedAssistantEnabled}
          currentWordIndex={currentWordIndex}
          currentWord={
            words[currentWordIndex]
              ? {
                  text: words[currentWordIndex].text,
                  html: words[currentWordIndex].tajweedHtml,
                  isRevealed: words[currentWordIndex].isRevealed,
                }
              : null
          }
          mediaStream={mediaStream}
          isRecognizing={isListening}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={[
          {
            key: ' ',
            description: 'Start / Stop Microphone',
            condition: () => !isComplete && isSupported,
          },
          {
            key: 'r',
            description: 'Reset Practice',
            condition: () => !isComplete,
          },
          {
            key: 'h',
            description: 'Hear Correct Recitation',
            condition: () => !!audioUrl,
          },
          {
            key: 'Enter',
            description: 'Next Verse',
            condition: () => isComplete && !!onNextVerse,
          },
          {
            key: 'Escape',
            description: 'Close Practice Mode',
          },
          {
            key: '?',
            description: 'Show/Hide This Help',
          },
        ]}
      />

      {/* Session Summary Modal */}
      {sessionStats && (
        <SessionSummaryModal
          isOpen={showSummaryModal}
          onClose={handleSummaryClose}
          onRetry={handleSummaryRetry}
          stats={sessionStats}
          verseKey={verseKey}
        />
      )}
    </motion.div>
  );
}
