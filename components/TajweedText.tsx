'use client';

import React, { useMemo } from 'react';
import { applyTajweedColors } from '@/lib/tajweedDetector';

interface TajweedTextProps {
  text: string;
  hasTajweed: boolean;
  className?: string;
}

/**
 * Component to render Quranic text with Tajweed highlighting
 *
 * Tajweed colors from Quran.com API:
 * - Idgham (Ghunnah) - Red/Pink (#d500b7)
 * - Ikhfa - Green (#169777)
 * - Iqlab - Orange (#ff7e1e)
 * - Qalqalah - Blue (#0088ff)
 * - Sukun/Silent - Gray (#aaaaaa)
 * - Madd (prolongation) - Red (#ff0000)
 */
export function TajweedText({ text, hasTajweed, className = '' }: TajweedTextProps) {
  // Parse and transform Tajweed markup
  const processedText = useMemo(() => {
    if (!text) return '';

    if (!hasTajweed) {
      return text;
    }

    // Check if text contains HTML markup from API (Uthmani Tajweed)
    const hasHTMLMarkup = /<tajweed|<span/.test(text);

    console.log('🔍 [TajweedText] ==================');
    console.log('🔍 [TajweedText] Text preview:', text.substring(0, 200));
    console.log('🔍 [TajweedText] Text length:', text.length);
    console.log('🔍 [TajweedText] Has HTML markup:', hasHTMLMarkup);
    console.log('🔍 [TajweedText] Tajweed enabled:', hasTajweed);
    console.log('🔍 [TajweedText] Contains <tajweed>:', text.includes('<tajweed'));
    console.log('🔍 [TajweedText] Contains class=:', text.includes('class='));

    if (hasHTMLMarkup) {
      console.log('📝 [TajweedText] Using API-provided markup');
      // Use API-provided markup (Uthmani with Tajweed tags)
      // Map Tajweed rule classes to colors
      const colorMap: Record<string, string> = {
        'ham_wasl': '#d500b7',
        'madda_normal': '#d500b7',
        'madda_permissible': '#d500b7',
        'madda_necessary': '#d500b7',
        'madda_obligatory': '#ff0000',
        'silent': '#aaaaaa',
        'lam_shamsiyah': '#aaaaaa',
        'laam_shamsiyah': '#aaaaaa', // Alternative spelling with double 'a'
        'ikhfa_shafawi': '#169777',
        'ikhfa': '#169777',
        'ikhafa': '#169777', // Alternative spelling (from database)
        'ikhafa_shafawi': '#169777', // Alternative spelling (from database)
        'iqlab': '#ff7e1e',
        'qalaqala': '#0088ff',
        'qalqalah': '#0088ff', // Alternative spelling
        'qalaqah': '#0088ff', // Alternative spelling (from database)
        'ghunna': '#ff69b4',
        'sukun': '#aaaaaa',
        'idgham_wo_ghunnah': '#aaaaaa',
        'idgham_ghunnah': '#d500b7',
        'idgham_shafawi': '#ff69b4',
        'idgham_mutajanisayn': '#d500b7',
        'idgham_mutaqaribayn': '#d500b7',
        'slnt': '#aaaaaa'
      };

      let processed = text;

      console.log('📝 [TajweedText] Starting API markup processing');

      // Handle all tajweed tags (including nested content)
      // Support both class="value" and class=value formats
      let matchCount = 0;
      processed = processed.replace(
        /<tajweed\s+class=["']?([^"'\s>]+)["']?[^>]*>(.*?)<\/tajweed>/gs,
        (match, className, content) => {
          matchCount++;
          console.log(`  🎨 Match ${matchCount}: class="${className}", content="${content.substring(0, 20)}"`);

          let color = '';
          for (const [key, value] of Object.entries(colorMap)) {
            if (className.toLowerCase().includes(key)) {
              color = value;
              console.log(`    ✅ Matched rule: ${key} -> ${color}`);
              break;
            }
          }

          if (color) {
            return `<span style="color: ${color} !important;">${content}</span>`;
          }
          console.log(`    ⚠️  No color match for class: ${className}`);
          return content;
        }
      );

      console.log(`📝 [TajweedText] Processed ${matchCount} tajweed tags`);

      // Also handle any remaining <span> tags with classes
      // Support both class="value" and class=value formats
      processed = processed.replace(
        /<span\s+class=["']?([^"'\s>]+)["']?[^>]*>(.*?)<\/span>/gs,
        (match, className, content) => {
          let color = '';
          for (const [key, value] of Object.entries(colorMap)) {
            if (className.toLowerCase().includes(key)) {
              color = value;
              break;
            }
          }

          if (color) {
            return `<span style="color: ${color} !important;">${content}</span>`;
          }
          return `<span>${content}</span>`;
        }
      );

      console.log('📝 [TajweedText] Final processed preview:', processed.substring(0, 200));
      return processed;
    } else {
      console.log('🤖 [TajweedText] Using programmatic detection (no HTML markup found)');
      // Use programmatic Tajweed detection (for Simple text or plain Uthmani)
      // This works with both Uthmani and Simple scripts!
      const result = applyTajweedColors(text, true);
      console.log('🤖 [TajweedText] Programmatic result preview:', result.substring(0, 100));
      return result;
    }
  }, [text, hasTajweed]);

  if (!text) {
    return null;
  }

  // If Tajweed is enabled, render the processed HTML
  if (hasTajweed) {
    return (
      <div
        className={`tajweed-text ${className}`}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  }

  // Otherwise render as plain text
  return <div className={className}>{text}</div>;
}
