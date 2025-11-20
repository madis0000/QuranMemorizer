'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DemoDataButton } from '@/components/DemoDataButton';
import { GlassCard } from '@/components/GlassCard';
import { PageTransition, fadeInUp, staggerContainer } from '@/components/PageTransition';
import { Sparkles, Brain, Music, TrendingUp, Star, Zap } from 'lucide-react';

export default function Home() {
  return (
    <PageTransition>
      <main className="flex min-h-screen flex-col items-center justify-center p-8 py-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto text-center space-y-12"
        >
          {/* Logo/Icon - Enhanced */}
          <motion.div
            variants={fadeInUp}
            className="relative w-32 h-32 mx-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-accent flex items-center justify-center shadow-2xl shadow-primary-500/50"
            >
              <span className="text-6xl">🌙</span>
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 to-accent blur-2xl -z-10"
            />
          </motion.div>

          {/* Main heading - Enhanced */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-accent dark:from-primary-300 dark:via-primary-400 dark:to-accent bg-clip-text text-transparent leading-tight">
              Quran Memorizer
            </h1>
            <motion.p
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-medium arabic-text bg-gradient-to-r from-primary-600 to-accent dark:from-primary-400 dark:to-accent bg-clip-text text-transparent"
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </motion.p>
          </motion.div>

          {/* Description - Enhanced */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-foreground/80 dark:text-foreground/70 max-w-3xl mx-auto leading-relaxed"
          >
            Your AI-powered companion for memorizing the Holy Quran with scientifically-backed
            spaced repetition, beautiful recitations, and personalized learning paths.
          </motion.p>

          {/* Features grid - Enhanced */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <FeatureCard
              icon={<Brain className="w-12 h-12" />}
              title="Smart Learning"
              description="AI-powered spaced repetition algorithm adapts to your memory patterns"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Music className="w-12 h-12" />}
              title="Beautiful Recitations"
              description="Listen to world-class reciters with synchronized text"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Track Progress"
              description="Detailed analytics and insights into your memorization journey"
              gradient="from-green-500 to-emerald-500"
            />
          </motion.div>

          {/* CTA Buttons - Enhanced */}
          <motion.div
            variants={fadeInUp}
            className="pt-12 flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/review"
                className="group px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-lg font-semibold shadow-2xl shadow-primary-500/40 hover:shadow-primary-500/60 transition-all flex items-center gap-3 justify-center"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Review Session
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/demo"
                className="group px-10 py-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-gray-900/90 text-primary-700 dark:text-primary-300 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all border-2 border-white/20 dark:border-gray-800/50 flex items-center gap-3 justify-center"
              >
                <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                View Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Demo Data Button */}
          <motion.div variants={fadeInUp} className="pt-6">
            <DemoDataButton />
          </motion.div>

          {/* Status indicator - Enhanced */}
          <motion.div variants={fadeInUp} className="pt-12 space-y-3">
            <GlassCard className="inline-block px-8 py-4">
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                />
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-2">
                  Phase 2 Complete - Review System is Live!
                  <span className="text-lg">🎉</span>
                </p>
              </div>
            </GlassCard>
            <p className="text-xs text-muted-foreground">
              Click "Load Demo Data" above, then try the Review Session
            </p>
          </motion.div>
        </motion.div>
      </main>
    </PageTransition>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <GlassCard hover glow gradient className="group p-8 h-full">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-foreground/70 leading-relaxed">
          {description}
        </p>
      </motion.div>
    </GlassCard>
  );
}
