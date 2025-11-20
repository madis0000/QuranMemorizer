'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Play, Star, TrendingUp } from 'lucide-react';
import { SURAHS } from '@/data/quranData';

interface VerseSelectorProps {
  onVerseSelect: (surahNumber: number, verseNumber: number) => void;
  onBack?: () => void;
}

export function VerseSelector({ onVerseSelect, onBack }: VerseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  const filteredSurahs = SURAHS.filter((surah) =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.number.toString().includes(searchQuery)
  );

  const selectedSurahData = selectedSurah ? SURAHS.find(s => s.number === selectedSurah) : null;

  if (selectedSurah && selectedSurahData) {
    // Show verse list for selected surah
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedSurahData.name}</h2>
            <p className="text-muted-foreground">{selectedSurahData.englishName}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedSurah(null)}>
            ← Back to Surahs
          </Button>
        </div>

        {/* Practice Mode Selector - Full Surah */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Practice Full Surah</h4>
                  <p className="text-sm text-muted-foreground">
                    Master all {selectedSurahData.verses} verses in one continuous session
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 gap-2"
                onClick={() => window.location.href = `/memorize/surah/${selectedSurah}`}
              >
                <Play className="w-4 h-4" />
                Start Full Surah
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              Or practice individual verses
            </span>
          </div>
        </div>

        {/* Verse Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: selectedSurahData.verses }, (_, i) => i + 1).map((verseNum) => (
            <motion.div
              key={verseNum}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(verseNum * 0.01, 0.5) }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                variant="outline"
                className="w-full h-16 text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
                onClick={() => onVerseSelect(selectedSurah, verseNum)}
              >
                {verseNum}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Quick Start (Ayah by Ayah)</h4>
                <p className="text-xs text-muted-foreground">Practice specific verses one at a time</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVerseSelect(selectedSurah, 1)}
                >
                  Start from Verse 1
                </Button>
                <Button
                  size="sm"
                  onClick={() => onVerseSelect(selectedSurah, Math.floor(Math.random() * selectedSurahData.verses) + 1)}
                >
                  Random Verse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show surah list
  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Select a Surah</h2>
            <p className="text-muted-foreground">Choose a surah, then select a verse to practice</p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Recommended Surahs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-sm">Recommended for Beginners</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[112, 113, 114, 1, 108].map((surahNum) => {
            const surah = SURAHS.find(s => s.number === surahNum);
            if (!surah) return null;
            return (
              <Button
                key={surahNum}
                variant="outline"
                size="sm"
                onClick={() => setSelectedSurah(surahNum)}
                className="gap-2"
              >
                <span className="font-arabic">{surah.name}</span>
                <span className="text-xs text-muted-foreground">({surah.verses} verses)</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Surah Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah, index) => (
          <motion.div
            key={surah.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.5) }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => setSelectedSurah(surah.number)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {surah.number}
                    </div>
                    <div>
                      <CardTitle className="text-base">{surah.name}</CardTitle>
                      <CardDescription className="text-xs">{surah.englishName}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {surah.verses} verses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{surah.revelationType}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSurah(surah.number);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No surahs found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
