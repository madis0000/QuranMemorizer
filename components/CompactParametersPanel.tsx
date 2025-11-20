'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/useUIStore';
import {
  Settings,
  Zap,
  Brain,
  Target,
  Pin,
  PinOff,
  X,
  Type,
  Sparkles,
} from 'lucide-react';

interface CompactParametersPanelProps {
  // Auto-advance
  autoAdvance: boolean;
  onAutoAdvanceChange: (value: boolean) => void;

  // Memory mode
  isMemoryMode: boolean;
  onMemoryModeChange: (value: boolean) => void;
  memoryDifficulty: 'easy' | 'medium' | 'hard';
  onMemoryDifficultyChange: (value: 'easy' | 'medium' | 'hard') => void;

  // Strictness
  strictness: 'lenient' | 'medium' | 'strict';
  onStrictnessChange: (value: 'lenient' | 'medium' | 'strict') => void;

  // Optional: default collapsed state
  defaultCollapsed?: boolean;
}

export function CompactParametersPanel({
  autoAdvance,
  onAutoAdvanceChange,
  isMemoryMode,
  onMemoryModeChange,
  memoryDifficulty,
  onMemoryDifficultyChange,
  strictness,
  onStrictnessChange,
  defaultCollapsed = false,
}: CompactParametersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settingsPanelPinned');
      return saved === 'true';
    }
    return false;
  });

  // Persist pinned state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settingsPanelPinned', String(isPinned));
    }
  }, [isPinned]);

  // Auto-open if pinned
  useEffect(() => {
    if (isPinned) {
      setIsOpen(true);
    }
  }, [isPinned]);

  const handleToggle = () => {
    if (isPinned) return; // Don't toggle if pinned
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    if (!isPinned) {
      setIsOpen(false);
    }
  };

  // Get preferences from store
  const { arabicFont, setArabicFont, showDuplicateBadges, toggleDuplicateBadges, tajweedAssistantEnabled, toggleTajweedAssistant } = useUIStore();

  return (
    <>
      {/* Floating Toggle Button - Only show when panel is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-1/2 right-0 -translate-y-1/2 z-40 group"
            style={{ writingMode: 'vertical-rl' }}
          >
            <div className="bg-gradient-to-b from-blue-500 to-purple-600 text-white px-3 py-4 rounded-l-xl shadow-lg hover:shadow-xl transition-all hover:pr-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider">SETTINGS</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - only when not pinned */}
            {!isPinned && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />
            )}

            {/* Settings Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-xl border-l shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-500/10 to-purple-600/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Practice Settings</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPinned(!isPinned)}
                      className="h-8 w-8 p-0"
                      title={isPinned ? 'Unpin panel' : 'Pin panel'}
                    >
                      {isPinned ? (
                        <Pin className="w-4 h-4 text-blue-600" />
                      ) : (
                        <PinOff className="w-4 h-4" />
                      )}
                    </Button>
                    {!isPinned && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={autoAdvance ? 'default' : 'secondary'} className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto {autoAdvance ? 'ON' : 'OFF'}
                  </Badge>
                  <Badge variant={isMemoryMode ? 'default' : 'secondary'} className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    Memory {isMemoryMode ? 'ON' : 'OFF'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    {strictness}
                  </Badge>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Auto-Advance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Auto-Advance</p>
                        <p className="text-xs text-muted-foreground">Move to next verse automatically</p>
                      </div>
                    </div>
                    <Button
                      variant={autoAdvance ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onAutoAdvanceChange(!autoAdvance)}
                      className={`h-8 px-3 text-xs ${autoAdvance ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : ''}`}
                    >
                      {autoAdvance ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>

                {/* Memory Challenge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Memory Mode</p>
                        <p className="text-xs text-muted-foreground">Hide words until correct</p>
                      </div>
                    </div>
                    <Button
                      variant={isMemoryMode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onMemoryModeChange(!isMemoryMode)}
                      className={`h-8 px-3 text-xs ${isMemoryMode ? 'bg-purple-600 hover:bg-purple-700 shadow-md' : ''}`}
                    >
                      {isMemoryMode ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  {/* Difficulty - Show when Memory Mode is ON */}
                  <AnimatePresence>
                    {isMemoryMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">Difficulty Level</p>
                          <div className="grid grid-cols-3 gap-2">
                            {(['easy', 'medium', 'hard'] as const).map((diff) => (
                              <Button
                                key={diff}
                                variant={memoryDifficulty === diff ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onMemoryDifficultyChange(diff)}
                                className={`h-9 text-xs ${
                                  memoryDifficulty === diff
                                    ? diff === 'easy'
                                      ? 'bg-green-600 hover:bg-green-700 shadow-md'
                                      : diff === 'medium'
                                      ? 'bg-yellow-600 hover:bg-yellow-700 shadow-md'
                                      : 'bg-red-600 hover:bg-red-700 shadow-md'
                                    : ''
                                }`}
                              >
                                {diff.charAt(0).toUpperCase() + diff.slice(1)}
                              </Button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {memoryDifficulty === 'easy' && '✨ Hints after 2 attempts'}
                            {memoryDifficulty === 'medium' && '⚡ Hints after 3 attempts'}
                            {memoryDifficulty === 'hard' && '🔥 No hints - Maximum challenge'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Duplicate Word Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Badge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Duplicate Badges</p>
                        <p className="text-xs text-muted-foreground">Show 1/2, 2/2 indicators</p>
                      </div>
                    </div>
                    <Button
                      variant={showDuplicateBadges ? 'default' : 'outline'}
                      size="sm"
                      onClick={toggleDuplicateBadges}
                      className={`h-8 px-3 text-xs ${showDuplicateBadges ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : ''}`}
                    >
                      {showDuplicateBadges ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>

                {/* Tajweed Assistant */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Tajweed Assistant</p>
                        <p className="text-xs text-muted-foreground">Real-time pronunciation feedback</p>
                      </div>
                    </div>
                    <Button
                      variant={tajweedAssistantEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={toggleTajweedAssistant}
                      className={`h-8 px-3 text-xs ${tajweedAssistantEnabled ? 'bg-purple-600 hover:bg-purple-700 shadow-md' : ''}`}
                    >
                      {tajweedAssistantEnabled ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>

                {/* Matching Sensitivity */}
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Match Sensitivity</p>
                        <p className="text-xs text-muted-foreground">Pronunciation accuracy</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['lenient', 'medium', 'strict'] as const).map((str) => (
                        <Button
                          key={str}
                          variant={strictness === str ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onStrictnessChange(str)}
                          className={`h-9 text-xs flex flex-col items-center justify-center gap-0.5 ${
                            strictness === str
                              ? str === 'lenient'
                                ? 'bg-green-600 hover:bg-green-700 shadow-md'
                                : str === 'medium'
                                ? 'bg-yellow-600 hover:bg-yellow-700 shadow-md'
                                : 'bg-red-600 hover:bg-red-700 shadow-md'
                              : ''
                          }`}
                        >
                          <span className="text-base">
                            {str === 'lenient' && '🟢'}
                            {str === 'medium' && '🟡'}
                            {str === 'strict' && '🔴'}
                          </span>
                          <span className="text-[10px] leading-none">
                            {str.charAt(0).toUpperCase() + str.slice(1)}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {strictness === 'strict' && '🔴 Perfect (90%+) - Advanced'}
                      {strictness === 'medium' && '🟡 Balanced (70%+) - Recommended'}
                      {strictness === 'lenient' && '🟢 Forgiving (50%+) - Beginners'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Tip */}
              <div className="p-3 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  {isPinned ? '📌 Panel is pinned - stays open' : '💡 Click pin icon to keep panel open'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
