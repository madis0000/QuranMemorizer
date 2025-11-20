'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  condition?: () => boolean; // Optional condition to enable/disable shortcut
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: ' ', description: 'Start/Stop', action: toggleMic },
 *     { key: 'r', description: 'Reset', action: reset },
 *   ],
 *   enabled: true
 * });
 * ```
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      console.log('⌨️ [Keyboard] Key pressed:', event.key, 'repeat:', event.repeat);

      // Ignore repeated keydown events (when key is held down)
      if (event.repeat) {
        console.log('⌨️ [Keyboard] Ignoring repeated keydown');
        return;
      }

      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        console.log('⌨️ [Keyboard] Ignoring - typing in input/textarea');
        return;
      }

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        // Normalize key comparison (handle space specially)
        const eventKey = event.key === ' ' ? ' ' : event.key.toLowerCase();
        const shortcutKey = s.key === ' ' ? ' ' : s.key.toLowerCase();
        return eventKey === shortcutKey;
      });

      console.log('⌨️ [Keyboard] Matching shortcut found:', !!shortcut, shortcut?.description);

      if (shortcut) {
        // Check if condition is met (if specified)
        if (shortcut.condition && !shortcut.condition()) {
          console.log('⌨️ [Keyboard] Condition not met for:', shortcut.description);
          return;
        }

        console.log('⌨️ [Keyboard] Executing action for:', shortcut.description);

        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();

        // Execute action
        shortcut.action();
      } else {
        console.log('⌨️ [Keyboard] No matching shortcut for key:', event.key);
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);
}

/**
 * Format keyboard shortcut for display
 * @param key - The keyboard key
 * @returns Formatted display string
 */
export function formatShortcutKey(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'Escape': 'Esc',
    'Enter': '↵',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  };

  return keyMap[key] || key.toUpperCase();
}
