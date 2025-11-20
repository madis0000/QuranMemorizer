'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface IqlabVisualProps {
  accuracy: number; // 0-1
  isActive: boolean;
  colorCode?: string; // Rule color from Tajweed map
}

/**
 * Iqlab (Conversion) Visual Effect
 * Shows 3D flip transformation representing
 * the conversion from noon/tanween to meem
 */
export function IqlabVisual({ accuracy, isActive, colorCode = '#ff7e1e' }: IqlabVisualProps) {
  if (!isActive) return null;

  // Use the rule's color from Tajweed map (iqlab is typically orange)
  const color = colorCode;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ perspective: '1000px' }}
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
            إقلاب - Iqlab
          </h3>
          <p className="text-white/80 text-lg">Conversion to Meem</p>
        </motion.div>

        {/* Flipping card */}
        <motion.div
          className="relative w-48 h-48"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
          }}
        >
          {/* Front face - Noon */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 flex items-center justify-center"
            style={{
              backgroundColor: `${color}33`,
              borderColor: color,
              boxShadow: `0 0 50px ${color}`,
              backfaceVisibility: 'hidden',
            }}
          >
            <span
              className="text-7xl font-bold text-white"
              style={{ textShadow: `0 0 30px ${color}` }}
            >
              ن
            </span>
          </motion.div>

          {/* Back face - Meem */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 flex items-center justify-center"
            style={{
              backgroundColor: `${color}33`,
              borderColor: color,
              boxShadow: `0 0 50px ${color}`,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span
              className="text-7xl font-bold text-white"
              style={{ textShadow: `0 0 30px ${color}` }}
            >
              م
            </span>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ backgroundColor: color }}
          />
        </motion.div>

        {/* Transformation particles */}
        {[...Array(20)].map((_, i) => {
          const angle = (i * 360) / 20;
          const radius = 100;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: [0, x, 0],
                y: [0, y, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.05,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          );
        })}

        {/* Transformation arrow */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: [0, 1, 0], x: [-50, 50] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-y-1/2"
        >
          <svg width="100" height="40" viewBox="0 0 100 40">
            <motion.path
              d="M 10 20 L 80 20 L 70 10 M 80 20 L 70 30"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </motion.div>

        {/* Conversion symbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 text-6xl"
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
            style={{ color }}
          >
            ⟳
          </motion.span>
        </motion.div>

        {/* Detailed Accuracy Feedback */}
        {accuracy > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute -bottom-40 left-1/2 -translate-x-1/2 text-center w-96"
          >
            <div
              className="inline-block px-6 py-3 rounded-full font-bold text-white text-lg shadow-lg mb-3"
              style={{ backgroundColor: color }}
            >
              {accuracy >= 0.9 && '⭐ ممتاز! Perfect Iqlab!'}
              {accuracy >= 0.75 && accuracy < 0.9 && '✓ جيد! Good Conversion!'}
              {accuracy >= 0.6 && accuracy < 0.75 && '→ Needs Improvement'}
              {accuracy < 0.6 && '✗ Incomplete Conversion'}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white border border-white/20 text-sm">
              {accuracy >= 0.9 ? (
                <p>
                  <span className="text-green-400 font-bold">✓ Excellent!</span> Perfect conversion from noon to meem!
                </p>
              ) : accuracy >= 0.75 ? (
                <div className="space-y-2">
                  <p>
                    <span className="text-orange-400 font-bold">Good attempt!</span> The conversion is there, but emphasize the meem sound more.
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Transform the noon completely into a meem (م) sound before the ب letter!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-red-400 font-bold">⚠ Not Converted:</span> The noon is still pronounced as noon!
                  </p>
                  <p className="text-white/70">
                    💡 <strong>Tip:</strong> Change ن or tanween to a clear م (meem) sound when followed by ب. Close your lips completely and let the sound resonate: م...ب
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
