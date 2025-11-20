# Quran Memorizer - Detailed TODO List

This document contains actionable tasks organized by priority, with estimated effort and dependencies.

---

## ✅ RECENTLY COMPLETED

### Tajweed Audio Analysis & Feedback System (January 19, 2025)
**Effort:** 1 day | **Impact:** Very High | **Status:** ✅ Complete

**Phase 1: Toast Feedback UI Improvements**
- [x] Repositioned toast notifications above purple settings button (`bottom-24`)
- [x] Extended auto-dismiss duration from 4s to 5s for better readability
- [x] Added smoother exit animation (0.4s duration with ease-out curve)

**Phase 2: Algorithm Enhancements**
- [x] Rewrote all 5 Tajweed analysis algorithms with Gaussian scoring curves:
  - [x] **Madd (Elongation)**: Multi-factor analysis with duration (35%), volume (25%), smoothness (30%), clarity (10%), and steadiness bonus
  - [x] **Qalqalah (Bounce)**: Intensity-focused (50%) with duration scoring and non-nasal bonus
  - [x] **Ikhfa (Hiding)**: Nasality-weighted (60%) with moderate intensity targeting
  - [x] **Idgham (Merging)**: Smoothness-focused (40%) with clarity and volume metrics
  - [x] **Ghunnah (Nasalization)**: Nasality-critical (60%) with duration and volume validation
- [x] Implemented lenient tolerances (50% for Madd, wide ranges for others)
- [x] Added detailed console logging with score breakdowns for debugging

**Phase 3: Critical Bug Fixes**
- [x] Fixed Madd 0% accuracy bug (double `stopRecording()` call issue)
  - Changed `analyzeMadd()` to accept `audioMetrics` as parameter
  - Removed internal `stopRecording()` call that was returning empty metrics
- [x] Fixed Madd detection for words with multiple tajweed tags
  - Implemented priority-based extraction system (Madd: 10, Qalqalah: 9, etc.)
  - Changed to extract ALL tajweed rules per word, not just first one
  - Added `detectTajweedRule` import to TajweedAssistant
- [x] Fixed missing import error causing runtime crash

**Files Modified:**
- `components/TajweedFeedbackToast.tsx` - Toast positioning and animations
- `components/TajweedAssistant.tsx` - Priority-based rule extraction with multi-tag support
- `lib/audioAnalysis.ts` - Complete algorithm rewrite with Gaussian curves
- `hooks/useTajweedAudioAnalysis.ts` - Fixed audioMetrics passing to analyzeMadd

**Impact:**
- Users now receive accurate, real-time Tajweed feedback with proper scoring
- Madd rules are correctly detected even when multiple tajweed tags exist in one word
- Toast notifications are positioned correctly and stay visible long enough to read
- All 5 major Tajweed rules (Madd, Qalqalah, Ikhfa, Idgham, Ghunnah) have scientifically-tuned algorithms

**Known Limitations:**
- Algorithms may require further tuning based on real-world pronunciation variations
- Audio analysis accuracy depends on microphone quality and environment noise
- Nasality and clarity detection are approximations based on frequency analysis

---

### Tajweed Practice Features (January 19, 2025)
**Effort:** 2 days | **Impact:** High | **Status:** ✅ Complete

- [x] Implemented complete Tajweed color-coding system with 6 main rule colors
- [x] Created HTML tag conversion utility (`applyTajweedColorsToHtml`)
- [x] Enhanced practice area with white background and black text for visibility
- [x] Added Tajweed color legend/reference guide below practice area
- [x] Implemented duplicate word badges toggle in settings (default OFF)
- [x] Fixed verse number filtering from word counting
- [x] Implemented verse number circles with accurate position tracking
- [x] Added multi-verse support with proper marker extraction
- [x] Ensured dark mode support throughout all new features

**Files Modified:**
- `lib/tajweedHtmlUtils.ts` - Core Tajweed utilities
- `components/PracticeMode.tsx` - Practice interface
- `store/useUIStore.ts` - Global state management
- `components/CompactParametersPanel.tsx` - Settings panel
- `app/globals.css` - Styling

