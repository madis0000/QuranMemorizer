/**
 * Audio Analysis Utilities for Tajweed Assistant
 * Analyzes voice input to detect Tajweed rule characteristics
 */

export interface AudioMetrics {
  duration: number; // milliseconds
  volume: number; // 0-1
  pitch: number; // Hz
  nasality: number; // 0-1
  clarity: number; // 0-1
  intensity: number; // 0-1
}

export interface TajweedAnalysis {
  ruleType: TajweedRuleType;
  expectedDuration?: number; // For Madd
  actualDuration: number;
  accuracy: number; // 0-1
  metrics: AudioMetrics;
}

export type TajweedRuleType =
  | 'madd_2'
  | 'madd_4'
  | 'madd_6'
  | 'madd_obligatory'
  | 'qalqalah'
  | 'ikhfa'
  | 'idgham'
  | 'iqlab'
  | 'ghunnah'
  | 'sukun'
  | 'normal';

/**
 * Analyzes audio stream to extract metrics for Tajweed validation
 */
export class TajweedAudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private startTime: number = 0;
  private isRecording: boolean = false;
  private volumeHistory: number[] = [];
  private pitchDetector: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Initialize analyzer with audio stream
   */
  async initialize(stream: MediaStream): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    source.connect(this.analyser);
  }

  /**
   * Start recording audio metrics
   */
  startRecording(): void {
    this.startTime = Date.now();
    this.isRecording = true;
    this.volumeHistory = [];
  }

  /**
   * Stop recording and return metrics
   */
  stopRecording(): AudioMetrics {
    this.isRecording = false;
    const duration = Date.now() - this.startTime;

    return {
      duration,
      volume: this.getAverageVolume(),
      pitch: this.getCurrentPitch(),
      nasality: this.detectNasality(),
      clarity: this.detectClarity(),
      intensity: this.getIntensity(),
    };
  }

  /**
   * Get real-time audio metrics (for live visualization)
   */
  getRealTimeMetrics(): Partial<AudioMetrics> {
    return {
      volume: this.getCurrentVolume(),
      pitch: this.getCurrentPitch(),
      intensity: this.getIntensity(),
    };
  }

  /**
   * Analyze for Madd (elongation) - measures duration and sustained sound
   */
  analyzeMadd(expectedCounts: 2 | 4 | 6, actualDuration: number, audioMetrics: AudioMetrics): TajweedAnalysis {
    // Each count is approximately 350-450ms in natural recitation
    const countDuration = 400; // Base duration per count
    const expectedMs = expectedCounts * countDuration;

    // Very lenient tolerance - madd timing can vary significantly
    const tolerance = expectedMs * 0.5; // 50% tolerance (e.g., ±400ms for 2 counts)

    // Duration scoring with Gaussian curve
    const difference = Math.abs(actualDuration - expectedMs);
    const normalizedDiff = difference / tolerance;
    const durationScore = Math.exp(-Math.pow(normalizedDiff * 0.8, 2)); // 0.8 makes it more lenient

    // Volume should be sustained and moderate (not loud, not quiet)
    const volumeScore = Math.min(1, audioMetrics.volume * 2.5);

    // Clarity indicates clean elongation
    const clarityScore = audioMetrics.clarity;

    // Smoothness is KEY for madd - should be steady, sustained sound
    const smoothnessScore = this.detectSmoothness();

    // Madd should NOT have high pitch variation (steady tone)
    const steadinessBonus = smoothnessScore > 0.6 ? 0.2 : 0;

    // Weighted combination favoring smoothness and duration
    // Madd is all about sustained, smooth elongation
    const accuracy = (
      durationScore * 0.35 +      // Duration is important but not everything
      volumeScore * 0.25 +         // Must have sustained volume
      smoothnessScore * 0.30 +     // Smoothness is critical for elongation
      clarityScore * 0.10          // Some clarity helps
    ) + steadinessBonus;           // Bonus for very smooth pronunciation

    console.log('📊 [Madd Analysis]', {
      expectedCounts,
      expectedMs,
      actualDuration,
      difference,
      durationScore: durationScore.toFixed(2),
      volumeScore: volumeScore.toFixed(2),
      smoothnessScore: smoothnessScore.toFixed(2),
      clarityScore: clarityScore.toFixed(2),
      steadinessBonus: steadinessBonus.toFixed(2),
      accuracy: Math.min(1, accuracy).toFixed(2),
      rawVolume: audioMetrics.volume.toFixed(3),
      rawClarity: audioMetrics.clarity.toFixed(3)
    });

    return {
      ruleType: `madd_${expectedCounts}` as TajweedRuleType,
      expectedDuration: expectedMs,
      actualDuration,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      metrics: audioMetrics,
    };
  }

  /**
   * Analyze for Qalqalah (echo/bounce) - measures sudden intensity
   */
  analyzeQalqalah(audioMetrics: AudioMetrics): TajweedAnalysis {
    // Qalqalah requires short, sharp pronunciation with bouncing quality
    // Duration: typically 200-600ms (allow wider range)
    const idealDuration = 400; // ~400ms (more realistic)
    const minDuration = 150;
    const maxDuration = 800;

    // Gaussian scoring for duration (smoother falloff)
    let durationScore = 0;
    if (audioMetrics.duration >= minDuration && audioMetrics.duration <= maxDuration) {
      const normalizedDiff = Math.abs(audioMetrics.duration - idealDuration) / idealDuration;
      durationScore = Math.exp(-Math.pow(normalizedDiff * 1.5, 2)); // 1.5 factor for moderate strictness
    } else {
      // Very poor if outside range
      durationScore = 0.2;
    }

    // Intensity/sharpness is key for qalqalah (the "bounce")
    // Boost volume and clarity contributions
    const volumeScore = Math.min(1, audioMetrics.volume * 2.5);
    const clarityScore = audioMetrics.clarity;
    const intensityScore = (volumeScore * 0.6 + clarityScore * 0.4);

    // Qalqalah should NOT be nasal (unlike ghunnah/ikhfa)
    const nonNasalBonus = Math.max(0, 1 - audioMetrics.nasality);

    // Weighted combination: intensity is most important, then duration
    const accuracy = (
      intensityScore * 0.5 +
      durationScore * 0.3 +
      nonNasalBonus * 0.2
    );

    console.log('📊 [Qalqalah Analysis]', {
      duration: audioMetrics.duration,
      durationScore: durationScore.toFixed(2),
      volumeScore: volumeScore.toFixed(2),
      clarityScore: clarityScore.toFixed(2),
      intensityScore: intensityScore.toFixed(2),
      nonNasalBonus: nonNasalBonus.toFixed(2),
      accuracy: accuracy.toFixed(2)
    });

    return {
      ruleType: 'qalqalah',
      actualDuration: audioMetrics.duration,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      metrics: audioMetrics,
    };
  }

  /**
   * Analyze for Ikhfa (hiding) - measures nasality
   */
  analyzeIkhfa(audioMetrics: AudioMetrics): TajweedAnalysis {
    // Ikhfa requires strong nasal quality with gentle, concealed pronunciation
    // Boost nasality detection (might be subtle in recording)
    const nasalityScore = Math.min(1, audioMetrics.nasality * 2);

    // Should be moderate volume (not silent, not loud)
    const targetIntensity = 0.4;
    const intensityDiff = Math.abs(audioMetrics.intensity - targetIntensity);
    const intensityScore = Math.max(0, 1 - intensityDiff * 2);

    // Duration should be moderate (not too quick)
    const idealDuration = 500;
    const durationDiff = Math.abs(audioMetrics.duration - idealDuration) / idealDuration;
    const durationScore = Math.exp(-Math.pow(durationDiff, 2));

    // Weighted: nasality is most important for ikhfa
    const accuracy = (
      nasalityScore * 0.6 +
      intensityScore * 0.25 +
      durationScore * 0.15
    );

    console.log('📊 [Ikhfa Analysis]', {
      nasalityScore: nasalityScore.toFixed(2),
      intensityScore: intensityScore.toFixed(2),
      durationScore: durationScore.toFixed(2),
      accuracy: accuracy.toFixed(2)
    });

    return {
      ruleType: 'ikhfa',
      actualDuration: audioMetrics.duration,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      metrics: audioMetrics,
    };
  }

  /**
   * Analyze for Idgham (merging) - measures smooth transition
   */
  analyzeIdgham(audioMetrics: AudioMetrics): TajweedAnalysis {
    // Idgham requires smooth, flowing pronunciation with good merging
    const smoothnessScore = this.detectSmoothness();

    // Clarity indicates clean pronunciation
    const clarityScore = audioMetrics.clarity;

    // Volume should be consistent and moderate
    const volumeScore = Math.min(1, audioMetrics.volume * 2);

    // Duration should be moderate (blended sounds take time)
    const idealDuration = 600;
    const durationDiff = Math.abs(audioMetrics.duration - idealDuration) / idealDuration;
    const durationScore = Math.exp(-Math.pow(durationDiff * 0.8, 2)); // Lenient

    // Weighted combination
    const accuracy = (
      smoothnessScore * 0.4 +
      clarityScore * 0.3 +
      volumeScore * 0.2 +
      durationScore * 0.1
    );

    console.log('📊 [Idgham Analysis]', {
      smoothnessScore: smoothnessScore.toFixed(2),
      clarityScore: clarityScore.toFixed(2),
      volumeScore: volumeScore.toFixed(2),
      durationScore: durationScore.toFixed(2),
      accuracy: accuracy.toFixed(2)
    });

    return {
      ruleType: 'idgham',
      actualDuration: audioMetrics.duration,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      metrics: audioMetrics,
    };
  }

  /**
   * Analyze for Ghunnah (nasalization) - measures nasal resonance
   */
  analyzeGhunnah(audioMetrics: AudioMetrics): TajweedAnalysis {
    // Ghunnah requires strong nasality for 2 counts (~900ms)
    const expectedDuration = 900; // More realistic timing
    const tolerance = 250;

    // Gaussian scoring for duration
    const durationDiff = Math.abs(audioMetrics.duration - expectedDuration);
    const normalizedDiff = durationDiff / tolerance;
    const durationScore = Math.exp(-Math.pow(normalizedDiff, 2));

    // Nasality is the key characteristic of ghunnah
    // Boost detection as it might be subtle in recording
    const nasalityScore = Math.min(1, audioMetrics.nasality * 2.2);

    // Volume should be present (not silent)
    const volumeScore = Math.min(1, audioMetrics.volume * 2);

    // Weighted: nasality is most critical for ghunnah
    const accuracy = (
      nasalityScore * 0.6 +
      durationScore * 0.3 +
      volumeScore * 0.1
    );

    console.log('📊 [Ghunnah Analysis]', {
      duration: audioMetrics.duration,
      expectedDuration,
      durationScore: durationScore.toFixed(2),
      nasalityScore: nasalityScore.toFixed(2),
      volumeScore: volumeScore.toFixed(2),
      accuracy: accuracy.toFixed(2)
    });

    return {
      ruleType: 'ghunnah',
      expectedDuration,
      actualDuration: audioMetrics.duration,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      metrics: audioMetrics,
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private getCurrentVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteTimeDomainData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / this.dataArray.length);

    if (this.isRecording) {
      this.volumeHistory.push(rms);
    }

    return rms;
  }

  private getAverageVolume(): number {
    if (this.volumeHistory.length === 0) return 0;
    const sum = this.volumeHistory.reduce((a, b) => a + b, 0);
    return sum / this.volumeHistory.length;
  }

  private getCurrentPitch(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Simple pitch detection: find peak frequency
    let maxIndex = 0;
    let maxValue = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }

    // Convert bin index to frequency
    const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
    const frequency = (maxIndex * nyquist) / this.dataArray.length;

    return frequency;
  }

  private detectNasality(): number {
    // Nasal sounds have characteristic frequency patterns (200-500 Hz range)
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    const nasalRangeStart = Math.floor((200 / 22050) * this.dataArray.length);
    const nasalRangeEnd = Math.floor((500 / 22050) * this.dataArray.length);

    let nasalEnergy = 0;
    let totalEnergy = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const value = this.dataArray[i];
      totalEnergy += value;

      if (i >= nasalRangeStart && i <= nasalRangeEnd) {
        nasalEnergy += value;
      }
    }

    return totalEnergy > 0 ? nasalEnergy / totalEnergy : 0;
  }

  private detectClarity(): number {
    // Clarity based on frequency distribution sharpness
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    let peakValue = 0;
    let averageValue = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const value = this.dataArray[i];
      averageValue += value;
      if (value > peakValue) peakValue = value;
    }

    averageValue /= this.dataArray.length;

    // Higher peak-to-average ratio = clearer sound
    return averageValue > 0 ? Math.min(1, peakValue / (averageValue * 10)) : 0;
  }

  private getIntensity(): number {
    // Intensity is combination of volume and energy
    const volume = this.getCurrentVolume();
    const clarity = this.detectClarity();

    return (volume * 0.7 + clarity * 0.3);
  }

  private detectSmoothness(): number {
    // Smoothness based on volume consistency
    if (this.volumeHistory.length < 2) return 0.5;

    let variance = 0;
    const average = this.getAverageVolume();

    for (const volume of this.volumeHistory) {
      variance += Math.pow(volume - average, 2);
    }

    variance /= this.volumeHistory.length;

    // Lower variance = smoother
    return Math.max(0, 1 - variance * 5);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.volumeHistory = [];
  }
}
