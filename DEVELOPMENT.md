# Development Guide - Quran Memorizer

Quick reference for development workflow, priorities, and next steps.

---

## 📋 Quick Links

- **[ROADMAP.md](./ROADMAP.md)** - Strategic product roadmap with phases and KPIs
- **[TODO.md](./TODO.md)** - Detailed, actionable task list with estimates
- **[README.md](./README.md)** - Project setup and documentation

---

## 🎯 Current Status: Phase 1 Complete! ✅

### What We've Built

#### ✅ Core Practice System (Speech Recognition)
- **Real-time speech recognition** for Arabic Quran recitation
- **Word-by-word matching** with Levenshtein distance algorithm
- **Multiple difficulty levels**: Easy, Medium, Hard
- **Strictness controls**: Lenient, Medium, Strict matching
- **Memory Challenge Mode**: Words hidden until pronounced correctly
- **Progressive hints system**: Shows letters gradually after failed attempts
- **Stuck word detection**: Beautiful modal with 5-second countdown + Retry/Reveal options
- **Duplicate word tracking**: Visual indicators for repeated words in verses
- **Perfect word tracking**: Celebrates first-try correct words
- **Auto-advance**: Automatically moves to next verse after completion
- **Audio playback**: Listen to correct recitation

#### ✅ Database & Persistence (PostgreSQL + Prisma)
- **Practice sessions**: Tracks every practice attempt with metrics
- **Verse progress**: Per-verse statistics and accuracy tracking
- **Daily statistics**: Aggregated daily practice data
- **User settings**: Persistent preferences across sessions
- **localStorage sync**: Client-side preferences backup

#### ✅ UI/UX Polish
- **Beautiful modal dialogs**: StuckWordModal with animations
- **Real-time visual feedback**: Color-coded word status
- **Responsive design**: Works on mobile and desktop
- **Dark mode support**: Full theming system
- **Framer Motion animations**: Smooth, professional transitions
- **Arabic text handling**: Proper RTL support and diacritic cleaning

---

## 🚀 Current Focus: Phase 2 - UX Enhancement

**Goal:** Make practice experience more engaging and informative
**Timeline:** 6 weeks
**Status:** 🚧 In Progress

### This Sprint (Weeks 1-2): Quick Wins

#### Priority Tasks
1. **Keyboard Shortcuts** ⏰ 4 hours
   - Space: Start/Stop mic
   - R: Reset practice
   - H: Hear audio
   - Enter: Next verse
   - Esc: Close
   - ?: Help overlay

2. **Session Summary Modal** ⏰ 1 day
   - Detailed breakdown after verse completion
   - Time spent per word
   - Words needing multiple attempts
   - Accuracy trend visualization
   - Confetti for perfect runs

3. **Better Audio Feedback** ⏰ 4 hours
   - Perfect word chime
   - Correct word ding
   - Stuck modal warning tone
   - Verse completion celebration

4. **Voice Confidence Indicator** ⏰ 6 hours
   - Real-time volume meter
   - Matching confidence display
   - "Too quiet" warnings
   - Background noise detection

---

## 📁 Project Structure

```
QuranMemorizer/
├── app/                          # Next.js 14 app router
│   ├── api/                      # API routes
│   │   ├── practice/             # Practice sessions ✅
│   │   │   └── route.ts
│   │   ├── progress/             # Verse progress ✅
│   │   │   └── route.ts
│   │   ├── settings/             # User settings ✅
│   │   │   └── route.ts
│   │   └── word-statistics/      # Word tracking 🔜
│   │       └── route.ts
│   ├── memorize/                 # Memorization pages ✅
│   │   ├── page.tsx
│   │   └── page/[pageNumber]/page.tsx
│   ├── insights/                 # Analytics dashboard 🔜
│   ├── review/                   # Review mode 🔜
│   ├── difficult-words/          # Difficult words 🔜
│   └── badges/                   # Achievements 🔜
├── components/
│   ├── ui/                       # shadcn/ui components ✅
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── PracticeMode.tsx          # Main practice component ✅
│   ├── StuckWordModal.tsx        # Stuck word dialog ✅
│   ├── SessionSummaryModal.tsx   # Session summary 🔜
│   ├── VoiceConfidenceIndicator.tsx 🔜
│   └── ...
├── lib/
│   ├── arabicUtils.ts            # Arabic processing ✅
│   │   ├── normalizeArabicText()
│   │   ├── cleanQuranicText()
│   │   ├── matchArabicWords()
│   │   ├── levenshteinDistance()
│   │   └── splitIntoWords()
│   ├── audioFeedback.ts          # Sound effects 🔜
│   ├── spacedRepetition.ts       # SRS algorithm 🔜
│   ├── wordStatistics.ts         # Word tracking 🔜
│   ├── patternAnalysis.ts        # Mistake patterns 🔜
│   └── prisma.ts                 # Prisma client ✅
├── prisma/
│   ├── schema.prisma             # Database schema ✅
│   └── migrations/               # Migrations ✅
├── hooks/
│   └── useKeyboardShortcuts.ts   # Keyboard handler 🔜
├── public/
│   └── sounds/                   # Audio files 🔜
│       ├── perfect.mp3
│       ├── correct.mp3
│       ├── stuck.mp3
│       └── complete.mp3
└── store/
    └── useMemorizationStore.ts   # Zustand store ✅
```

