'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTajweedAudioAnalysis } from '@/hooks/useTajweedAudioAnalysis';
import { TajweedFeedbackToast, TajweedFeedback } from './TajweedFeedbackToast';
import { extractTajweedRules, detectQalqalahInText, detectTajweedRule } from '@/lib/tajweedRuleDetector';
import { useUIStore } from '@/store/useUIStore';

interface TajweedAssistantProps {
  isEnabled: boolean;
  currentWordIndex: number;
  currentWord: {
    text: string;
    html?: string;
    isRevealed?: boolean;
  } | null;
  mediaStream: MediaStream | null;
  isRecognizing: boolean;
}

/**
 * Tajweed Assistant Component
 * Analyzes user pronunciation in real-time and displays
 * beautiful visual feedback for each Tajweed rule
 */
export function TajweedAssistant({
  isEnabled,
  currentWordIndex,
  currentWord,
  mediaStream,
  isRecognizing,
}: TajweedAssistantProps) {
  const [feedbackQueue, setFeedbackQueue] = useState<TajweedFeedback[]>([]);
  const [dismissTimers, setDismissTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const { enabledTajweedRules } = useUIStore();

  // Extract Tajweed rule from current word and get the original class name
  const extractedData = useMemo(() => {
    console.log('🔍 [Extract] Processing currentWord:', currentWord ? { text: currentWord.text, hasHtml: !!currentWord.html } : null);

    if (!currentWord?.html) {
      console.log('⚠️ [Extract] No HTML found in currentWord');
      return { rule: null, className: undefined };
    }

    // Extract ALL tajweed rules from the word
    const allRules = extractTajweedRules(currentWord.html);
    console.log('🔍 [Extract] All tajweed rules found:', allRules.map(r => r.rule?.type));

    // Priority order: Madd > Qalqalah > Ikhfa > Idgham > Iqlab > Ghunnah > Sukun
    const priorityOrder: Record<string, number> = {
      'madd': 10,
      'qalqalah': 9,
      'ikhfa': 8,
      'idgham': 7,
      'iqlab': 6,
      'ghunnah': 5,
      'sukun': 1,
      'normal': 0,
    };

    // Find the highest priority rule
    let bestRule: typeof allRules[0] | null = null;
    let highestPriority = -1;

    for (const ruleData of allRules) {
      if (!ruleData.rule) continue;

      const visualType = ruleData.rule.visualType;
      const priority = priorityOrder[visualType] || 0;

      if (priority > highestPriority) {
        highestPriority = priority;
        bestRule = ruleData;
      }
    }

    let rule = bestRule?.rule || null;

    // Extract the class name from the selected rule
    let className: string | undefined = undefined;
    if (bestRule && currentWord.html) {
      // Find the actual class name in the HTML that corresponds to this rule
      const regex = /<tajweed\s+class=["']?([^"'\s>]+)["']?[^>]*>/gi;
      let match;
      while ((match = regex.exec(currentWord.html)) !== null) {
        const foundClassName = match[1];
        const foundRule = detectTajweedRule(foundClassName);
        if (foundRule && foundRule.type === bestRule.rule?.type) {
          className = foundClassName;
          break;
        }
      }
    }

    console.log('🔍 [Extract] Best rule selected:', rule ? `${rule.type} (${rule.visualType})` : 'null');

    // Client-side detection: Check for qalqalah if no API markup found
    if (!rule && currentWord?.text) {
      console.log('🔍 [Extract] No API markup found, checking for qalqalah in text:', currentWord.text);
      const qalqalahRule = detectQalqalahInText(currentWord.text);
      if (qalqalahRule) {
        console.log('✅ [Extract] Client-side qalqalah detected!');
        rule = qalqalahRule;
        className = 'qalqalah';
      }
    }

    console.log('✅ [Extract] Final extracted data:', { rule: rule?.type, visualType: rule?.visualType, className });
    return { rule, className };
  }, [currentWord?.html, currentWord?.text]);

  const currentTajweedRule = extractedData.rule;

  // Memoize the word data object to prevent infinite re-renders
  const memoizedWordData = useMemo(() => {
    if (!currentWord) return null;
    return {
      text: currentWord.text,
      tajweedClass: extractedData.className, // Use original class name, not type
    };
  }, [currentWord?.text, extractedData.className]);

  // Tajweed rule detection is handled silently for performance

  // Initialize audio analysis
  const {
    currentRule,
    analysis,
    isAnalyzing,
    realTimeMetrics,
    initialize,
    startAnalysis,
    stopAnalysis,
    reset,
  } = useTajweedAudioAnalysis(isEnabled, memoizedWordData);

  // Initialize analyzer when media stream is available
  useEffect(() => {
    if (mediaStream && isEnabled) {
      initialize(mediaStream);
    }
  }, [mediaStream, isEnabled, initialize]);

  // Start analysis when recognition starts on a Tajweed word
  useEffect(() => {
    console.log('🎙️ [Tajweed Assistant] Recognition state changed:', {
      isRecognizing,
      isEnabled,
      hasTajweedRule: !!currentTajweedRule,
      currentTajweedRule: currentTajweedRule ? currentTajweedRule.type : null,
      memoizedWordData
    });

    // Check if this specific rule type is enabled in settings
    const isRuleEnabled = currentTajweedRule?.visualType &&
      currentTajweedRule.visualType !== 'sukun' &&
      currentTajweedRule.visualType !== 'normal' &&
      enabledTajweedRules[currentTajweedRule.visualType];

    if (isRecognizing && isEnabled && currentTajweedRule && isRuleEnabled) {
      console.log('✅ [Tajweed Assistant] Conditions met - calling startAnalysis()');
      startAnalysis();
    } else {
      console.log('❌ [Tajweed Assistant] Conditions NOT met:', {
        needsRecognizing: !isRecognizing,
        needsEnabled: !isEnabled,
        needsTajweedRule: !currentTajweedRule,
        needsRuleEnabled: !isRuleEnabled
      });
    }
  }, [isRecognizing, isEnabled, currentTajweedRule, startAnalysis, memoizedWordData, enabledTajweedRules]);

  // Stop analysis when recognition stops
  useEffect(() => {
    console.log('🔍 [Debug STOP Effect] Effect running:', {
      isRecognizing,
      isAnalyzing,
      hasCurrentRule: !!currentRule,
      condition: !isRecognizing && isAnalyzing
    });

    if (!isRecognizing && isAnalyzing) {
      console.log('🛑 [Tajweed] Stopping analysis...');
      const result = stopAnalysis();
      console.log('📊 [Tajweed] Result:', result);
      console.log('📌 [Tajweed] Current rule:', currentRule);

      if (result && currentRule) {
        console.log('✅ [Tajweed] Calling addFeedbackNotification with:', {
          visualType: currentRule.visualType,
          accuracy: result.accuracy,
        });
        addFeedbackNotification(currentRule.visualType, result, currentRule);
      } else {
        console.warn('⚠️ [Tajweed] Missing result or rule!', {
          hasResult: !!result,
          hasRule: !!currentRule,
        });
      }
    }
  }, [isRecognizing, isAnalyzing, currentRule, stopAnalysis]);

  // Reset when word changes - but stop analysis first if needed
  const prevWordIndexRef = useRef(currentWordIndex);

  useEffect(() => {
    const wordChanged = prevWordIndexRef.current !== currentWordIndex;

    // Check if we're about to start analysis on this new word
    const isRuleEnabled = currentTajweedRule?.visualType &&
      currentTajweedRule.visualType !== 'sukun' &&
      currentTajweedRule.visualType !== 'normal' &&
      enabledTajweedRules[currentTajweedRule.visualType];
    const willStartAnalysis = isRecognizing && isEnabled && currentTajweedRule && isRuleEnabled;

    console.log('🔄 [Reset Effect] Running with:', {
      currentWordIndex,
      prevWordIndex: prevWordIndexRef.current,
      wordChanged,
      isAnalyzing,
      willStartAnalysis,
      hasCurrentRule: !!currentRule,
      currentRuleType: currentRule?.type
    });

    // Only stop analysis if the WORD changed while analyzing
    if (wordChanged && isAnalyzing) {
      console.log('🔄 [Tajweed] Word changed while analyzing - stopping first');
      const result = stopAnalysis();
      console.log('🔄 [Tajweed] stopAnalysis returned:', result);
      if (result && currentRule) {
        console.log('✅ [Tajweed] Auto-stopped due to word change, adding feedback');
        addFeedbackNotification(currentRule.visualType, result, currentRule);
      } else {
        console.warn('⚠️ [Tajweed] Cannot add feedback:', { hasResult: !!result, hasCurrentRule: !!currentRule });
      }
    } else if (!wordChanged) {
      console.log('ℹ️ [Reset Effect] Word did NOT change, skipping reset (dependency update only)');
    } else {
      console.log('ℹ️ [Reset Effect] Word changed but isAnalyzing is FALSE');
    }

    // Only reset when word actually changes AND we're NOT about to start analysis
    if (wordChanged) {
      if (willStartAnalysis) {
        console.log('🔄 [Reset Effect] NOT resetting - about to start analysis on new word');
        prevWordIndexRef.current = currentWordIndex;
      } else {
        console.log('🔄 [Reset Effect] Calling reset() because word changed (no analysis will start)');
        reset();
        prevWordIndexRef.current = currentWordIndex;
      }
    }
  }, [currentWordIndex, reset, isAnalyzing, currentRule, stopAnalysis, isRecognizing, isEnabled, currentTajweedRule, enabledTajweedRules]);

  /**
   * Add feedback notification to the queue
   */
  const addFeedbackNotification = (
    type: 'madd' | 'qalqalah' | 'ikhfa' | 'idgham' | 'iqlab' | 'ghunnah' | 'sukun' | 'normal',
    analysisResult: any,
    rule: any
  ) => {
    console.log('🔔 [Tajweed] addFeedbackNotification called:', { type, accuracy: analysisResult.accuracy });
    console.log('📋 [Tajweed] Current enabledTajweedRules:', enabledTajweedRules);
    console.log('🔍 [Tajweed] Checking if type', type, 'is enabled:', enabledTajweedRules[type]);

    if (type === 'sukun' || type === 'normal') {
      console.log('⏭️ [Tajweed] Skipping sukun/normal');
      return; // Skip visualization for these
    }

    // Check if this rule type is enabled
    if (!enabledTajweedRules[type]) {
      console.log(`🚫 [Tajweed] Rule ${type} is disabled, skipping notification`);
      console.log(`🚫 [Tajweed] enabledTajweedRules[${type}] =`, enabledTajweedRules[type]);
      return;
    }

    console.log(`✅ [Tajweed] Rule ${type} is enabled, creating notification`);

    const feedbackId = `${Date.now()}-${Math.random()}`;

    const newFeedback: TajweedFeedback = {
      id: feedbackId,
      type,
      ruleName: rule.name,
      arabicName: rule.arabicName,
      accuracy: analysisResult.accuracy,
      colorCode: rule.colorCode,
      details: {
        expectedCounts: type === 'madd' ? (rule.type === 'madd_2' ? 2 : rule.type === 'madd_4' ? 4 : 6) : undefined,
        actualDuration: analysisResult.actualDuration,
        letterText: currentWord?.text,
      },
    };

    console.log('✅ [Tajweed] Creating notification:', newFeedback);
    setFeedbackQueue(prev => {
      const newQueue = [...prev, newFeedback];
      console.log('📋 [Tajweed] Queue updated, length:', newQueue.length);
      return newQueue;
    });

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => {
      dismissFeedback(feedbackId);
    }, 5000);

    setDismissTimers(prev => {
      const newMap = new Map(prev);
      newMap.set(feedbackId, timeout);
      return newMap;
    });
  };

  /**
   * Dismiss a feedback notification
   */
  const dismissFeedback = (id: string) => {
    setFeedbackQueue(prev => prev.filter(f => f.id !== id));

    // Clear timeout
    const timer = dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      setDismissTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  };

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      dismissTimers.forEach(timer => clearTimeout(timer));
    };
  }, [dismissTimers]);

  if (!isEnabled) return null;

  // Check if current rule is enabled in settings
  const shouldShowIndicator = currentTajweedRule &&
    currentTajweedRule.visualType !== 'sukun' &&
    currentTajweedRule.visualType !== 'normal' &&
    enabledTajweedRules[currentTajweedRule.visualType];

  return (
    <>
      {/* Persistent Tajweed Rule Indicator */}
      {shouldShowIndicator && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-24 right-4 z-40 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/30 p-6 max-w-xs"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: currentTajweedRule.colorCode + '33',
                border: `2px solid ${currentTajweedRule.colorCode}`,
                boxShadow: `0 0 20px ${currentTajweedRule.colorCode}66`
              }}
            >
              <span className="text-2xl">
                {currentTajweedRule.visualType === 'madd' && '━'}
                {currentTajweedRule.visualType === 'qalqalah' && '◉'}
                {currentTajweedRule.visualType === 'ikhfa' && '≋'}
                {currentTajweedRule.visualType === 'idgham' && '⊕'}
                {currentTajweedRule.visualType === 'iqlab' && '⇄'}
                {currentTajweedRule.visualType === 'ghunnah' && '∼'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg leading-tight">
                {currentTajweedRule.arabicName}
              </h3>
              <p className="text-purple-200 text-sm">{currentTajweedRule.name}</p>
            </div>
          </div>

          {/* Current Word Being Analyzed */}
          {currentWord?.text && (
            <div className="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
              <p className="text-white/60 text-xs mb-2">Analyzing Word</p>
              <p className="text-white font-arabic text-2xl text-center leading-relaxed" dir="rtl">
                {currentWord.text}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <p className="text-white/80 text-sm leading-relaxed">
              {currentTajweedRule.description}
            </p>
          </div>

          {/* Expected Duration (for Madd rules) */}
          {currentTajweedRule.visualType === 'madd' && (
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3 mb-3">
              <div className="flex-1">
                <p className="text-white/60 text-xs mb-1">Expected Duration</p>
                <div className="flex items-center gap-2">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: currentTajweedRule.colorCode }}
                  >
                    {currentTajweedRule.type === 'madd_2' ? '2' :
                     currentTajweedRule.type === 'madd_4' ? '4' : '6'}
                  </div>
                  <span className="text-white/60 text-sm">counts</span>
                </div>
              </div>
              <div className="text-white/40">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <motion.circle
                    cx="20" cy="20" r="18"
                    fill="none"
                    stroke={currentTajweedRule.colorCode}
                    strokeWidth="2"
                    strokeDasharray="113"
                    strokeDashoffset="113"
                    animate={{ strokeDashoffset: isRecognizing ? 0 : 113 }}
                    transition={{ duration: currentTajweedRule.expectedDuration ? currentTajweedRule.expectedDuration / 1000 : 1 }}
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Speaking Status */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${isRecognizing ? 'bg-green-400' : 'bg-gray-400'}`}
              style={isRecognizing ? { boxShadow: '0 0 10px #4ade80' } : {}}
            />
            <span className="text-white/60">
              {isRecognizing ? 'Listening...' : 'Press Space to speak'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Toast Notifications for Feedback */}
      <TajweedFeedbackToast feedbacks={feedbackQueue} onDismiss={dismissFeedback} />
    </>
  );
}
