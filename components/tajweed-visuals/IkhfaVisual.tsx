'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface IkhfaVisualProps {
  accuracy: number; // 0-1
  isActive: boolean;
  letterText: string;
  colorCode?: string; // Rule color from Tajweed map
}

/**
 * Ikhfa (Hiding/Concealment) Visual Effect
 * Shows mystical mist and ghosting effects to represent
 * the "hidden" quality of Ikhfa pronunciation
 */
export function IkhfaVisual({ accuracy, isActive, letterText, colorCode = '#169777' }: IkhfaVisualProps) {
  if (!isActive) return null;

  // Use the rule's color from Tajweed map (ikhfa is typically green)
  const color = colorCode;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Main visualization */}
      <div className="relative">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-2">
            إخفاء - Ikhfa
          </h3>
          <p className="text-white/80 text-lg">Hiding with Nasalization</p>
        </motion.div>

        {/* Mist clouds */}
        {[...Array(8)].map((_, i) => {
          const delay = i * 0.2;
          const offset = (i % 2 === 0 ? 1 : -1) * (30 + i * 10);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5, x: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1.5, 2],
                x: [0, offset],
              }}
              transition={{
                duration: 3,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
              }}
            />
          );
        })}

        {/* Central letter with ghosting effect */}
        <div className="relative">
          {/* Ghost copies */}
          {[0, 1, 2, 3].map((ghost) => (
            <motion.div
              key={ghost}
              initial={{ opacity: 0.8 - ghost * 0.2 }}
              animate={{
                opacity: [0.8 - ghost * 0.2, 0],
                x: [0, (ghost + 1) * 15],
                y: [0, (ghost + 1) * 10],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: ghost * 0.3,
                ease: 'easeOut',
              }}
              className="absolute top-0 left-0 w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${color}22`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 30px ${color}44`,
              }}
            >
              <span
                className="text-7xl font-bold"
                style={{
                  color: `${color}`,
                  textShadow: `0 0 20px ${color}`,
                }}
              >
                {letterText || 'ن'}
              </span>
            </motion.div>
          ))}

          {/* Main letter - fading in and out */}
          <motion.div
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2,
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
            <span
              className="text-7xl font-bold text-white"
              style={{
                textShadow: `0 0 30px ${color}`,
              }}
            >
              {letterText || 'ن'}
            </span>
          </motion.div>
        </div>

        {/* Nasal cavity visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-40 left-1/2 -translate-x-1/2"
        >
          {/* Nose representation */}
          <svg width="80" height="120" viewBox="0 0 80 120" className="opacity-70">
            <motion.path
              d="M 40 20 Q 30 40, 25 60 Q 25 80, 30 100 M 40 20 Q 50 40, 55 60 Q 55 80, 50 100"
              stroke={color}
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Airflow particles */}
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={i}
                r="3"
                fill={color}
                initial={{ cy: 100, opacity: 1 }}
                animate={{
                  cy: [100, 20],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                cx="40"
              />
            ))}
          </svg>
        </motion.div>

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
              {accuracy >= 0.9 && '⭐ ممتاز! Perfect Ikhfa!'}
              {accuracy >= 0.75 && accuracy < 0.9 && '✓ جيد! Good Concealment!'}
              {accuracy >= 0.6 && accuracy < 0.75 && '→ Needs Improvement'}
              {accuracy < 0.6 && '✗ Weak Nasalization'}
            </div>

            {/* Specific feedback */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white border border-white/20 text-sm">
              {accuracy >= 0.9 ? (
                <p>
                  <span className="text-green-400 font-bold">✓ Excellent!</span> Perfect hidden nasalization - the noon sound is concealed beautifully!
                </p>
              ) : accuracy >= 0.75 ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-green-400 font-bold">Good work!</span> The concealment is there, but enhance the nasal quality.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Let the sound resonate in your nose while keeping it subtle and hidden.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-orange-400 font-bold">⚠ Too Clear:</span> The noon sound is too pronounced - it should be "hidden"!
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Don't fully pronounce the ن. Instead, let it dissolve into a nasal hum between noon and the following letter. Feel it in your nose!
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