**Impact:** Users can now practice with full Tajweed color-coding, improving learning accuracy and Quranic recitation quality. Verse numbers no longer interfere with memorization flow.

**Full Documentation:** See [TAJWEED_IMPLEMENTATION_COMPLETE.md](TAJWEED_IMPLEMENTATION_COMPLETE.md)

---

## 🔥 PRIORITY 1: Quick Wins (Do First)

### 1.1 - Keyboard Shortcuts System
**Effort:** 4 hours | **Priority:** P0 | **Impact:** High

- [ ] Create keyboard shortcut handler hook (`useKeyboardShortcuts.ts`)
- [ ] Implement shortcuts in PracticeMode:
  - [ ] `Space` - Start/Stop microphone
  - [ ] `R` - Reset practice
  - [ ] `H` - Hear correct recitation (if available)
  - [ ] `Enter` - Next verse (when complete)
  - [ ] `Esc` - Close practice mode
  - [ ] `?` - Show keyboard shortcuts help
- [ ] Add keyboard shortcuts indicator overlay
- [ ] Add tooltip hints showing shortcuts
- [ ] Test cross-browser compatibility
- [ ] Add to user instructions

**Files to modify:**
- `hooks/useKeyboardShortcuts.ts` (NEW)
- `components/PracticeMode.tsx`

---

### 1.2 - Session Summary Modal
**Effort:** 1 day | **Priority:** P0 | **Impact:** High

#### 1.2.1 - Create SessionSummaryModal Component
- [ ] Create `components/SessionSummaryModal.tsx`
- [ ] Design beautiful modal layout with stats
- [ ] Add confetti animation for perfect runs
- [ ] Include breakdown:
  - [ ] Total time spent
  - [ ] Words requiring multiple attempts
  - [ ] Accuracy trend chart
  - [ ] Perfect words count
  - [ ] Suggestions for improvement

#### 1.2.2 - Track Session Data
- [ ] Add session data tracking to PracticeMode state:
  - [ ] Word-level attempt history
  - [ ] Time spent per word
  - [ ] Stuck words list
  - [ ] Hints used count
- [ ] Calculate session statistics
- [ ] Format data for display

#### 1.2.3 - Integrate with PracticeMode
- [ ] Show modal after verse completion
- [ ] Add "View Summary" button
- [ ] Add "Share Achievement" option (future)
- [ ] Allow retry from summary

**Files to create:**
- `components/SessionSummaryModal.tsx`
- `components/ui/confetti.tsx` (animation)

**Files to modify:**
- `components/PracticeMode.tsx`

---

### 1.3 - Better Audio Feedback
**Effort:** 4 hours | **Priority:** P0 | **Impact:** Medium

- [ ] Create audio feedback utility (`lib/audioFeedback.ts`)
- [ ] Generate/source sound files:
  - [ ] Perfect word chime (pleasant, celebratory)
  - [ ] Correct word ding (soft, positive)
  - [ ] Stuck modal warning (gentle)
  - [ ] Verse complete celebration (triumphant)
  - [ ] Optional: "أحسنت" (Ahsant) voice clip
- [ ] Implement audio playback with volume control
- [ ] Add user preference for sound effects
- [ ] Cache audio files for performance
- [ ] Test on different devices

**Files to create:**
- `lib/audioFeedback.ts`
- `public/sounds/` (directory with audio files)

**Files to modify:**
- `components/PracticeMode.tsx`
- `app/api/settings/route.ts` (for sound preferences)

---

### 1.4 - Voice Confidence Indicator
**Effort:** 6 hours | **Priority:** P1 | **Impact:** Medium

- [ ] Create confidence visualization component
- [ ] Add real-time volume meter
- [ ] Show matching confidence:
  - [ ] 🟢 Green: High confidence match
  - [ ] 🟡 Yellow: Uncertain (might need repeat)
  - [ ] 🔴 Red: Low confidence/likely incorrect
  - [ ] 🔇 Gray: No audio detected
- [ ] Use speech recognition confidence scores
- [ ] Add "Too quiet" warning
- [ ] Add "Background noise detected" warning
- [ ] Smooth animations for transitions

**Files to create:**
- `components/VoiceConfidenceIndicator.tsx`

