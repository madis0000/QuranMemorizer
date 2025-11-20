'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { VerseSelector } from '@/components/memorization/VerseSelector';
import { Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TajweedPage() {
  const router = useRouter();
  const [showSelector, setShowSelector] = useState(true);

  const handleVerseSelect = (surahNumber: number, verseNumber: number) => {
    router.push(`/tajweed/${surahNumber}?verse=${verseNumber}`);
  };

  const handleBackToMemorize = () => {
    router.push('/memorize');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Tajweed Practice
            </h1>
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice Quranic recitation with color-coded Tajweed rules for both Uthmani and Simple scripts
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-600/5 border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Tajweed Color Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0088ff' }}></span>
                    <span>Qalqalah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#169777' }}></span>
                    <span>Ikhfa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff7e1e' }}></span>
                    <span>Iqlab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#d500b7' }}></span>
                    <span>Idgham/Ghunna</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Tajweed colors are automatically applied to help you learn proper recitation rules
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button onClick={handleBackToMemorize} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Memorize Hub
          </Button>
        </div>

        {/* Verse Selector */}
        {showSelector && (
          <VerseSelector
            onVerseSelect={handleVerseSelect}
            onBack={handleBackToMemorize}
          />
        )}
      </div>
    </div>
  );
}
