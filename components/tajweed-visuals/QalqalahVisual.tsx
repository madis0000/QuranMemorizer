'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface QalqalahVisualProps {
  accuracy: number; // 0-1
  isActive: boolean;
  letterText: string;
  colorCode?: string; // Rule color from Tajweed map
}

/**
 * Qalqalah (Echo/Bounce) Visual Effect
 * Shows explosive ripple waves emanating from the letter
 * with bounce physics and vibration effects
 */
export function QalqalahVisual({ accuracy, isActive, letterText, colorCode = '#0088ff' }: QalqalahVisualProps) {
  if (!isActive) return null;

  // Use the rule's color from Tajweed map (qalqalah is typically blue)
  const color = colorCode;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
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
            قلقلة - Qalqalah
          </h3>
          <p className="text-white/80 text-lg">Echo & Bounce</p>
        </motion.div>

        {/* Concentric ripples */}
        {[1, 2, 3, 4, 5].map((ring, index) => (
          <motion.div
            key={ring}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 3 + index * 0.5],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: index * 0.15,
              ease: 'easeOut',
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
            style={{
              width: '200px',
              height: '200px',
              borderColor: color,
              boxShadow: `0 0 30px ${color}`,
            }}
          />
        ))}

        {/* Central letter with bounce */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1.3, 1],
            rotate: [0, -5, 5, -5, 0],
          }}
          transition={{
            scale: { duration: 0.6, ease: 'easeOut' },
            rotate: { duration: 0.8, ease: 'easeInOut' },
          }}
          className="relative z-10"
        >
          {/* Glow background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ backgroundColor: color }}
          />

          {/* Letter */}
          <div
            className="relative w-48 h-48 rounded-full flex items-center justify-center border-4 shadow-2xl"
            style={{
              backgroundColor: `${color}22`,
              borderColor: color,
              boxShadow: `0 0 50px ${color}, inset 0 0 30px ${color}44`,
            }}
          >
            <motion.span
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                ease: 'easeInOut',
              }}
              className="text-7xl font-bold text-white"
              style={{
                textShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
              }}
            >
              {letterText || 'ق'}
            </motion.span>
          </div>
        </motion.div>

        {/* Explosive particles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          const distance = 150;
          const x = Math.cos((angle * Math.PI) / 180) * distance;
          const y = Math.sin((angle * Math.PI) / 180) * distance;

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: [0, x],
                y: [0, y],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: 'easeOut',
              }}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          );
        })}

        {/* Detailed Accuracy Feedback */}
        {accuracy > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-40 left-1/2 -translate-x-1/2 text-center w-96"
          >
            {/* Main feedback badge */}
            <div
              className="inline-block px-6 py-3 rounded-full font-bold text-white text-lg shadow-lg mb-3"
              style={{ backgroundColor: color }}
            >
              {accuracy >= 0.9 && '⭐ ممتاز! Perfect Qalqalah!'}
              {accuracy >= 0.75 && accuracy < 0.9 && '✓ جيد! Good Bounce!'}
              {accuracy >= 0.6 && accuracy < 0.75 && '→ Needs Improvement'}
              {accuracy < 0.6 && '✗ Weak Echo'}
            </div>

            {/* Specific feedback */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white border border-white/20 text-sm">
              {accuracy >= 0.9 ? (
                <p>
                  <span className="text-green-400 font-bold">✓ Excellent!</span> Strong bouncing sound with proper intensity.
                </p>
              ) : accuracy >= 0.75 ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-blue-400 font-bold">Good attempt!</span> The echo is present but could be stronger.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Pronounce with a sharp, quick bounce - imagine the letter bouncing off your tongue!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-orange-400 font-bold">⚠ Too Weak:</span> The Qalqalah echo was barely audible.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Stop the sound abruptly at the letter ({letterText}), creating a strong bouncing effect like a drumbeat: بَ بَ بَ
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
