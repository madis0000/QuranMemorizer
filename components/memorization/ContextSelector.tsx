'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, BookHeart, Sparkles } from 'lucide-react';
import { CONTEXTS, type Context, type ContextCategory } from '@/lib/memorization/contexts';
import { contextToUnit } from '@/lib/memorization/contexts';

const CATEGORY_INFO: Record<ContextCategory, { label: string; color: string; emoji: string }> = {
  belief: { label: 'Faith & Belief', color: 'from-indigo-500 to-purple-500', emoji: '☪️' },
  worship: { label: 'Worship', color: 'from-blue-500 to-cyan-500', emoji: '🕌' },
  morals: { label: 'Character', color: 'from-amber-500 to-orange-500', emoji: '🌟' },
  stories: { label: 'Stories', color: 'from-green-500 to-emerald-500', emoji: '📖' },
  law: { label: 'Rulings', color: 'from-purple-500 to-pink-500', emoji: '⚖️' },
  afterlife: { label: 'Hereafter', color: 'from-emerald-500 to-teal-500', emoji: '🌺' },
  nature: { label: 'Creation', color: 'from-lime-500 to-green-500', emoji: '🌍' },
  guidance: { label: 'Guidance', color: 'from-sky-500 to-blue-500', emoji: '💚' },
  protection: { label: 'Protection', color: 'from-cyan-500 to-blue-500', emoji: '🛡️' },
  gratitude: { label: 'Gratitude', color: 'from-rose-500 to-pink-500', emoji: '🙏' },
};

interface ContextSelectorProps {
  onContextSelect: (contextId: string) => void;
  selectedCategory?: ContextCategory;
}

export function ContextSelector({ onContextSelect, selectedCategory }: ContextSelectorProps) {
  const contextsToShow = selectedCategory
    ? CONTEXTS.filter((c) => c.category === selectedCategory)
    : CONTEXTS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h1 className="text-3xl font-bold">Thematic Contexts</h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">
            Memorize verses grouped by meaningful themes
          </p>
        </motion.div>

        {/* Category Filter (simplified for now) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Object.entries(CATEGORY_INFO).slice(0, 6).map(([key, info]) => (
            <Badge
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10"
            >
              <span className="mr-1">{info.emoji}</span>
              {info.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Context Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contextsToShow.map((context, index) => {
          const categoryInfo = CATEGORY_INFO[context.category];
          const unit = contextToUnit(context);

          return (
            <motion.div
              key={context.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Card className="relative overflow-hidden h-full hover:shadow-xl transition-all">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${context.gradient} opacity-5`}
                />

                {/* Icon Badge */}
                <div className="absolute top-4 right-4">
                  <div className="text-3xl">{context.icon}</div>
                </div>

                <CardHeader>
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className={`bg-gradient-to-r ${context.gradient} text-white border-0`}
                    >
                      {categoryInfo.emoji} {categoryInfo.label}
                    </Badge>

                    <CardTitle className="text-lg leading-tight">
                      {context.title}
                    </CardTitle>

                    <p
                      className="text-sm text-muted-foreground font-arabic"
                      dir="rtl"
                    >
                      {context.arabicTitle}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {context.description}
                  </CardDescription>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <span>{context.verses.length} verses</span>
                      <span>~{unit.metadata.estimatedTime} min</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {unit.metadata.difficulty}
                    </Badge>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${context.gradient} hover:opacity-90`}
                    onClick={() => onContextSelect(context.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Memorizing
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {contextsToShow.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookHeart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No contexts found for this category</p>
        </motion.div>
      )}

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-2"
      >
        <p className="text-sm text-muted-foreground">
          💡 <strong>Why Thematic?</strong> Memorizing verses by themes helps you understand
          context, improves retention, and makes practice more meaningful.
        </p>
        <p className="text-xs text-muted-foreground">
          More contexts coming soon based on your feedback!
        </p>
      </motion.div>
    </div>
  );
}