---

## 🗄 Database Schema

### Current Models ✅

#### PracticeSession
```prisma
model PracticeSession {
  id           String   @id @default(cuid())
  verseKey     String   // "2:1"
  accuracy     Float    // 0-100
  totalWords   Int
  correctWords Int
  duration     Int?
  perfectWords Int      @default(0)
  isMemoryMode Boolean  @default(false)
  difficulty   String?  // easy, medium, hard
  strictness   String?  // lenient, medium, strict
  createdAt    DateTime @default(now())
}
```

#### VerseProgress
```prisma
model VerseProgress {
  id              String   @id @default(cuid())
  verseKey        String   @unique
  totalAttempts   Int      @default(0)
  bestAccuracy    Float    @default(0)
  averageAccuracy Float    @default(0)
  lastPracticed   DateTime @updatedAt
  firstPracticed  DateTime @default(now())
  isPerfect       Boolean  @default(false)
  streak          Int      @default(0)
}
```

#### DailyStats
```prisma
model DailyStats {
  id              String   @id @default(cuid())
  date            DateTime @unique @db.Date
  versesPracticed Int      @default(0)
  totalWords      Int      @default(0)
  correctWords    Int      @default(0)
  practiceTime    Int      @default(0)
  averageAccuracy Float    @default(0)
}
```

#### UserSetting
```prisma
model UserSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   // JSON
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

### Planned Models 🔜

#### WordStatistic
```prisma
model WordStatistic {
  id              String   @id @default(cuid())
  word            String   // Normalized
  originalText    String
  totalAttempts   Int      @default(0)
  successfulFirst Int      @default(0)
  averageAttempts Float    @default(0)
  appearsInVerses String[]
  lastPracticed   DateTime @updatedAt
  masteryLevel    Float    @default(0)
}
```

#### DailyGoal
```prisma
model DailyGoal {
  id            String   @id @default(cuid())
  date          DateTime @unique @db.Date
  targetVerses  Int      @default(5)
  targetTime    Int?
  actualVerses  Int      @default(0)
  actualTime    Int      @default(0)
  completed     Boolean  @default(false)
}
```

#### UserStreak
```prisma
model UserStreak {
  id                  String   @id @default(cuid())
  currentStreak       Int      @default(0)
  longestStreak       Int      @default(0)
  lastPracticeDate    DateTime
  freezesAvailable    Int      @default(1)
  freezesUsedThisWeek Int      @default(0)
}
```

---

## 🚀 Development Workflow

### Starting a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/keyboard-shortcuts

# 2. Check TODO.md for detailed requirements

# 3. Update database schema if needed
npx prisma migrate dev --name add_feature_name

# 4. Implement feature with TypeScript

# 5. Test locally
npm run dev

# 6. Test on mobile view (Chrome DevTools)

# 7. Commit with conventional format
git add .
git commit -m "feat(practice): add keyboard shortcuts

- Implement Space, R, H, Enter, Esc shortcuts
- Add help overlay with ?
- Update PracticeMode component
- Create useKeyboardShortcuts hook

Closes #42"

# 8. Push
git push origin feature/keyboard-shortcuts
```

### Database Migrations

```bash
# After modifying schema.prisma
npx prisma migrate dev --name descriptive_name
npx prisma generate

# View database
npx prisma studio

# Reset database (DEV ONLY!)
npx prisma migrate reset
```

