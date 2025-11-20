'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GhunnahVisualProps {
  accuracy: number; // 0-1
  isActive: boolean;
  letterText: string;
  colorCode?: string; // Rule color from Tajweed map
}

/**
 * Ghunnah (Nasalization) Visual Effect
 * Shows resonance waves emanating like vocal cord vibrations
 * with harmonic frequency displays
 */
export function GhunnahVisual({ accuracy, isActive, letterText, colorCode = '#ff69b4' }: GhunnahVisualProps) {
  if (!isActive) return null;

  // Use the rule's color from Tajweed map (ghunnah is typically pink)
  const color = colorCode;

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
      <div className="relative">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-2">
            غنة - Ghunnah
          </h3>
          <p className="text-white/80 text-lg">Nasal Resonance - 2 Counts</p>
        </motion.div>

        {/* Sound waves emanating from center */}
        {[...Array(8)].map((_, i) => {
          const delay = i * 0.15;
          const scale = 1 + i * 0.3;

          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, scale],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
              style={{
                width: '200px',
                height: '200px',
                borderColor: color,
              }}
            />
          );
        })}

        {/* Central letter with vibration */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-48 h-48 rounded-full flex items-center justify-center border-4 shadow-2xl"
          style={{
            backgroundColor: `${color}33`,
            borderColor: color,
            boxShadow: `0 0 50px ${color}`,
          }}
        >
          {/* Pulsing glow */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ backgroundColor: color }}
          />

          <span
            className="relative text-7xl font-bold text-white"
            style={{ textShadow: `0 0 30px ${color}` }}
          >
            {letterText || 'ن'}
          </span>
        </motion.div>

        {/* Nasal cavity with vibration lines */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-52 left-1/2 -translate-x-1/2"
        >
          {/* Nose shape */}
          <svg width="120" height="150" viewBox="0 0 120 150" className="opacity-80">
            {/* Nose outline */}
            <motion.path
              d="M 60 30 Q 50 50, 45 70 Q 45 90, 50 110 L 50 130 M 60 30 Q 70 50, 75 70 Q 75 90, 70 110 L 70 130"
              stroke={color}
              strokeWidth="3"
              fill="none"
              opacity="0.7"
            />

            {/* Resonance waves inside */}
            {[...Array(5)].map((_, i) => (
              <motion.path
                key={i}
                d={`M ${40 + i * 5} ${60 + i * 10} Q 60 ${65 + i * 10}, ${80 - i * 5} ${60 + i * 10}`}
                stroke={color}
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Vibration particles flowing */}
            {[...Array(8)].map((_, i) => (
              <motion.circle
                key={i}
                r="3"
                fill={color}
                initial={{ cy: 120, opacity: 1 }}
                animate={{
                  cy: [120, 40],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.25,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                cx={i % 2 === 0 ? 50 : 70}
              />
            ))}
          </svg>
        </motion.div>

        {/* Harmonic frequency bars */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex gap-2 items-end">
          {[...Array(7)].map((_, i) => {
            const height = 30 + Math.sin(i * 0.8) * 40;

            return (
              <motion.div
                key={i}
                initial={{ height: 10 }}
                animate={{
                  height: [height, height * 1.5, height],
                }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-4 rounded-t-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            );
          })}
        </div>

        {/* Duration counter (2 counts = ~1000ms) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -right-32 top-1/2 -translate-y-1/2"
        >
          <div className="text-center">
            <div
              className="text-6xl font-bold mb-2"
              style={{ color }}
            >
              2
            </div>
            <div className="text-white text-sm">counts</div>
          </div>
        </motion.div>

        {/* Detailed Accuracy Feedback */}
        {accuracy > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-56 left-1/2 -translate-x-1/2 text-center w-96"
          >
            {/* Main feedback badge */}
            <div
              className="inline-block px-6 py-3 rounded-full font-bold text-white text-lg shadow-lg mb-3"
              style={{ backgroundColor: color }}
            >
              {accuracy >= 0.9 && '⭐ ممتاز! Perfect Ghunnah!'}
              {accuracy >= 0.75 && accuracy < 0.9 && '✓ جيد! Good Nasalization!'}
              {accuracy >= 0.6 && accuracy < 0.75 && '→ Needs Improvement'}
              {accuracy < 0.6 && '✗ Weak Nasal Resonance'}
            </div>

            {/* Specific feedback */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white border border-white/20 text-sm">
              {accuracy >= 0.9 ? (
                <p>
                  <span className="text-green-400 font-bold">✓ Excellent!</span> Perfect nasal resonance held for 2 counts!
                </p>
              ) : accuracy >= 0.75 ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-pink-400 font-bold">Good nasalization!</span> The resonance is there, but extend it slightly.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Hold the nasal hum for exactly 2 counts (~1 second). Feel the vibration in your nose!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-orange-400 font-bold">⚠ Too Weak:</span> The nasal sound needs more resonance and duration.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Close your mouth completely and let the sound resonate through your nose for 2 full counts: نّ (nnnn). Place your hand on your nose to feel the vibration!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