**Files to modify:**
- `components/PracticeMode.tsx`
- `lib/arabicUtils.ts` (add confidence scoring)

---

### 1.5 - Practice Timer Display
**Effort:** 2 hours | **Priority:** P1 | **Impact:** Low

- [ ] Add visible timer showing session duration
- [ ] Display time per verse
- [ ] Show average time per word
- [ ] Add pause/resume timer functionality
- [ ] Store timing data in session summary
- [ ] Format time display (MM:SS)

**Files to modify:**
- `components/PracticeMode.tsx`

---

## 🎯 PRIORITY 2: Analytics & Insights

### 2.1 - Word Trouble Tracking System
**Effort:** 2 days | **Priority:** P0 | **Impact:** High

#### 2.1.1 - Database Schema
- [ ] Create Prisma model for `WordStatistic`:
  ```prisma
  model WordStatistic {
    id              String   @id @default(cuid())
    word            String   // Normalized Arabic word
    originalText    String   // Original with diacritics
    totalAttempts   Int      @default(0)
    successfulFirst Int      @default(0) // First-try success
    averageAttempts Float    @default(0)
    appearsInVerses String[] // Array of verse keys
    lastPracticed   DateTime @updatedAt
    masteryLevel    Float    @default(0) // 0-100

    @@index([word])
    @@index([masteryLevel])
  }
  ```
- [ ] Run Prisma migration
- [ ] Update Prisma client

#### 2.1.2 - API Endpoints
- [ ] Create `/api/word-statistics/route.ts`:
  - [ ] POST - Update word statistics
  - [ ] GET - Retrieve word statistics (with filters)
  - [ ] GET `/difficult` - Top difficult words
  - [ ] GET `/mastered` - Mastered words
- [ ] Add batch update endpoint
- [ ] Add analytics endpoint

#### 2.1.3 - Tracking Integration
- [ ] Integrate word tracking into PracticeMode
- [ ] Track each word attempt with context
- [ ] Calculate mastery level algorithm
- [ ] Update statistics after each session
- [ ] Add background sync for performance

#### 2.1.4 - Difficult Words View
- [ ] Create "Difficult Words" page (`app/difficult-words/page.tsx`)
- [ ] Display list with:
  - [ ] Word text (Arabic)
  - [ ] Mastery percentage
  - [ ] Attempts count
  - [ ] Verses where it appears
  - [ ] "Practice Now" button
- [ ] Add filtering and sorting
- [ ] Add search functionality

**Files to create:**
- `prisma/migrations/XXX_add_word_statistics.sql`
- `app/api/word-statistics/route.ts`
- `app/difficult-words/page.tsx`
- `components/WordStatisticsCard.tsx`
- `lib/wordStatistics.ts`

**Files to modify:**
- `prisma/schema.prisma`
- `components/PracticeMode.tsx`

---

### 2.2 - Mistake Pattern Analysis
**Effort:** 2 days | **Priority:** P1 | **Impact:** Medium

#### 2.2.1 - Pattern Detection Engine
- [ ] Create pattern analysis utility (`lib/patternAnalysis.ts`)
- [ ] Detect common patterns:
  - [ ] Letter confusion (و vs ي)
  - [ ] Diacritic skipping
  - [ ] Performance by time of day
  - [ ] Performance by verse length
  - [ ] Accuracy degradation over session
- [ ] Statistical analysis algorithms
- [ ] Trend detection

#### 2.2.2 - Insights Dashboard
- [ ] Create insights page (`app/insights/page.tsx`)
- [ ] Visualizations with charts:
  - [ ] Performance trend over time
  - [ ] Common mistake heatmap
  - [ ] Time-of-day performance
  - [ ] Accuracy by verse length
- [ ] Actionable recommendations
- [ ] Export insights as PDF/image

#### 2.2.3 - Real-time Suggestions
- [ ] Add inline suggestions during practice
- [ ] "You tend to confuse these letters" warnings
- [ ] Best practice time recommendations
- [ ] Break reminders for long sessions

**Files to create:**
- `lib/patternAnalysis.ts`
- `app/insights/page.tsx`
- `components/InsightCard.tsx`
- `components/charts/` (chart components)

