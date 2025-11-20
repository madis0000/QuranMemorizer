'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Search, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { matchArabicWords, normalizeArabicText } from '@/lib/arabicUtils';

// Declare Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VerseMatch {
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  text: string;
  confidence: number;
}

export function VoiceVerseDetector() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedVerse, setMatchedVerse] = useState<VerseMatch | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const recognitionRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchQueryRef = useRef<string>('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ar-SA'; // Arabic
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 [Voice Detector] Speech recognition started');
      setErrorMessage('');
      setTranscript('');
      setMatchedVerse(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = (finalTranscript + interimTranscript).trim();
      setTranscript(currentTranscript);

      // Search in real-time as user speaks (debounced)
      if (currentTranscript.length > 5) { // At least 5 characters
        // Debounce search to avoid too many API calls
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          if (currentTranscript !== lastSearchQueryRef.current) {
            console.log('🔍 [Voice Detector] Searching with interim transcript:', currentTranscript);
            lastSearchQueryRef.current = currentTranscript;
            searchForVerse(currentTranscript, true); // true = auto-navigate if confident
          }
        }, 300); // 300ms debounce
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ [Voice Detector] Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please allow microphone access.');
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🎤 [Voice Detector] Speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }
    };
  }, [isSupported]);

  // Start listening
  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setErrorMessage('Speech recognition not available');
      return;
    }

    setIsListening(true);
    setErrorMessage('');
    setMatchedVerse(null);
    setTranscript('');

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setErrorMessage('Failed to start microphone');
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Stop error:', error);
      }
    }
  };

  // Search for verse in the Quran
  const searchForVerse = async (spokenText: string, autoNavigate: boolean = false) => {
    setIsSearching(true);
    setErrorMessage('');

    try {
      console.log('🔍 [Voice Detector] Searching for verse with text:', spokenText);

      // Call search API endpoint
      const response = await fetch('/api/quran/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: spokenText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || 'Search failed';
        console.error('❌ [Voice Detector] Search API error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        const topMatch = data.matches[0];
        setMatchedVerse(topMatch);
        console.log('✅ [Voice Detector] Found match:', topMatch);

        // Auto-navigate if confidence is high enough and enabled
        if (autoNavigate && topMatch.confidence >= 0.75) {
          console.log('🚀 [Voice Detector] High confidence match! Auto-navigating...');

          // Stop listening
          stopListening();

          // Show navigating state
          setIsNavigating(true);

          // Small delay for visual feedback
          setTimeout(() => {
            navigateToVerse(topMatch);
          }, 500);
        }
      } else {
        // Only show error if not auto-navigating (wait for more speech)
        if (!autoNavigate) {
          setErrorMessage('No matching verse found. Please try speaking more clearly or try a different verse.');
        }
        console.log('❌ [Voice Detector] No matches found');
      }
    } catch (error) {
      console.error('❌ [Voice Detector] Search error:', error);
      if (!autoNavigate) {
        setErrorMessage('Failed to search for verse. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Navigate to the matched verse
  const navigateToVerse = (verse?: VerseMatch) => {
    const targetVerse = verse || matchedVerse;
    if (!targetVerse) return;

    console.log(`🚀 [Voice Detector] Navigating to verse ${targetVerse.verseKey}`);

    // Navigate to memorize page with the surah
    router.push(`/memorize/surah/${targetVerse.surahNumber}?verse=${targetVerse.verseNumber}`);

    // Close the modal
    setIsOpen(false);
    setTranscript('');
    setMatchedVerse(null);
    setIsNavigating(false);
  };

  // Reset state
  const handleClose = () => {
    stopListening();

    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    setIsOpen(false);
    setTranscript('');
    setMatchedVerse(null);
    setErrorMessage('');
    setIsNavigating(false);
    lastSearchQueryRef.current = '';
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          title="Find verse by voice"
        >
          <Search className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Find Verse by Voice
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
                  </div>
                )}

                {/* Instructions */}
                {!isListening && !matchedVerse && !isSearching && !isNavigating && (
                  <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Click the microphone and start reciting any verse. As you speak,
                      we'll search in real-time and automatically take you to the verse
                      when we find a confident match!
                    </p>
                  </div>
                )}

                {/* Transcript */}
                {transcript && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You said:</p>
                    <p className="text-lg font-['Amiri'] text-gray-900 dark:text-white" dir="rtl">
                      {transcript}
                    </p>
                  </div>
                )}

                {/* Searching Indicator */}
                {isSearching && !matchedVerse && (
                  <div className="mb-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
                      <p className="text-sm text-purple-900 dark:text-purple-100">
                        Searching for verse...
                      </p>
                    </div>
                  </div>
                )}

                {/* Real-time Match Preview (Low confidence) */}
                {isListening && matchedVerse && matchedVerse.confidence < 0.75 && !isNavigating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Possible match ({Math.round(matchedVerse.confidence * 100)}%)
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                          Keep speaking for better accuracy...
                        </p>
                        <p className="text-sm font-['Amiri'] text-gray-900 dark:text-white" dir="rtl">
                          {matchedVerse.text.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Matched Verse (High confidence or stopped listening) */}
                {matchedVerse && (!isListening || matchedVerse.confidence >= 0.75 || isNavigating) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-4 rounded-lg border ${
                      isNavigating
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {isNavigating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 mt-1" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-semibold mb-1 ${
                          isNavigating
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-green-900 dark:text-green-100'
                        }`}>
                          {isNavigating
                            ? 'Navigating to verse...'
                            : `Match Found! (${Math.round(matchedVerse.confidence * 100)}% confidence)`}
                        </p>
                        <p className={`text-xs mb-2 ${
                          isNavigating
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          Surah {matchedVerse.surahNumber}, Verse {matchedVerse.verseNumber}
                        </p>
                        <p className="text-lg font-['Amiri'] text-gray-900 dark:text-white" dir="rtl">
                          {matchedVerse.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isNavigating ? (
                    <Button
                      disabled
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Navigating...
                    </Button>
                  ) : matchedVerse ? (
                    <>
                      <Button
                        onClick={() => navigateToVerse()}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        Go to Verse
                      </Button>
                      <Button
                        onClick={() => {
                          setMatchedVerse(null);
                          setTranscript('');
                          setErrorMessage('');
                          lastSearchQueryRef.current = '';
                        }}
                        variant="outline"
                      >
                        Try Again
                      </Button>
                    </>
                  ) : (
                    <>
                      {!isListening ? (
                        <Button
                          onClick={startListening}
                          disabled={!isSupported || isSearching}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          Start Listening
                        </Button>
                      ) : (
                        <Button
                          onClick={stopListening}
                          variant="destructive"
                          className="flex-1"
                        >
                          <MicOff className="w-5 h-5 mr-2" />
                          Stop
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Status indicator during listening */}
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-400"
                    />
                    <span className="text-sm font-medium">Listening...</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
