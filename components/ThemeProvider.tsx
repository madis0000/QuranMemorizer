'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);
  }, []);

  return <>{children}</>;
}