**Files to modify:**
- `components/PracticeMode.tsx`

---

### 2.3 - Performance Visualization
**Effort:** 1.5 days | **Priority:** P1 | **Impact:** Medium

- [ ] Install charting library (recharts or visx)
- [ ] Create chart components:
  - [ ] Accuracy trend line chart
  - [ ] Practice frequency calendar heatmap
  - [ ] Word mastery progress bars
  - [ ] Session duration histogram
- [ ] Add date range filters
- [ ] Add export as image feature
- [ ] Responsive design for mobile

**Files to create:**
- `components/charts/AccuracyTrendChart.tsx`
- `components/charts/PracticeCalendarHeatmap.tsx`
- `components/charts/MasteryProgressChart.tsx`

**Dependencies:**
```bash
npm install recharts
npm install @types/recharts -D
```

---

## 🏃 PRIORITY 3: Practice Mode Variations

### 3.1 - Speed Run Mode
**Effort:** 1 day | **Priority:** P1 | **Impact:** Medium

- [ ] Add "Speed Run" option to practice settings
- [ ] Display timer prominently
- [ ] Track best times per verse
- [ ] Show countdown timer
- [ ] Display leaderboard (personal records)
- [ ] Add time bonuses for perfect words
- [ ] Show "New Record!" celebration
- [ ] Store best times in database

**Files to create:**
- `components/SpeedRunTimer.tsx`
- `app/api/leaderboard/route.ts`

**Files to modify:**
- `components/PracticeMode.tsx`
- `prisma/schema.prisma` (add bestTime field)

---

### 3.2 - Perfect Run Challenge
**Effort:** 6 hours | **Priority:** P1 | **Impact:** Medium

- [ ] Add "Perfect Run" mode toggle
- [ ] Require all words on first try
- [ ] Auto-fail on any mistake (with restart option)
- [ ] Track perfect run statistics
- [ ] Special badge for perfect verses
- [ ] Streak counter for consecutive perfects
- [ ] Celebratory animations

**Files to modify:**
- `components/PracticeMode.tsx`
- `prisma/schema.prisma`

---

### 3.3 - Review Mode (Previously Practiced)
**Effort:** 1 day | **Priority:** P1 | **Impact:** High

- [ ] Create review mode page (`app/review/page.tsx`)
- [ ] Filter verses by:
  - [ ] Last practiced date
  - [ ] Accuracy level
  - [ ] Never achieved 100%
  - [ ] Practiced > N times
- [ ] Smart sorting by need for review
- [ ] "Quick Review" button (random selection)
- [ ] Review queue management

**Files to create:**
- `app/review/page.tsx`
- `components/ReviewQueue.tsx`

---

### 3.4 - Challenge Mode (Random + No Hints)
**Effort:** 4 hours | **Priority:** P2 | **Impact:** Low

- [ ] Random verse selection
- [ ] Disable all hints and timers
- [ ] Hardcore difficulty
- [ ] No stuck word modal (or optional)
- [ ] Achievement badges for challenges completed

**Files to modify:**
- `components/PracticeMode.tsx`

---

### 3.5 - Relaxed Mode (No Pressure)
**Effort:** 3 hours | **Priority:** P2 | **Impact:** Low

- [ ] Disable all timers
- [ ] Remove attempt counters
- [ ] Unlimited hints
- [ ] Gentle, encouraging feedback
- [ ] Optional background music
- [ ] Focus on learning, not performance

**Files to modify:**
- `components/PracticeMode.tsx`

---

## 🧠 PRIORITY 4: Spaced Repetition System

### 4.1 - SRS Algorithm Implementation
**Effort:** 3 days | **Priority:** P0 | **Impact:** Very High

#### 4.1.1 - Core Algorithm
- [ ] Research SRS algorithms (SM-2, SM-18, or Anki algorithm)
- [ ] Implement chosen algorithm (`lib/spacedRepetition.ts`)
- [ ] Calculate next review date based on:
  - [ ] Current interval
  - [ ] Ease factor
  - [ ] Accuracy of last review
  - [ ] Total reviews
- [ ] Handle first-time vs review scheduling
- [ ] Implement forgetting curve model

