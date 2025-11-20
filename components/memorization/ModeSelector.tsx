'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileText,
  Layers,
  BookMarked,
  Library,
  Lightbulb,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import type { UnitType } from '@/lib/memorization/types';

interface Mode {
  id: UnitType;
  name: string;
  arabicName: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  estimatedTime: string;
  recommended?: boolean;
  comingSoon?: boolean;
}

const MODES: Mode[] = [
  {
    id: 'verse',
    name: 'Verse by Verse',
    arabicName: 'آية بآية',
    description: 'Master one verse at a time with focused practice',
    icon: BookOpen,
    gradient: 'from-blue-500 via-blue-600 to-cyan-600',
    estimatedTime: '~2 min/verse',
    recommended: true,
  },
  {
    id: 'page',
    name: 'Page by Page',
    arabicName: 'صفحة بصفحة',
    description: 'Complete full pages of the Mushaf',
    icon: FileText,
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    estimatedTime: '~10 min/page',
  },
  {
    id: 'rub',
    name: 'Rub\' (Quarter)',
    arabicName: 'ربع الحزب',
    description: 'Practice by Rub\' - Quarter of a Hizb (~5 pages)',
    icon: Layers,
    gradient: 'from-purple-500 via-purple-600 to-indigo-600',
    estimatedTime: '~30 min/rub\'',
  },
  {
    id: 'hizb',
    name: 'Hizb (Half Juz)',
    arabicName: 'حزب',
    description: 'Memorize by Hizb - 1/60th of the Quran (~10 pages)',
    icon: BookMarked,
    gradient: 'from-orange-500 via-orange-600 to-amber-600',
    estimatedTime: '~1 hour/hizb',
  },
  {
    id: 'juz',
    name: 'Juz (Full Para)',
    arabicName: 'جزء',
    description: 'Complete Juz practice - 1/30th of the Quran (~20 pages)',
    icon: Library,
    gradient: 'from-red-500 via-rose-600 to-pink-600',
    estimatedTime: '~2 hours/juz',
    badge: 'Advanced',
  },
  {
    id: 'context',
    name: 'Thematic Contexts',
    arabicName: 'السياق الموضوعي',
    description: 'Learn verses grouped by themes and topics',
    icon: Lightbulb,
    gradient: 'from-teal-500 via-cyan-600 to-sky-600',
    estimatedTime: 'Varies',
    badge: 'New',
  },
];

interface ModeSelectorProps {
  onModeSelect: (mode: UnitType) => void;
  currentMode?: UnitType;
}

export function ModeSelector({ onModeSelect, currentMode }: ModeSelectorProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Path
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Select a memorization mode that fits your learning style
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-muted-foreground">6 Modes Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Smart Progress Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">Flexible Practice</span>
          </div>
        </motion.div>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODES.map((mode, index) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => !mode.comingSoon && onModeSelect(mode.id)}
            >
              <Card
                className={`relative overflow-hidden cursor-pointer h-full transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-2xl'
                    : 'hover:shadow-xl'
                } ${mode.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {mode.recommended && (
                    <Badge className="bg-yellow-500 text-white border-0">
                      ⭐ Recommended
                    </Badge>
                  )}
                  {mode.badge && (
                    <Badge variant="secondary" className="border-0">
                      {mode.badge}
                    </Badge>
                  )}
                  {mode.comingSoon && (
                    <Badge variant="outline" className="border-dashed">
                      Coming Soon
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {/* Icon with Gradient */}
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{mode.name}</CardTitle>
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {mode.arabicName}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {mode.description}
                  </CardDescription>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {mode.estimatedTime}
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Progress bar placeholder - will be dynamic later */}
                  {!mode.comingSoon && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Your Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${mode.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: '0%' }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>
          💡 Tip: Start with <strong>Verse by Verse</strong> mode if you're new, or try{' '}
          <strong>Thematic Contexts</strong> for meaningful memorization journeys
        </p>
      </motion.div>
    </div>
  );
}
