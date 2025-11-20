'use client';

import { Moon, Sun, Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/useUIStore';
import { motion } from 'framer-motion';

export function Header() {
  const { resolvedTheme, toggleTheme, toggleSidebar } = useUIStore();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-primary-500/5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="container flex h-16 items-center justify-between px-4 relative z-10">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-2xl"
            >
              🌙
            </motion.span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-accent dark:from-primary-300 dark:via-primary-400 dark:to-accent bg-clip-text text-transparent hidden sm:block">
              Quran Memorizer
            </h1>
          </motion.div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex items-center gap-6"
        >
          {[
            { href: '/', label: 'Home' },
            { href: '/memorize', label: 'Memorize' },
            { href: '/review', label: 'Review' },
            { href: '/progress', label: 'Progress' },
            { href: '/community', label: 'Community' },
          ].map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="relative text-sm font-medium text-foreground/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </motion.nav>

        {/* Right: Theme Toggle & Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              className="hover:bg-primary-100/50 dark:hover:bg-primary-900/50 transition-colors"
            >
              <motion.div
                key={resolvedTheme}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5 text-accent" />
                ) : (
                  <Moon className="w-5 h-5 text-primary-600" />
                )}
              </motion.div>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}