#### 4.1.2 - Database Schema
- [ ] Update VerseProgress model:
  ```prisma
  model VerseProgress {
    // ... existing fields
    srsInterval      Int      @default(1) // Days until next review
    easeFactor       Float    @default(2.5)
    nextReviewDate   DateTime?
    consecutiveCorrect Int    @default(0)
    srsStage         String   @default("new") // new, learning, review, mastered
  }
  ```
- [ ] Run migration

#### 4.1.3 - Review Queue System
- [ ] Create review queue API (`/api/review-queue/route.ts`)
- [ ] Calculate verses due for review
- [ ] Prioritize by:
  - [ ] Overdue reviews (highest priority)
  - [ ] Difficulty level
  - [ ] User preferences
- [ ] Limit daily reviews (configurable)
- [ ] Smart scheduling to avoid overload

#### 4.1.4 - UI Integration
- [ ] Add "Due for Review" badge on verse cards
- [ ] Create review dashboard
- [ ] Show review countdown
- [ ] Display SRS statistics
- [ ] Add "Start Review Session" button
- [ ] Show daily review quota

**Files to create:**
- `lib/spacedRepetition.ts`
- `app/api/review-queue/route.ts`
- `app/review-dashboard/page.tsx`
- `components/ReviewBadge.tsx`

**Files to modify:**
- `prisma/schema.prisma`
- `app/api/practice/route.ts`
- `components/PracticeMode.tsx`

---

### 4.2 - Smart Practice Recommendations
**Effort:** 1.5 days | **Priority:** P1 | **Impact:** High

- [ ] Create recommendation engine (`lib/recommendations.ts`)
- [ ] Analyze user data:
  - [ ] SRS due dates
  - [ ] Weak spots (low accuracy words)
  - [ ] Practice history patterns
  - [ ] User goals and preferences
- [ ] Generate personalized suggestions:
  - [ ] "5 verses due for review today"
  - [ ] "Practice these difficult words"
  - [ ] "Complete Surah Al-Fatiha (2 verses left)"
  - [ ] "You're close to mastering Surah X"
- [ ] Display on dashboard
- [ ] Push notifications (future)

**Files to create:**
- `lib/recommendations.ts`
- `components/RecommendationCard.tsx`

---

## 📅 PRIORITY 5: Daily Goals & Streaks

### 5.1 - Goal Setting System
**Effort:** 2 days | **Priority:** P1 | **Impact:** High

#### 5.1.1 - Goals Database
- [ ] Create Goal model:
  ```prisma
  model DailyGoal {
    id              String   @id @default(cuid())
    date            DateTime @unique @db.Date
    targetVerses    Int      @default(5)
    targetTime      Int?     // Minutes
    actualVerses    Int      @default(0)
    actualTime      Int      @default(0)
    completed       Boolean  @default(false)
    createdAt       DateTime @default(now())

    @@index([date])
  }
  ```
- [ ] Migration

#### 5.1.2 - Goal Management API
- [ ] Create `/api/goals/route.ts`
- [ ] Endpoints:
  - [ ] POST - Set daily goal
  - [ ] GET - Get today's progress
  - [ ] PUT - Update progress
  - [ ] GET `/history` - Goal history

#### 5.1.3 - Goal Tracking UI
- [ ] Goal setting modal
- [ ] Progress bar widget
- [ ] Daily goal card on dashboard
- [ ] Goal completion celebration
- [ ] Weekly goal summary

**Files to create:**
- `app/api/goals/route.ts`
- `components/DailyGoalCard.tsx`
- `components/GoalSettingModal.tsx`

**Files to modify:**
- `prisma/schema.prisma`
- `components/PracticeMode.tsx` (track progress)

---

### 5.2 - Streak System
**Effort:** 2 days | **Priority:** P1 | **Impact:** High

#### 5.2.1 - Streak Logic
- [ ] Implement streak calculation (`lib/streaks.ts`)
- [ ] Track consecutive practice days
- [ ] Handle timezone issues correctly
- [ ] Calculate longest streak
- [ ] Streak freeze feature (1 per week)

