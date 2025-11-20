import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Theme
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';

  // UI State
  sidebarOpen: boolean;
  audioPlaying: boolean;
  currentReciter: string;
  playbackSpeed: number;

  // Audio Devices
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;

  // User preferences
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  arabicFont: 'uthmani' | 'simple'; // Uthmani (official Rasm) or Simple (modern)
  showTajweed: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
  translationLanguage: string;
  showDuplicateBadges: boolean; // Show duplicate word badges (1/2, 2/2)
  tajweedAssistantEnabled: boolean; // Enable real-time Tajweed pronunciation analysis
  enabledTajweedRules: {
    madd: boolean;
    qalqalah: boolean;
    ikhfa: boolean;
    idgham: boolean;
    iqlab: boolean;
    ghunnah: boolean;
  };

  // Notifications
  notificationsEnabled: boolean;
  reminderTime: string | null;

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setAudioPlaying: (playing: boolean) => void;
  setCurrentReciter: (reciter: string) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedMicrophone: (deviceId: string | null) => void;
  setSelectedSpeaker: (deviceId: string | null) => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  setArabicFont: (font: 'uthmani' | 'simple') => void;
  toggleTajweed: () => void;
  toggleTransliteration: () => void;
  toggleTranslation: () => void;
  setTranslationLanguage: (language: string) => void;
  toggleDuplicateBadges: () => void;
  toggleTajweedAssistant: () => void;
  toggleTajweedRule: (rule: keyof UIStore['enabledTajweedRules']) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      resolvedTheme: 'light',
      sidebarOpen: false,
      audioPlaying: false,
      currentReciter: 'ar.alafasy', // Abdul Rahman Al-Sudais
      playbackSpeed: 1,
      selectedMicrophone: null,
      selectedSpeaker: null,
      fontSize: 'medium',
      arabicFont: 'uthmani', // Default to Uthmani (official Quran script)
      showTajweed: true,
      showTransliteration: false,
      showTranslation: true,
      translationLanguage: 'en-sahih-international',
      showDuplicateBadges: false, // Default to OFF
      tajweedAssistantEnabled: false, // Default to OFF - user can enable in settings
      enabledTajweedRules: {
        madd: true,
        qalqalah: true,
        ikhfa: true,
        idgham: true,
        iqlab: true,
        ghunnah: true,
      },
      notificationsEnabled: false,
      reminderTime: null,

      // Theme actions
      setTheme: (theme) => {
        set({ theme });

        // Update resolved theme
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          set({ resolvedTheme: systemTheme });
        } else {
          set({ resolvedTheme: theme });
        }

        // Apply theme to document
        const root = document.documentElement;
        const resolvedTheme = get().resolvedTheme;
        if (resolvedTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const currentTheme = get().resolvedTheme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setAudioPlaying: (playing) => {
        set({ audioPlaying: playing });
      },

      setCurrentReciter: (reciter) => {
        set({ currentReciter: reciter });
      },

      setPlaybackSpeed: (speed) => {
        // Clamp between 0.5 and 2.0
        const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
        set({ playbackSpeed: clampedSpeed });
      },

      // Audio device actions
      setSelectedMicrophone: (deviceId) => {
        set({ selectedMicrophone: deviceId });
      },

      setSelectedSpeaker: (deviceId) => {
        set({ selectedSpeaker: deviceId });
      },

      // Display preferences
      setFontSize: (size) => {
        set({ fontSize: size });
      },

      setArabicFont: (font) => {
        set({ arabicFont: font });
      },

      toggleTajweed: () => {
        set((state) => ({ showTajweed: !state.showTajweed }));
      },

      toggleTransliteration: () => {
        set((state) => ({ showTransliteration: !state.showTransliteration }));
      },

      toggleTranslation: () => {
        set((state) => ({ showTranslation: !state.showTranslation }));
      },

      setTranslationLanguage: (language) => {
        set({ translationLanguage: language });
      },

      toggleDuplicateBadges: () => {
        set((state) => ({ showDuplicateBadges: !state.showDuplicateBadges }));
      },

      toggleTajweedAssistant: () => {
        set((state) => ({ tajweedAssistantEnabled: !state.tajweedAssistantEnabled }));
      },

      toggleTajweedRule: (rule) => {
        set((state) => ({
          enabledTajweedRules: {
            ...state.enabledTajweedRules,
            [rule]: !state.enabledTajweedRules[rule],
          },
        }));
      },

      // Notification actions
      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });

        // Request permission if enabling
        if (enabled && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      },

      setReminderTime: (time) => {
        set({ reminderTime: time });
      },
    }),
    {
      name: 'ui-storage', // localStorage key
    }
  )
);

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const store = useUIStore.getState();
  store.setTheme(store.theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (useUIStore.getState().theme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  });
}
