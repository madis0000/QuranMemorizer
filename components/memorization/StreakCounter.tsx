'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Flame, TrendingUp, Award, Zap } from 'lucide-react';
import { getStreakMessage, getStreakMultiplier } from '@/lib/memorization/gamification';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
}

export function StreakCounter({ currentStreak, longestStreak, lastPracticeDate }: StreakCounterProps) {
  const multiplier = getStreakMultiplier(currentStreak);
  const message = getStreakMessage(currentStreak);

  const getStreakColor = (streak: number): string => {
    if (streak >= 100) return 'from-yellow-500 to-orange-600';
    if (streak >= 30) return 'from-orange-500 to-red-600';
    if (streak >= 14) return 'from-red-500 to-pink-600';
    if (streak >= 7) return 'from-pink-500 to-purple-600';
    if (streak >= 3) return 'from-purple-500 to-indigo-600';
    return 'from-gray-400 to-gray-500';
  };

  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = lastPracticeDate === today;

  return (
    <Card className="relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getStreakColor(currentStreak)} opacity-10`}
        animate={{
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: isActiveToday ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: isActiveToday ? Infinity : 0,
                repeatDelay: 2,
              }}
            >
              <Flame
                className={`w-8 h-8 ${
                  currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'
                }`}
              />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">Practice Streak</h3>
              <p className="text-sm text-muted-foreground">Keep the flame alive!</p>
            </div>
          </div>

          {multiplier > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold shadow-lg"
            >
              {multiplier}x Bonus
            </motion.div>
          )}
        </div>

        {/* Main Streak Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <motion.div
              className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
              key={currentStreak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {currentStreak}
            </motion.div>
            <p className="text-sm text-muted-foreground">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </div>

          {/* Longest Streak */}
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <Award className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-500">{longestStreak}</div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          className={`p-3 rounded-lg border ${
            isActiveToday
              ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
              : 'bg-muted/50 border-border'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-sm">
            {isActiveToday ? (
              <>
                <span className="text-lg">✓</span>
                <span>Practiced today! {message}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{message}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Milestones */}
        {currentStreak > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Next Milestone</p>
            <div className="space-y-1">
              {currentStreak < 3 && (
                <MilestoneProgress
                  current={currentStreak}
                  target={3}
                  label="3 Days"
                  icon="🔥"
                />
              )}
              {currentStreak >= 3 && currentStreak < 7 && (
                <MilestoneProgress
                  current={currentStreak}
                  target={7}
                  label="1 Week"
                  icon="⚡"
                />
              )}
              {currentStreak >= 7 && currentStreak < 30 && (
                <MilestoneProgress
                  current={currentStreak}
                  target={30}
                  label="1 Month"
                  icon="🌟"
                />
              )}
              {currentStreak >= 30 && currentStreak < 100 && (
                <MilestoneProgress
                  current={currentStreak}
                  target={100}
                  label="100 Days"
                  icon="👑"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface MilestoneProgressProps {
  current: number;
  target: number;
  label: string;
  icon: string;
}

function MilestoneProgress({ current, target, label, icon }: MilestoneProgressProps) {
  const progress = (current / target) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-muted-foreground">
          {current}/{target}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