#### 5.2.2 - Streak Database
- [ ] Create Streak model:
  ```prisma
  model UserStreak {
    id              String   @id @default(cuid())
    currentStreak   Int      @default(0)
    longestStreak   Int      @default(0)
    lastPracticeDate DateTime
    freezesAvailable Int     @default(1)
    freezesUsedThisWeek Int  @default(0)
    updatedAt       DateTime @updatedAt

    @@index([lastPracticeDate])
  }
  ```

#### 5.2.3 - Calendar View
- [ ] Create calendar heatmap component
- [ ] Show practice days
- [ ] Mark streak days
- [ ] Show freeze days
- [ ] Interactive tooltips with daily stats

#### 5.2.4 - Streak UI Elements
- [ ] 🔥 Flame icon with streak count
- [ ] Streak milestone celebrations
- [ ] Warning when streak at risk
- [ ] Freeze button (when available)
- [ ] Motivational messages

**Files to create:**
- `lib/streaks.ts`
- `components/StreakDisplay.tsx`
- `components/PracticeCalendar.tsx`
- `components/StreakFreezeModal.tsx`

**Files to modify:**
- `prisma/schema.prisma`
- `app/api/practice/route.ts`

---

### 5.3 - Motivational System
**Effort:** 1 day | **Priority:** P2 | **Impact:** Medium

- [ ] Collection of motivational quotes (Quranic + general)
- [ ] Display random quote on:
  - [ ] Dashboard load
  - [ ] After verse completion
  - [ ] When streak milestone reached
  - [ ] When goal achieved
- [ ] Encouraging messages for struggles
- [ ] Celebration messages for achievements
- [ ] Multilingual support

**Files to create:**
- `lib/motivationalMessages.ts`
- `components/MotivationalQuote.tsx`

---

## 🎮 PRIORITY 6: Gamification

### 6.1 - Achievement Badges System
**Effort:** 3 days | **Priority:** P2 | **Impact:** Medium

#### 6.1.1 - Badge Definitions
- [ ] Define achievement badges:
  - [ ] First Steps (complete first verse)
  - [ ] Memory Master (10 perfect verses)
  - [ ] Consistent Learner (7-day streak)
  - [ ] Speed Demon (complete verse under 60s)
  - [ ] Word Warrior (master 100 difficult words)
  - [ ] Surah Complete (complete entire surah)
  - [ ] Night Owl (practice after 10 PM)
  - [ ] Early Bird (practice before 7 AM)
  - [ ] Century (100 verses practiced)
  - [ ] ...etc (50+ badges total)

#### 6.1.2 - Badge Database
- [ ] Create models:
  ```prisma
  model Badge {
    id          String @id @default(cuid())
    key         String @unique
    name        String
    description String
    icon        String
    tier        String // bronze, silver, gold, platinum
    criteria    Json   // Achievement criteria
  }

  model UserBadge {
    id          String   @id @default(cuid())
    badgeKey    String
    unlockedAt  DateTime @default(now())

    @@index([badgeKey])
  }
  ```

#### 6.1.3 - Badge Detection
- [ ] Create badge checker (`lib/badgeChecker.ts`)
- [ ] Check after each practice session
- [ ] Unlock animation and notification
- [ ] Badge showcase page

#### 6.1.4 - Badge Display
- [ ] Badges page with grid
- [ ] Locked/unlocked states
- [ ] Progress bars for partial achievements
- [ ] Rarity indicators
- [ ] Share badge feature

**Files to create:**
- `prisma/migrations/XXX_add_badges.sql`
- `app/api/badges/route.ts`
- `app/badges/page.tsx`
- `lib/badgeChecker.ts`
- `components/BadgeUnlockModal.tsx`
- `components/BadgeCard.tsx`

---

### 6.2 - Leveling System
**Effort:** 2 days | **Priority:** P2 | **Impact:** Medium

- [ ] Define level system (1-100)
- [ ] XP calculation formula:
  - [ ] +10 XP per verse completed
  - [ ] +5 XP per perfect word
  - [ ] +20 XP for verse perfected (100% accuracy)
  - [ ] +50 XP for daily goal completed
  - [ ] Bonus XP for streaks
