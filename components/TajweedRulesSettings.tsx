'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Check } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { GlassCard } from './GlassCard';

const tajweedRules = [
  {
    key: 'madd' as const,
    name: 'Madd (Elongation)',
    arabicName: 'مد',
    description: 'Lengthening of vowel sounds',
    color: '#d500b7',
    icon: '━',
  },
  {
    key: 'qalqalah' as const,
    name: 'Qalqalah (Echo)',
    arabicName: 'قلقلة',
    description: 'Bouncing or echoing sound',
    color: '#4fc3f7',
    icon: '◉',
  },
  {
    key: 'ikhfa' as const,
    name: 'Ikhfa (Hiding)',
    arabicName: 'إخفاء',
    description: 'Concealing with nasalization',
    color: '#26a69a',
    icon: '≋',
  },
  {
    key: 'idgham' as const,
    name: 'Idgham (Merging)',
    arabicName: 'إدغام',
    description: 'Merging of letters',
    color: '#f06292',
    icon: '⊕',
  },
  {
    key: 'iqlab' as const,
    name: 'Iqlab (Conversion)',
    arabicName: 'إقلاب',
    description: 'Conversion to meem sound',
    color: '#ff9800',
    icon: '⇄',
  },
  {
    key: 'ghunnah' as const,
    name: 'Ghunnah (Nasalization)',
    arabicName: 'غنة',
    description: 'Nasal sound',
    color: '#ba68c8',
    icon: '∼',
  },
];

export function TajweedRulesSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { enabledTajweedRules, toggleTajweedRule } = useUIStore();
  const enabledCount = Object.values(enabledTajweedRules).filter(Boolean).length;

  console.log('⚙️ [Settings] Current enabled rules:', enabledTajweedRules);

  const handleToggle = (ruleKey: typeof tajweedRules[number]['key']) => {
    console.log('🔄 [Settings] Toggling rule:', ruleKey, 'Current value:', enabledTajweedRules[ruleKey]);
    toggleTajweedRule(ruleKey);
    // Log after toggle (will show in next render)
    setTimeout(() => {
      console.log('✅ [Settings] After toggle, enabledRules:', useUIStore.getState().enabledTajweedRules);
    }, 100);
  };

  return (
    <>
      {/* Floating Settings Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.5 }}
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all flex items-center justify-center border-2 border-white/20"
        title="Tajweed Rules Settings - Click to customize"
      >
        <Settings className="w-7 h-7" />
        {enabledCount < 6 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-7 h-7 bg-accent rounded-full text-sm font-bold flex items-center justify-center text-gray-900 border-2 border-white shadow-lg"
          >
            {enabledCount}
          </motion.span>
        )}
        {enabledCount === 6 && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
          >
            <span className="text-white text-xs">✓</span>
          </motion.span>
        )}
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-[400px] max-h-[80vh] overflow-hidden"
            >
              <GlassCard className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Tajweed Rules</h3>
                    <p className="text-sm text-foreground/60 mt-1">
                      Select rules to check during practice
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-foreground/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Rules List */}
                <div className="space-y-3 max-h-[calc(80vh-120px)] overflow-y-auto pr-2">
                  {tajweedRules.map((rule, index) => {
                    const isEnabled = enabledTajweedRules[rule.key];
                    return (
                      <motion.div
                        key={rule.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleToggle(rule.key)}
                          className={`w-full p-4 rounded-xl border-2 transition-all ${
                            isEnabled
                              ? 'bg-white/10 dark:bg-white/5 border-white/20'
                              : 'bg-foreground/5 border-foreground/10 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                              style={{
                                backgroundColor: isEnabled ? rule.color + '33' : '#00000020',
                                border: `2px solid ${isEnabled ? rule.color : '#00000040'}`,
                              }}
                            >
                              {rule.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-foreground">{rule.name}</h4>
                                {isEnabled && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: rule.color }}
                                  >
                                    <Check className="w-3 h-3 text-white" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-foreground/60 mb-1 font-arabic" dir="rtl">
                                {rule.arabicName}
                              </p>
                              <p className="text-xs text-foreground/70">{rule.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer Info */}
                <div className="mt-6 pt-4 border-t border-foreground/10">
                  <p className="text-xs text-foreground/60 text-center">
                    {enabledCount === 6
                      ? '✓ All rules enabled'
                      : `${enabledCount} of 6 rules enabled`}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
