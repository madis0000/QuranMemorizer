'use client';

import { usePathname } from 'next/navigation';
import { TajweedRulesSettings } from '@/components/TajweedRulesSettings';
import { VoiceVerseDetector } from '@/components/VoiceVerseDetector';

export function FloatingButtons() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {isHomePage ? (
        // Show Voice Verse Detector on home page
        <VoiceVerseDetector />
      ) : (
        // Show Tajweed Rules Settings on other pages
        <TajweedRulesSettings />
      )}
    </>
  );
}
