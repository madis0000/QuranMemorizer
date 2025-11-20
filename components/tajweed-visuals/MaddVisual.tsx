'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaddVisualProps {
  expectedCounts: 2 | 4 | 6;
  actualDuration: number; // milliseconds
  accuracy: number; // 0-1
  isActive: boolean;
  colorCode?: string; // Rule color from Tajweed map
}

/**
 * Madd (Elongation) Visual Effect
 * Shows an elastic stretching bar that grows with voice duration
 * with particle trails and target markers
 */
export function MaddVisual({ expectedCounts, actualDuration, accuracy, isActive, colorCode = '#d500b7' }: MaddVisualProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const expectedMs = expectedCounts * 500;
  const progress = Math.min(1, actualDuration / expectedMs);

  // Use the rule's color from Tajweed map (madd is typically magenta/red)
  const color = colorCode;

  // Generate particles when active
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      setParticles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: progress * 100,
          y: Math.random() * 100,
        },
      ]);

      // Remove old particles
      setParticles((prev) => prev.slice(-20));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, progress]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Main visualization */}
      <div className="relative w-[80%] max-w-2xl">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h3 className="text-3xl font-bold text-white mb-2">
            مد - Madd
          </h3>
          <p className="text-white/80 text-lg">
            {expectedCounts} counts ({expectedMs}ms)
          </p>
        </motion.div>

        {/* Elongation bar container */}
        <div className="relative h-24 bg-white/10 rounded-full backdrop-blur-md border-2 border-white/30 overflow-hidden">
          {/* Target markers */}
          {[2, 4, 6].map((count) => (
            <div
              key={count}
              className="absolute top-0 bottom-0 w-1 bg-white/40"
              style={{ left: `${(count / 6) * 100}%` }}
            >
              {count === expectedCounts && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-gray-900"
                >
                  {count}
                </motion.div>
              )}
            </div>
          ))}

          {/* Expanding bar */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
              boxShadow: `0 0 30px ${color}`,
            }}
            animate={{
              boxShadow: [
                `0 0 20px ${color}`,
                `0 0 40px ${color}`,
                `0 0 20px ${color}`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 1 }}
          />

          {/* Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  backgroundColor: color,
                }}
              />
            ))}
          </AnimatePresence>

          {/* Glow effect at the tip */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
            style={{
              left: `${progress * 100}%`,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        </div>

        {/* Duration display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 text-white text-xl font-mono"
        >
          {(actualDuration / 1000).toFixed(2)}s
        </motion.div>

        {/* Detailed Accuracy Feedback */}
        {accuracy > 0 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center mt-6 space-y-3"
          >
            {/* Main feedback badge */}
            <div
              className="inline-block px-6 py-3 rounded-full font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: color }}
            >
              {accuracy >= 0.9 && '⭐ ممتاز! Perfect Madd!'}
              {accuracy >= 0.75 && accuracy < 0.9 && '✓ جيد! Good Madd!'}
              {accuracy >= 0.6 && accuracy < 0.75 && '→ Needs Improvement'}
              {accuracy < 0.6 && '✗ Incorrect Duration'}
            </div>

            {/* Specific feedback based on duration */}
            <div className="max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-white border border-white/20">
                {(() => {
                  const diff = actualDuration - expectedMs;
                  const diffPercent = Math.abs((diff / expectedMs) * 100);

                  if (accuracy >= 0.9) {
                    return (
                      <p className="text-sm">
                        <span className="text-green-400 font-bold">✓ Excellent!</span> You held the Madd for exactly {expectedCounts} counts ({(actualDuration / 1000).toFixed(2)}s)
                      </p>
                    );
                  } else if (diff > 0) {
                    // Too long
                    return (
                      <div className="text-sm space-y-2">
                        <p>
                          <span className="text-yellow-400 font-bold">⚠ Too Long:</span> You held for {(actualDuration / 1000).toFixed(2)}s, but should be ~{(expectedMs / 1000).toFixed(2)}s
                        </p>
                        <p className="text-white/70">
                          💡 <strong>Tip:</strong> Reduce the elongation by {diffPercent.toFixed(0)}%. Count "{expectedCounts}" beats mentally while pronouncing.
                        </p>
                      </div>
                    );
                  } else {
                    // Too short
                    return (
                      <div className="text-sm space-y-2">
                        <p>
                          <span className="text-orange-400 font-bold">⚠ Too Short:</span> You held for {(actualDuration / 1000).toFixed(2)}s, but should be ~{(expectedMs / 1000).toFixed(2)}s
                        </p>
                        <p className="text-white/70">
                          💡 <strong>Tip:</strong> Hold the sound {diffPercent.toFixed(0)}% longer. Count "{expectedCounts}" beats: {Array(expectedCounts).fill('١').join(' - ')}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Visual duration comparison */}
            <div className="flex items-center justify-center gap-4 text-sm text-white/80">
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">Your Duration</div>
                <div className="font-mono font-bold" style={{ color }}>{(actualDuration / 1000).toFixed(2)}s</div>
              </div>
              <div className="text-2xl text-white/40">→</div>
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">Expected</div>
                <div className="font-mono font-bold text-white">{(expectedMs / 1000).toFixed(2)}s</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
