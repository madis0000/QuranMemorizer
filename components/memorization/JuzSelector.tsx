'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { AJZAA, JuzInfo } from '@/data/quranJuz';

interface JuzSelectorProps {
  onJuzSelect: (juzNumber: number) => void;
  onBack: () => void;
}

export function JuzSelector({ onJuzSelect, onBack }: JuzSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Modes
        </Button>
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Select Juz to Memorize</h2>
        </div>
        <div className="w-24"></div>
      </div>

      {/* Juz Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">30 Juz (Para) Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AJZAA.map((juz) => (
              <motion.button
                key={juz.number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onJuzSelect(juz.number)}
                className="relative p-6 rounded-lg border-2 transition-all bg-gradient-to-br from-primary/5 to-purple-500/5 hover:from-primary/10 hover:to-purple-500/10 border-primary/20 hover:border-primary hover:shadow-lg text-left"
              >
                <div className="space-y-3">
                  {/* Juz Number Badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {juz.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold font-['Amiri']" dir="rtl">
                        {juz.nameArabic}
                      </h3>
                      <p className="text-xs text-muted-foreground">{juz.nameEnglish}</p>
                    </div>
                  </div>

                  {/* Juz Details */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Starts:</span>
                      <span className="font-semibold">
                        {juz.startSurah}:{juz.startVerse}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ends:</span>
                      <span className="font-semibold">
                        {juz.endSurah}:{juz.endVerse}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="font-semibold">
                        {juz.pages[0]}-{juz.pages[juz.pages.length - 1]}
                      </span>
                    </div>
                  </div>

                  {/* Start Button */}
                  <div className="pt-2">
                    <div className="w-full py-2 px-4 rounded-md bg-primary/10 text-primary font-semibold text-center text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                      Start Practicing →
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookMarked className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Juz-by-Juz Mode</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>The Quran is divided into 30 equal parts called Juz (also known as Para)</li>
                <li>Each Juz contains approximately 20 pages</li>
                <li>Perfect for systematic memorization following traditional divisions</li>
                <li>Practice all verses in a Juz verse-by-verse</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
