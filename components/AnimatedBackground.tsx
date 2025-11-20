'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Generate fixed positions for particles to avoid hydration mismatch
const particlePositions = [
  { left: 83.16, top: 42.07 },
  { left: 37.19, top: 17.10 },
  { left: 53.49, top: 6.74 },
  { left: 3.19, top: 54.75 },
  { left: 38.00, top: 13.65 },
  { left: 79.97, top: 7.65 },
  { left: 8.15, top: 96.30 },
  { left: 38.83, top: 83.01 },
  { left: 41.39, top: 66.36 },
  { left: 36.10, top: 20.70 },
  { left: 66.11, top: 77.78 },
  { left: 72.68, top: 93.92 },
  { left: 33.39, top: 69.31 },
  { left: 94.70, top: 74.78 },
  { left: 87.10, top: 61.27 },
  { left: 60.50, top: 72.91 },
  { left: 42.35, top: 27.66 },
  { left: 3.19, top: 32.81 },
  { left: 2.48, top: 77.42 },
  { left: 96.25, top: 62.06 },
];

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-100 to-accent/10 dark:from-gray-950 dark:via-primary-950 dark:to-gray-900" />

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-radial from-primary-400/30 via-primary-500/20 to-transparent dark:from-primary-600/20 dark:via-primary-700/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 150, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] bg-gradient-radial from-accent/30 via-primary-300/20 to-transparent dark:from-accent/20 dark:via-primary-800/10 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-gradient-radial from-primary-300/25 via-accent/15 to-transparent dark:from-primary-700/15 dark:via-accent/10 rounded-full blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, -80, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />

      {/* Islamic Geometric Pattern Overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="islamic-pattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '50px 50px' }}
            >
              <path
                d="M50,0 L65,35 L100,35 L72,57 L85,92 L50,70 L15,92 L28,57 L0,35 L35,35 Z"
                fill="currentColor"
                className="text-primary-600 dark:text-primary-400"
              />
              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-500" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-400" />
            </motion.g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>

      {/* Floating Particles */}
      {mounted && particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400/40 dark:bg-primary-300/30 rounded-full"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (i % 3 - 1) * 10, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: (i % 5),
          }}
        />
      ))}

      {/* Gradient Mesh Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-primary-50/50 to-transparent dark:via-primary-950/30 opacity-60" />
    </div>
  );
}