- [ ] Level-up threshold calculation
- [ ] Level-up celebrations
- [ ] Display level and XP on profile
- [ ] Level benefits/unlocks

**Files to create:**
- `lib/leveling.ts`
- `components/LevelDisplay.tsx`
- `components/XPBar.tsx`

**Files to modify:**
- `prisma/schema.prisma` (add level/XP fields)
- `app/api/practice/route.ts`

---

### 6.3 - Leaderboards (Optional)
**Effort:** 2 days | **Priority:** P3 | **Impact:** Low

- [ ] Create leaderboard system
- [ ] Categories:
  - [ ] Most verses this week
  - [ ] Highest accuracy
  - [ ] Longest streak
  - [ ] Fastest completions
- [ ] Anonymous/opt-in
- [ ] Friend leaderboards
- [ ] Global leaderboards
- [ ] Reset cycles (daily/weekly/monthly)

**Files to create:**
- `app/api/leaderboard/route.ts`
- `app/leaderboard/page.tsx`

---

## 🎨 PRIORITY 7: UI Polish & Accessibility

### 7.1 - Dark Mode Optimization
**Effort:** 1 day | **Priority:** P2 | **Impact:** Medium

- [ ] Review all colors in dark mode
- [ ] Optimize contrast ratios
- [ ] Fix any unreadable text
- [ ] Adjust shadow and borders
- [ ] Test on different screens
- [ ] Add smooth theme transitions

**Files to modify:**
- `app/globals.css`
- All component files

---

### 7.2 - Responsive Design Review
**Effort:** 1.5 days | **Priority:** P2 | **Impact:** High

- [ ] Test on mobile devices (iOS/Android)
- [ ] Tablet optimization
- [ ] Small laptop screens (1366x768)
- [ ] Touch gesture support
- [ ] Mobile keyboard handling
- [ ] Fix any layout issues

---

### 7.3 - Loading States & Skeletons
**Effort:** 1 day | **Priority:** P2 | **Impact:** Medium

- [ ] Add skeleton loaders for all pages
- [ ] Loading spinners for async operations
- [ ] Optimistic UI updates
- [ ] Error boundaries
- [ ] Retry mechanisms
- [ ] Offline indicators

**Files to create:**
- `components/skeletons/` (skeleton components)
- `components/ErrorBoundary.tsx`

---

### 7.4 - Accessibility (a11y)
**Effort:** 2 days | **Priority:** P2 | **Impact:** High

- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation testing
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] High contrast mode support
- [ ] Font size controls
- [ ] Reduced motion preferences
- [ ] Alt text for all images
- [ ] Form validation accessibility

---

## 🚀 PRIORITY 8: Advanced Features

### 8.1 - Offline Support (PWA)
**Effort:** 3 days | **Priority:** P2 | **Impact:** High

- [ ] Configure Next.js for PWA
- [ ] Create service worker
- [ ] Cache verses and audio offline
- [ ] Offline indicator UI
- [ ] Sync queue for offline actions
- [ ] Background sync when online
- [ ] Install prompt
- [ ] App manifest configuration

**Dependencies:**
```bash
npm install next-pwa
```

**Files to create:**
- `public/manifest.json`
- `public/sw.js`
- `lib/offlineSync.ts`

**Files to modify:**
- `next.config.js`

---

### 8.2 - Multiple Reciter Support
**Effort:** 2 days | **Priority:** P2 | **Impact:** Medium

- [ ] Add reciter selection dropdown
- [ ] Integrate additional audio sources:
  - [ ] Mishary Alafasy
  - [ ] Abdul Basit
  - [ ] Sudais
  - [ ] etc.
- [ ] Cache audio per reciter
- [ ] User preference storage
- [ ] Audio preloading

**Files to create:**
- `lib/reciters.ts`

**Files to modify:**
- `components/PracticeMode.tsx`
- `app/api/settings/route.ts`

---

### 8.3 - Translation Display
**Effort:** 2 days | **Priority:** P2 | **Impact:** Medium

- [ ] Integrate translation API or dataset
- [ ] Support multiple languages:
  - [ ] English
  - [ ] French
  - [ ] Urdu
  - [ ] Indonesian
