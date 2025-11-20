'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/70 dark:bg-gray-900/70',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-white/20 dark:border-gray-800/50',
        'shadow-xl shadow-primary-500/10 dark:shadow-primary-900/20',
        hover && 'hover:shadow-2xl hover:shadow-primary-500/20 dark:hover:shadow-primary-900/30',
        'transition-all duration-300',
        className
      )}
    >
      {/* Gradient Overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent/5 dark:from-primary-400/5 dark:to-accent/5 pointer-events-none" />
      )}

      {/* Glow Effect */}
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-accent/20 to-primary-500/20 dark:from-primary-400/10 dark:via-accent/10 dark:to-primary-400/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
      )}

      {/* Shine Effect on Hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function GlassPanel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl',
        'bg-white/60 dark:bg-gray-900/60',
        'backdrop-blur-md backdrop-saturate-150',
        'border border-white/20 dark:border-gray-800/40',
        'shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
