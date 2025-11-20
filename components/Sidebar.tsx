'use client';

import { X, Home, Book, Sparkles, RotateCcw, TrendingUp, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Book, label: 'Memorize', href: '/memorize' },
  { icon: Sparkles, label: 'Tajweed', href: '/tajweed' },
  { icon: RotateCcw, label: 'Review', href: '/review' },
  { icon: TrendingUp, label: 'Progress', href: '/progress' },
  { icon: Users, label: 'Community', href: '/community' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transition-transform duration-300 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <h2 className="font-bold text-primary-700 dark:text-primary-300">
              Quran Memorizer
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-foreground/80 hover:bg-accent hover:text-foreground"
              onClick={() => toggleSidebar()}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-xs text-center text-muted-foreground">
            <p>Made with ❤️ for Muslims worldwide</p>
            <p className="mt-1 arabic-text text-sm">بِسْمِ اللَّهِ</p>
          </div>
        </div>
      </aside>
    </>
  );
}
