'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface IdghamVisualProps {
  accuracy: number; // 0-1
  isActive: boolean;
  letterText: string;
  colorCode?: string; // Rule color from Tajweed map
}

/**
 * Idgham (Merging) Visual Effect
 * Shows liquid fusion animation representing
 * the merging of two letters
 */
export function IdghamVisual({ accuracy, isActive, letterText, colorCode = '#d500b7' }: IdghamVisualProps) {
  if (!isActive) return null;

  // Use the rule's color from Tajweed map (idgham varies, typically magenta/pink)
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
            إدغام - Idgham
          </h3>
          <p className="text-white/80 text-lg">Merging Letters</p>
        </motion.div>

        {/* Two circles merging */}
        <div className="relative w-96 h-48">
          {/* Left circle */}
          <motion.div
            initial={{ x: -150, opacity: 1 }}
            animate={{ x: 0, opacity: 0.5 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 flex items-center justify-center"
            style={{
              backgroundColor: `${color}33`,
              borderColor: color,
              boxShadow: `0 0 40px ${color}`,
            }}
          >
            <span
              className="text-5xl font-bold text-white"
              style={{ textShadow: `0 0 20px ${color}` }}
            >
              {letterText || 'ن'}
            </span>
          </motion.div>

          {/* Right circle */}
          <motion.div
            initial={{ x: 150, opacity: 1 }}
            animate={{ x: 0, opacity: 0.5 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 flex items-center justify-center"
            style={{
              backgroundColor: `${color}33`,
              borderColor: color,
              boxShadow: `0 0 40px ${color}`,
            }}
          >
            <span
              className="text-5xl font-bold text-white"
              style={{ textShadow: `0 0 20px ${color}` }}
            >
              م
            </span>
          </motion.div>

          {/* Liquid droplets flowing between */}
          {[...Array(15)].map((_, i) => {
            const delay = i * 0.1;
            const yOffset = (Math.sin(i) * 30);

            return (
              <motion.div
                key={i}
                initial={{ x: -150, opacity: 0 }}
                animate={{
                  x: [- 150, 0, 150],
                  opacity: [0, 1, 0],
                  y: [0, yOffset, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            );
          })}

          {/* Merged result */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 flex items-center justify-center"
            style={{
              backgroundColor: `${color}44`,
              borderColor: color,
              boxShadow: `0 0 60px ${color}`,
            }}
          >
            {/* Pulsing glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full blur-xl"
              style={{ backgroundColor: color }}
            />

            <span
              className="relative text-7xl font-bold text-white"
              style={{ textShadow: `0 0 30px ${color}` }}
            >
              {letterText || 'ن'}
            </span>
          </motion.div>

          {/* Unity symbol */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2"
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <motion.path
                d="M 15 30 L 25 30 M 35 30 L 45 30 M 30 15 L 30 25 M 30 35 L 30 45"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 2 }}
              />
              <motion.circle
                cx="30"
                cy="30"
                r="25"
                stroke={color}
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 2.2 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Detailed Accuracy Feedback */}
        {accuracy > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute -bottom-40 left-1/2 -translate-x-1/2 text-center w-96"
          >
            <div
              className="inline-block px-6 py-3 rounded-full font-bold text-white text-lg shadow-lg mb-3"
              style={{ backgroundColor: color }}
            >
              {accuracy >= 0.9 && '⭐ ممتاز! Perfect Idgham!'}
              {accuracy >= 0.75 && accuracy < 0.9 && '✓ جيد! Good Merging!'}
              {accuracy >= 0.6 && accuracy < 0.75 && '→ Needs Improvement'}
              {accuracy < 0.6 && '✗ Incomplete Fusion'}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white border border-white/20 text-sm">
              {accuracy >= 0.9 ? (
                <p>
                  <span className="text-green-400 font-bold">✓ Excellent!</span> Perfect merging - the two letters flowed smoothly into one!
                </p>
              ) : accuracy >= 0.75 ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-purple-400 font-bold">Good merging!</span> The fusion is there, but make it even smoother.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Blend the noon completely with the next letter - they should sound like one continuous sound!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-orange-400 font-bold">⚠ Not Merged:</span> The letters are still separate - they need to fuse!
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Don't pronounce the noon separately. Merge it completely into the following letter, creating one smooth, unified sound.
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
