'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModeSelector } from '@/components/memorization/ModeSelector';
import { ContextSelector } from '@/components/memorization/ContextSelector';
import { VerseSelector } from '@/components/memorization/VerseSelector';
import { PageSelector } from '@/components/memorization/PageSelector';
import { JuzSelector } from '@/components/memorization/JuzSelector';
import { StreakCounter } from '@/components/memorization/StreakCounter';
import { useGamificationStore } from '@/store/useGamificationStore';
import {
  Trophy,
  Target,
  TrendingUp,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import type { UnitType } from '@/lib/memorization/types';

type ViewMode = 'hub' | 'verse-selector' | 'page-selector' | 'juz-selector' | 'context-selector';

export default function MemorizeV2Page() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<UnitType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('hub');
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [lastVerse, setLastVerse] = useState<string | null>(null);
  const [lastPracticeTime, setLastPracticeTime] = useState<string | null>(null);

  const { streak, achievements, totalVersesCompleted, totalPracticeTime } =
    useGamificationStore();

  // Load last practice session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVerse = localStorage.getItem('lastVerse');
      const savedTime = localStorage.getItem('lastPracticeTime');
      setLastVerse(savedVerse);
      setLastPracticeTime(savedTime);
    }
  }, []);

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const practiceHours = Math.floor(totalPracticeTime / 3600);

  const handleModeSelect = (mode: UnitType) => {
    setSelectedMode(mode);
    switch (mode) {
      case 'verse':
        setViewMode('verse-selector');
        break;
      case 'page':
        setViewMode('page-selector');
        break;
      case 'juz':
        setViewMode('juz-selector');
        break;
      case 'context':
        setShowContextSelector(true);
        setViewMode('context-selector');
        break;
      default:
        // TODO: Implement other mode selectors
        alert(`Selected mode: ${mode}. Unit selector coming next!`);
    }
  };

  const handleVerseSelect = (surahNumber: number, verseNumber: number) => {
    router.push(`/memorize/${surahNumber}?verse=${verseNumber}`);
  };

  const handlePageSelect = (pageNumber: number) => {
    router.push(`/memorize/page/${pageNumber}`);
  };

  const handleJuzSelect = (juzNumber: number) => {
    router.push(`/memorize/juz/${juzNumber}`);
  };

  const handleBackToHub = () => {
    setViewMode('hub');
    setSelectedMode(null);
    setShowContextSelector(false);
  };

  const handleContinueLastSession = () => {
    if (lastVerse) {
      const [surahNumber, verseNumber] = lastVerse.split(':');
      router.push(`/memorize/${surahNumber}?verse=${verseNumber}`);
    }
  };

  const getTimeSinceLastPractice = () => {
    if (!lastPracticeTime) return '';
    const lastTime = new Date(lastPracticeTime);
    const now = new Date();
    const diffMs = now.getTime() - lastTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quran Memorization Hub
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personalized journey to memorizing the Holy Quran with AI-powered
            practice, smart tracking, and beautiful progress visualization
          </p>
        </motion.div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <StreakCounter
              currentStreak={streak.current}
              longestStreak={streak.longest}
              lastPracticeDate={streak.lastPracticeDate}
            />
          </motion.div>

          {/* Verses Completed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm text-muted-foreground">Verses Mastered</h3>
                <p className="text-3xl font-bold text-green-600">{totalVersesCompleted}</p>
                <p className="text-xs text-muted-foreground">Keep building your collection!</p>
              </div>
            </Card>
          </motion.div>

          {/* Practice Time */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Star className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm text-muted-foreground">Practice Time</h3>
                <p className="text-3xl font-bold text-blue-600">{practiceHours}h</p>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(totalPracticeTime / 60)} total minutes
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm text-muted-foreground">Achievements</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {unlockedAchievements.length}/{achievements.length}
                </p>
                <p className="text-xs text-muted-foreground">Unlocked badges</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="modes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mx-auto">
            <TabsTrigger value="modes" className="gap-2">
              <Target className="w-4 h-4" />
              Practice Modes
            </TabsTrigger>
            <TabsTrigger value="contexts" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Modes Tab */}
          <TabsContent value="modes" className="space-y-6">
            {viewMode === 'hub' && (
              <ModeSelector
                onModeSelect={handleModeSelect}
                currentMode={selectedMode || undefined}
              />
            )}

            {viewMode === 'verse-selector' && (
              <VerseSelector
                onVerseSelect={handleVerseSelect}
                onBack={handleBackToHub}
              />
            )}

            {viewMode === 'page-selector' && (
              <PageSelector
                onPageSelect={handlePageSelect}
                onBack={handleBackToHub}
              />
            )}

            {viewMode === 'juz-selector' && (
              <JuzSelector
                onJuzSelect={handleJuzSelect}
                onBack={handleBackToHub}
              />
            )}
          </TabsContent>

          {/* Contexts Tab */}
          <TabsContent value="contexts" className="space-y-6">
            <ContextSelector
              onContextSelect={(contextId) => {
                // TODO: Navigate to practice with this context
                alert(`Selected context: ${contextId}. Starting practice...`);
              }}
            />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementsGrid achievements={achievements} />
          </TabsContent>
        </Tabs>

        {/* Quick Actions Footer - Resume Last Session */}
        {lastVerse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="relative">
              <Button
                size="lg"
                onClick={handleContinueLastSession}
                className="rounded-full shadow-2xl bg-gradient-to-r from-primary to-purple-600 hover:shadow-primary/50 group"
              >
                <span>Continue Last Session</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="absolute -top-10 right-0 bg-background border rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap">
                <p className="text-xs font-semibold">Verse {lastVerse}</p>
                <p className="text-xs text-muted-foreground">{getTimeSinceLastPractice()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AchievementsGrid({ achievements }: { achievements: any[] }) {
  const categories = ['practice', 'mastery', 'streak', 'speed', 'special'];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryAchievements = achievements.filter((a) => a.category === category);
        const unlockedCount = categoryAchievements.filter((a) => a.unlocked).length;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold capitalize">{category} Achievements</h3>
              <span className="text-sm text-muted-foreground">
                {unlockedCount}/{categoryAchievements.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-3xl ${
                        achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-40'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                              style={{
                                width: `${(achievement.progress / achievement.requirement) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.progress}/{achievement.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
 