- [ ] Display toggle
- [ ] Word-by-word translation (future)

---

### 8.4 - Practice Notes & Journal
**Effort:** 2 days | **Priority:** P3 | **Impact:** Low

- [ ] Add notes field per verse
- [ ] Rich text editor
- [ ] Tags and categories
- [ ] Search notes
- [ ] Export notes
- [ ] Markdown support

---

## 🔧 PRIORITY 9: Infrastructure & DevOps

### 9.1 - Performance Optimization
**Effort:** 3 days | **Priority:** P1 | **Impact:** High

- [ ] Implement React.memo where needed
- [ ] Optimize re-renders
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] Image optimization
- [ ] Database query optimization
- [ ] API response caching
- [ ] Bundle size analysis

---

### 9.2 - Testing
**Effort:** 5 days | **Priority:** P1 | **Impact:** High

- [ ] Set up Jest and React Testing Library
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Test coverage > 80%

**Dependencies:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

---

### 9.3 - Error Tracking
**Effort:** 1 day | **Priority:** P1 | **Impact:** High

- [ ] Integrate Sentry or similar
- [ ] Error logging
- [ ] Performance monitoring
- [ ] User feedback widget
- [ ] Error recovery strategies

---

### 9.4 - Analytics
**Effort:** 1 day | **Priority:** P2 | **Impact:** Medium

- [ ] Integrate analytics (Plausible/Umami for privacy)
- [ ] Track key events:
  - [ ] Practice started
  - [ ] Verse completed
  - [ ] Mode changes
  - [ ] Feature usage
- [ ] User flow analysis
- [ ] A/B testing framework

---

## 📱 PRIORITY 10: Mobile App (Future)

### 10.1 - React Native Setup
**Effort:** 1 week | **Priority:** P3 | **Impact:** High

- [ ] Initialize React Native project
- [ ] Shared component library
- [ ] API client
- [ ] Navigation setup
- [ ] Authentication
- [ ] Push notifications

---

## 📊 Effort Summary

| Priority | Total Tasks | Est. Time |
|----------|------------|-----------|
| P0 (Critical) | 15 | 3-4 weeks |
| P1 (High) | 25 | 6-7 weeks |
| P2 (Medium) | 20 | 4-5 weeks |
| P3 (Low) | 10 | 2-3 weeks |

**Total Estimated Effort:** ~18 weeks (4.5 months) for P0-P2

---

## 🎯 Recommended Execution Order

### Sprint 1 (Week 1-2): Quick Wins
1. Keyboard shortcuts
2. Session summary modal
3. Better audio feedback
4. Voice confidence indicator
5. Practice timer

### Sprint 2 (Week 3-4): Analytics Foundation
1. Word trouble tracking database & API
2. Difficult words page
3. Session data tracking
4. Basic visualizations

### Sprint 3 (Week 5-6): Practice Modes
1. Speed run mode
2. Perfect run challenge
3. Review mode
4. Challenge & relaxed modes

### Sprint 4 (Week 7-9): Spaced Repetition
1. SRS algorithm implementation
2. Review queue system
3. Smart recommendations
4. UI integration

### Sprint 5 (Week 10-11): Motivation
1. Daily goals system
2. Streak tracking
3. Calendar view
4. Motivational messages

### Sprint 6 (Week 12-14): Gamification
1. Achievement badges
2. Leveling system
3. XP tracking
4. Leaderboards (optional)

### Sprint 7 (Week 15-16): Polish
1. Dark mode optimization
2. Responsive design fixes
3. Accessibility improvements
4. Loading states

### Sprint 8 (Week 17-18): Infrastructure
1. Performance optimization
2. Testing setup
3. Error tracking
4. Analytics

---

## 📚 Additional Documentation

- [TAJWEED_IMPLEMENTATION_COMPLETE.md](TAJWEED_IMPLEMENTATION_COMPLETE.md) - Complete documentation of Tajweed color-coding implementation (Jan 19, 2025)
- [ROADMAP.md](ROADMAP.md) - Product roadmap with phases and timelines

---

**Last Updated:** 2025-01-19 (Evening - Tajweed Audio Analysis Complete)
**Next Review:** After Sprint 1 completion