### Testing Checklist

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Run dev server
npm run dev

# Manual testing:
✓ Test on Chrome (desktop + mobile view)
✓ Test speech recognition
✓ Test keyboard shortcuts (after implementation)
✓ Check console for errors
✓ Test dark mode
✓ Verify database updates
```

---

## 🎨 Code Style & Patterns

### Component Structure

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction?: () => void;
}

export function Component({ prop1, prop2 = 10, onAction }: ComponentProps) {
  const [state, setState] = useState(false);

  useEffect(() => {
    // Side effects
  }, []);

  const handleClick = () => {
    setState(true);
    onAction?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="..."
    >
      <Button onClick={handleClick}>{prop1}</Button>
    </motion.div>
  );
}
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = await prisma.model.findUnique({
      where: { id },
    });

    if (!data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = await prisma.model.create({
      data: body,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Custom Hook Pattern

```typescript
'use client';

import { useState, useEffect } from 'react';

export function useCustomHook(param: string) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch logic
        setValue('result');
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [param]);

  return { value, loading, error };
}
```

---

## 🐛 Debugging Tips

### Speech Recognition Issues

```typescript
// Check browser support
const SpeechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition;
console.log('SR Available:', !!SpeechRecognition);

// Log detailed results
recognition.onresult = (event) => {
  console.log('Full event:', event);
  console.log('Confidence:', event.results[0][0].confidence);
  console.log('Is final:', event.results[0].isFinal);
};
```

### Database Queries

```typescript
// Enable query logging
// In prisma/schema.prisma:
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

### Performance Issues

```typescript
// Check re-renders
useEffect(() => {
  console.count('Component rendered');
});

// Memoize expensive calculations
const result = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, []);
```

---

## 📊 Key Metrics to Track

### User Engagement
- Daily Active Users (DAU)
- Average session duration
- Verses practiced per day
- Completion rate

### Learning Effectiveness
- Accuracy improvements over time
- Retention rate (via SRS)
- Perfect word percentage
- Time to verse mastery

### Feature Adoption
- Memory mode usage %
- Auto-advance enabled %
- Keyboard shortcut usage
- Review mode engagement

---

## 📚 Important Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Arabic Processing
- [Arabic Text Normalization](https://unicode.org/reports/tr15/)
- [Quranic Text Standards](https://tanzil.net/docs/unicode_symbols)

---

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ Complete duplicate word tracking
2. 🔄 Implement keyboard shortcuts
3. 🔄 Build session summary modal

### Short-term (Weeks 3-4)
1. Add audio feedback system
2. Create word statistics tracking
3. Build difficult words page
4. Add voice confidence indicator

### Medium-term (Weeks 5-8)
1. Implement spaced repetition algorithm
2. Add daily goals and streaks
3. Create insights dashboard
4. Build review mode

### Long-term (Weeks 9-16)
1. Achievement badges system
2. Multiple practice modes (Speed Run, Perfect Run)
3. PWA/offline support
4. Performance optimization

---

## 💡 Pro Tips

1. **TypeScript Strict Mode** - Catch bugs early
2. **Test on Real Devices** - Speech recognition behaves differently
3. **Optimize Performance** - Practice sessions need to be fast
4. **User Feedback First** - Build what users need
5. **Iterate Quickly** - Ship small, get feedback, improve
6. **Document Everything** - Future you will be grateful
7. **Keep It Simple** - Complexity kills execution

---

## 🤝 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance
- `perf`: Performance improvement

**Example:**
```
feat(practice): add keyboard shortcuts

- Implement Space, R, H, Enter, Esc shortcuts
- Add help overlay with ? key
- Update PracticeMode component
- Create useKeyboardShortcuts hook

Closes #42
```

---

## 📞 Need Help?

- Review **[TODO.md](./TODO.md)** for task details
- Check **[ROADMAP.md](./ROADMAP.md)** for strategy
- Search GitHub issues
- Check console logs for errors
- Use Prisma Studio to inspect database

---

**Current Phase:** Phase 2 - UX Enhancement 🚧
**Next Milestone:** Quick Wins Sprint (Weeks 1-2)
**Target:** Enhanced UX by Week 6

---

*Made with ❤️ for the Muslim Ummah*
*Last Updated: 2025-01-17*
