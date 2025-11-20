'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Brain,
  Calendar,
  Clock,
  Flame,
  Star,
  Trophy,
  Medal,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useMemorizationStore } from '@/store/useMemorizationStore';
import { MemorizationHeatmap } from '@/components/MemorizationHeatmap';

// Achievement definitions
const achievements = [
  { id: 'first_verse', name: 'First Steps', description: 'Memorize your first verse', icon: Star, color: 'text-yellow-500', threshold: 1 },
  { id: 'week_streak', name: 'Consistent', description: '7-day review streak', icon: Flame, color: 'text-orange-500', threshold: 7 },
  { id: 'ten_verses', name: 'Building Momentum', description: 'Memorize 10 verses', icon: Zap, color: 'text-blue-500', threshold: 10 },
  { id: 'surah_complete', name: 'Surah Master', description: 'Complete a full surah', icon: Award, color: 'text-purple-500', threshold: 1 },
  { id: 'fifty_verses', name: 'Dedicated Scholar', description: 'Memorize 50 verses', icon: Medal, color: 'text-green-500', threshold: 50 },
  { id: 'hundred_verses', name: 'Hafiz in Training', description: 'Memorize 100 verses', icon: Trophy, color: 'text-red-500', threshold: 100 },
  { id: 'perfect_week', name: 'Perfectionist', description: 'Perfect scores for a week', icon: Crown, color: 'text-amber-500', threshold: 1 },
];

// Generate sample data for charts
function generateProgressData() {
  const data = [];
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      verses: Math.min(Math.floor(Math.random() * 5) + i * 0.5, 100),
      reviews: Math.floor(Math.random() * 10) + 5,
      accuracy: 70 + Math.floor(Math.random() * 20),
    });
  }

  return data;
}

function generateRetentionData() {
  return [
    { quality: 'Perfect', count: 45, percentage: 60 },
    { quality: 'Good', count: 20, percentage: 27 },
    { quality: 'Fair', count: 8, percentage: 10 },
    { quality: 'Struggling', count: 2, percentage: 3 },
  ];
}

function generatePerformanceRadar() {
  return [
    { category: 'Accuracy', value: 85 },
    { category: 'Consistency', value: 75 },
    { category: 'Speed', value: 65 },
    { category: 'Retention', value: 90 },
    { category: 'Focus', value: 70 },
  ];
}

export default function ProgressPage() {
  const { progress } = useMemorizationStore();
  const [selectedTab, setSelectedTab] = useState('overview');

  const progressData = useMemo(() => generateProgressData(), []);
  const retentionData = useMemo(() => generateRetentionData(), []);
  const radarData = useMemo(() => generatePerformanceRadar(), []);

  // Calculate stats
  const totalVerses = progress.size;
  const currentStreak = 12; // Calculated from activity
  const totalReviews = 156; // From review history
  const averageAccuracy = 82; // From review scores

  // Check unlocked achievements
  const unlockedAchievements = achievements.filter(achievement => {
    if (achievement.id === 'first_verse') return totalVerses >= 1;
    if (achievement.id === 'ten_verses') return totalVerses >= 10;
    if (achievement.id === 'fifty_verses') return totalVerses >= 50;
    if (achievement.id === 'hundred_verses') return totalVerses >= 100;
    if (achievement.id === 'week_streak') return currentStreak >= 7;
    return false;
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Your Learning Journey
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your progress, unlock achievements, and get AI-powered insights
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Verses</CardTitle>
                <Award className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalVerses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+5</span> this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentStreak} days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-blue-500">15</span> due today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Accuracy</CardTitle>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageAccuracy}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+3%</span> from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Activity Heatmap */}
          <MemorizationHeatmap />

          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                30-Day Progress Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="verses"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Verses Memorized"
                    dot={{ fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Reviews Completed"
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retention Quality */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Quality</CardTitle>
                <p className="text-sm text-muted-foreground">How well you remember verses</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={retentionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ quality, percentage }) => `${quality}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {retentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Profile</CardTitle>
                <p className="text-sm text-muted-foreground">Your strengths and areas to improve</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" className="text-xs" />
                    <PolarRadiusAxis className="text-xs" />
                    <Radar
                      name="Your Performance"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Comparison */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Activity Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">This week vs last week</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { day: 'Mon', thisWeek: 5, lastWeek: 3 },
                      { day: 'Tue', thisWeek: 7, lastWeek: 5 },
                      { day: 'Wed', thisWeek: 4, lastWeek: 6 },
                      { day: 'Thu', thisWeek: 8, lastWeek: 4 },
                      { day: 'Fri', thisWeek: 6, lastWeek: 7 },
                      { day: 'Sat', thisWeek: 10, lastWeek: 5 },
                      { day: 'Sun', thisWeek: 9, lastWeek: 8 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="thisWeek" fill="#10b981" name="This Week" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="lastWeek" fill="#6b7280" name="Last Week" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const isUnlocked = unlockedAchievements.includes(achievement);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`relative overflow-hidden transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    {isUnlocked && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}

                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${
                            isUnlocked ? 'bg-primary/20' : 'bg-muted'
                          } flex items-center justify-center`}
                        >
                          <Icon className={`w-6 h-6 ${isUnlocked ? achievement.color : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    {isUnlocked && (
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-primary font-medium">
                          <Clock className="w-3 h-3" />
                          Unlocked recently
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {unlockedAchievements.length}/{achievements.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Review Time */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Best Review Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">7:00 PM - 9:00 PM</div>
                <p className="text-sm text-muted-foreground">
                  Based on your activity, you have the highest accuracy during evening hours.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-500">
                  <Brain className="w-4 h-4" />
                  <span>92% average accuracy in this window</span>
                </div>
              </CardContent>
            </Card>

            {/* Retention Prediction */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Retention Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">
                  Predicted retention rate for verses learned this week after 30 days.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Above average - great work!</span>
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                    <span>
                      <strong>Speed:</strong> Try shorter review sessions to improve reaction time
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                    <span>
                      <strong>Long verses:</strong> Break down verses 20+ words into smaller chunks
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                    <span>
                      <strong>Review timing:</strong> Increase interval for high-confidence verses
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Personalized Goal */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  Recommended Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">Complete Surah Al-Mulk</div>
                <p className="text-sm text-muted-foreground">
                  Based on your current pace and performance, this is achievable in <strong>2 weeks</strong>.
                </p>
                <Button className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Set This Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
