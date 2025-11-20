/**
 * Hook for real-time Tajweed audio analysis
 * Detects Tajweed rules and provides accuracy feedback
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { TajweedAudioAnalyzer, TajweedAnalysis, AudioMetrics } from '@/lib/audioAnalysis';
import { detectTajweedRule, TajweedRuleInfo } from '@/lib/tajweedRuleDetector';

export interface TajweedAnalysisState {
  currentRule: TajweedRuleInfo | null;
  analysis: TajweedAnalysis | null;
  isAnalyzing: boolean;
  realTimeMetrics: Partial<AudioMetrics>;
}

export function useTajweedAudioAnalysis(
  isEnabled: boolean,
  currentWord: { text: string; tajweedClass?: string } | null
) {
  const [state, setState] = useState<TajweedAnalysisState>({
    currentRule: null,
    analysis: null,
    isAnalyzing: false,
    realTimeMetrics: {},
  });

  const analyzerRef = useRef<TajweedAudioAnalyzer | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const isAnalyzingRef = useRef<boolean>(false);

  /**
   * Initialize audio analyzer
   */
  const initialize = useCallback(async (stream: MediaStream) => {
    try {
      if (!analyzerRef.current) {
        analyzerRef.current = new TajweedAudioAnalyzer();
      }

      await analyzerRef.current.initialize(stream);
      mediaStreamRef.current = stream;
    } catch (error) {
      console.error('[Tajweed Audio] Initialization failed:', error);
    }
  }, []);

  /**
   * Start analyzing current word
   */
  const startAnalysis = useCallback(() => {
    console.log('🎯 [Audio Analysis] startAnalysis called');
    console.log('🔍 [Audio Analysis] Checks:', {
      hasAnalyzer: !!analyzerRef.current,
      hasCurrentWord: !!currentWord,
      isEnabled,
      currentWord: currentWord ? { text: currentWord.text, tajweedClass: currentWord.tajweedClass } : null
    });

    if (!analyzerRef.current) {
      console.warn('⚠️ [Audio Analysis] No analyzer reference');
      return;
    }
    if (!currentWord) {
      console.warn('⚠️ [Audio Analysis] No current word');
      return;
    }
    if (!isEnabled) {
      console.warn('⚠️ [Audio Analysis] Not enabled');
      return;
    }

    console.log('🔍 [Audio Analysis] Detecting Tajweed rule for class:', currentWord.tajweedClass);
    const rule = currentWord.tajweedClass
      ? detectTajweedRule(currentWord.tajweedClass)
      : null;

    console.log('🔍 [Audio Analysis] Detected rule:', rule);

    if (!rule) {
      console.warn('⚠️ [Audio Analysis] No Tajweed rule detected - skipping analysis');
      return; // Only analyze words with Tajweed rules
    }

    console.log('✅ [Audio Analysis] Starting recording for rule:', rule.type);

    analyzerRef.current.startRecording();
    recordingStartTimeRef.current = Date.now();
    isAnalyzingRef.current = true;

    setState((prev) => {
      const newState = {
        ...prev,
        currentRule: rule,
        isAnalyzing: true,
        analysis: null,
      };
      console.log('📝 [Hook State] Setting isAnalyzing to TRUE', { rule: rule.type, wordText: currentWord?.text });
      return newState;
    });

    // Start real-time metrics update loop
    const updateMetrics = () => {
      if (analyzerRef.current && isAnalyzingRef.current) {
        const metrics = analyzerRef.current.getRealTimeMetrics();
        setState((prev) => ({
          ...prev,
          realTimeMetrics: metrics,
        }));

        animationFrameRef.current = requestAnimationFrame(updateMetrics);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateMetrics);
  }, [currentWord, isEnabled]);

  /**
   * Stop analysis and calculate accuracy
   */
  const stopAnalysis = useCallback(() => {
    if (!analyzerRef.current || !state.currentRule || !state.isAnalyzing) return;

    isAnalyzingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const audioMetrics = analyzerRef.current.stopRecording();
    const actualDuration = Date.now() - recordingStartTimeRef.current;

    let analysis: TajweedAnalysis;

    // Analyze based on rule type
    switch (state.currentRule.visualType) {
      case 'madd':
        const expectedCounts = state.currentRule.type === 'madd_2' ? 2 :
                              state.currentRule.type === 'madd_4' ? 4 : 6;
        analysis = analyzerRef.current.analyzeMadd(expectedCounts, actualDuration, audioMetrics);
        break;

      case 'qalqalah':
        analysis = analyzerRef.current.analyzeQalqalah(audioMetrics);
        break;

      case 'ikhfa':
        analysis = analyzerRef.current.analyzeIkhfa(audioMetrics);
        break;

      case 'idgham':
        analysis = analyzerRef.current.analyzeIdgham(audioMetrics);
        break;

      case 'ghunnah':
        analysis = analyzerRef.current.analyzeGhunnah(audioMetrics);
        break;

      default:
        // Generic analysis
        analysis = {
          ruleType: state.currentRule.type,
          actualDuration,
          accuracy: 0.75, // Default neutral score
          metrics: audioMetrics,
        };
    }

    setState((prev) => {
      const newState = {
        ...prev,
        analysis,
        isAnalyzing: false,
      };
      console.log('📝 [Hook State] Setting isAnalyzing to FALSE (stopAnalysis)', { accuracy: analysis.accuracy });
      return newState;
    });

    console.log(`✓ [Tajweed Audio] Analysis complete:`, analysis);

    return analysis;
  }, [state.currentRule, state.isAnalyzing]);

  /**
   * Reset analysis state
   */
  const reset = useCallback(() => {
    console.log('📝 [Hook State] reset() called - setting isAnalyzing to FALSE');
    isAnalyzingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setState({
      currentRule: null,
      analysis: null,
      isAnalyzing: false,
      realTimeMetrics: {},
    });
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (analyzerRef.current) {
        analyzerRef.current.destroy();
        analyzerRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    startAnalysis,
    stopAnalysis,
    reset,
  };
}
