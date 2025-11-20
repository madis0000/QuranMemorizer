# Comprehensive Testing Guide - Quran Memorizer Application

This document provides a complete testing checklist for all implemented features in the Quran Memorizer application.

## Table of Contents
1. [Auto-Advance & Resume Features](#auto-advance--resume-features)
2. [Page-by-Page Memorization Mode](#page-by-page-memorization-mode)
3. [Juz-by-Juz Memorization Mode](#juz-by-juz-memorization-mode)
4. [Ayah-by-Ayah (Verse) Mode](#ayah-by-ayah-verse-mode)
5. [Speech Recognition & Matching](#speech-recognition--matching)
6. [Memory Challenge Mode](#memory-challenge-mode)
7. [UI/UX Components](#uiux-components)
8. [Data Persistence](#data-persistence)

---

## 1. Auto-Advance & Resume Features

### Auto-Advance Toggle

**Location**: Practice Mode (any verse/page/juz practice)

**Test Steps**:
1. Navigate to any practice session (e.g., `/memorize/1?verse=1`)
2. Locate the "⚡ Auto-Advance" toggle in the controls section
3. Click the toggle to turn it ON
   - ✅ Button should change to blue background
   - ✅ State should persist in localStorage
4. Complete a verse successfully
   - ✅ Countdown timer should appear showing "3, 2, 1"
   - ✅ Circular progress indicator should animate
   - ✅ Message: "Auto-advancing to next verse..."
5. Wait for countdown to complete
   - ✅ Should automatically navigate to next verse
6. Click "Previous Verse" or "Next Verse" during countdown
   - ✅ Countdown should cancel
   - ✅ Navigation should work immediately

**Test Cases**:
- [ ] Toggle persists across page refreshes
- [ ] Countdown can be canceled by clicking any navigation button
- [ ] Auto-advance works at verse boundaries (moves to next verse)
- [ ] Auto-advance does NOT trigger if toggle is OFF
- [ ] Countdown timer is accurate (3 seconds)

### Resume from Last Position

**Location**: Memorize Hub (`/memorize`)

**Test Steps**:
1. Complete a verse in any mode
2. Navigate back to `/memorize` hub
3. Look for floating button in bottom-right corner
   - ✅ "Continue Last Session" button should be visible
   - ✅ Tooltip should show verse number (e.g., "Verse 2:5")
   - ✅ Tooltip should show time since last practice (e.g., "5 minutes ago")
4. Click the button
   - ✅ Should navigate to the last practiced verse
5. Test time display accuracy:
   - Just practiced: "Just now"
   - < 1 hour: "X minutes ago"
   - < 24 hours: "X hours ago"
   - \> 24 hours: "X days ago"

**Test Cases**:
- [ ] Button only appears if user has practiced before
- [ ] Button disappears if localStorage is cleared
- [ ] Correct verse is loaded when clicked
- [ ] Time calculations are accurate

---

## 2. Page-by-Page Memorization Mode

### Page Selector UI

**Location**: `/memorize` → Select "Page Mode"

**Test Steps**:
1. Navigate to `/memorize`
2. Click on "Page Mode" card
3. Verify Page Selector loads:
   - ✅ 604 page buttons in grid layout
   - ✅ Pages marked with yellow border at Juz starts (1, 21, 41, ...)
   - ✅ Search box functional
   - ✅ Juz filter dropdown functional

**Test Cases**:
- [ ] All 604 pages render correctly
- [ ] Search filters pages (e.g., search "100" shows only page 100)
- [ ] Juz filter shows correct page range (e.g., Juz 1 = pages 1-20)
- [ ] Hover tooltip shows correct page and Juz number
- [ ] Click on page navigates to `/memorize/page/[pageNumber]`

### Page Practice Session

**Location**: `/memorize/page/[pageNumber]`

**Test Steps**:
1. Select page 1 from Page Selector
2. Verify page header shows:
   - ✅ Page number
   - ✅ Juz number
   - ✅ Verse count
   - ✅ Progress indicator (current verse / total verses)
3. Practice all verses on the page
   - ✅ Each verse completion advances to next verse
   - ✅ Last verse completion should prompt to next page
4. Test navigation buttons:
   - "Previous Page" button (disabled on page 1)
   - "Next Page" button (disabled on page 604)

**API Integration**:
- [ ] Verses fetch from Quran.com API correctly
- [ ] Fallback API works if primary fails
- [ ] Arabic text displays with proper Unicode
- [ ] Correct number of verses per page

---

## 3. Juz-by-Juz Memorization Mode

### Juz Selector UI

**Location**: `/memorize` → Select "Juz Mode"

**Test Steps**:
1. Navigate to `/memorize`
2. Click on "Juz Mode" card
3. Verify Juz Selector loads:
   - ✅ 30 Juz cards in grid layout
   - ✅ Each card shows:
     - Arabic name (e.g., "الم")
     - English name (e.g., "Alif Lam Meem")
     - Start and end verse references
     - Page range
   - ✅ Gradient backgrounds with primary/purple colors

**Test Cases**:
- [ ] All 30 Juz render correctly
- [ ] Hover effect scales card
- [ ] Juz metadata is accurate (verify spot-check a few Juz)
- [ ] Click navigates to `/memorize/juz/[juzNumber]`

### Juz Practice Session

**Location**: `/memorize/juz/[juzNumber]`

**Test Steps**:
1. Select Juz 1 from Juz Selector
2. Verify Juz header shows:
   - ✅ Juz number in circular badge
   - ✅ Arabic and English name
   - ✅ Total verse count
   - ✅ Page range
   - ✅ Progress bar and counter
3. Practice verses
   - ✅ Progress bar updates in real-time
   - ✅ Verse navigation works correctly
4. Test Juz navigation:
   - "Previous Juz" button (disabled on Juz 1)
   - "Next Juz" button (disabled on Juz 30)

**API Integration**:
- [ ] Fetches correct verses for entire Juz
- [ ] Handles large verse counts efficiently (Juz can have 300+ verses)
- [ ] Progress persists during session

---

## 4. Ayah-by-Ayah (Verse) Mode

### Verse Selector

**Location**: `/memorize` → Select "Verse Mode"

**Test Steps**:
1. Select "Verse Mode"
2. Verify VerseSelector shows:
   - ✅ All 114 surahs in list
   - ✅ Search functionality
   - ✅ Recommended verses section
   - ✅ Arabic surah names
   - ✅ Verse counts
3. Click on a surah
   - ✅ Should allow selecting specific verse number
4. Navigate to practice

**Test Cases**:
- [ ] Search filters surahs correctly
- [ ] Can select any surah (1-114)
- [ ] Can select any verse within surah
- [ ] Navigates to `/memorize/[surahNumber]?verse=[verseNumber]`

### Single Verse Practice

**Location**: `/memorize/[surahNumber]`

**Test Steps**:
1. Navigate to `/memorize/1?verse=1`
2. Verify verse loads:
   - ✅ Arabic text displays correctly
   - ✅ Verse key shown (e.g., "Verse 1:1")
   - ✅ All practice controls available
3. Navigate between verses:
   - "Previous Verse" button
   - "Next Verse" button

**Test Cases**:
- [ ] Previous button disabled on verse 1 of any surah
- [ ] Next button works across all verses
- [ ] URL updates when navigating verses
- [ ] Can reload page and correct verse loads

---

## 5. Speech Recognition & Matching

### Basic Speech Recognition

**Location**: Any practice mode

**Prerequisites**: Chrome or Edge browser, microphone access

**Test Steps**:
1. Click "Start Speaking" button
   - ✅ Browser prompts for microphone permission
   - ✅ Button changes to "Stop" with red color
   - ✅ Microphone icon animates
2. Speak Arabic words
   - ✅ Transcription appears in "What you said:" section
   - ✅ Words match in real-time
   - ✅ Matched words turn green

**Test Cases**:
- [ ] Browser support detection works (shows error on unsupported browsers)
- [ ] Microphone permission errors handled gracefully
- [ ] "No speech detected" error shows if mic is silent too long
- [ ] Arabic language detection (ar-SA) works correctly

### Robust Arabic Matching Algorithm

**Location**: Practice Mode (uses `lib/arabicUtils.ts`)

**Test Verses**:
1. Test with Quranic symbols: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى"
2. Test with different Alef forms: "أَلْحَمْدُ لِلَّهِ"
3. Test with Teh Marbuta: "الجنة" vs "الجنه"

**Test Steps**:
1. Speak verse with diacritics omitted
   - ✅ Should match (normalization removes diacritics)
2. Speak with different Alef/Yeh forms
   - ✅ Should match (normalization handles variations)
3. Speak partial word (testing fuzzy matching)
   - ✅ Should match based on strictness level

**Matching Strictness Levels**:
- [ ] **Lenient** (50%+ similarity): Very forgiving, matches partial words
- [ ] **Medium** (70%+ similarity): Balanced, recommended for most users
- [ ] **Strict** (90%+ similarity): Nearly perfect pronunciation required

**Algorithm Features to Test**:
- [ ] Quranic symbols don't split words incorrectly
- [ ] Levenshtein distance calculates correctly
- [ ] Multi-strategy matching works (exact → normalized → substring → fuzzy)
- [ ] Console logs show matching details for debugging

---

## 6. Memory Challenge Mode

### Enable/Disable Memory Mode

**Location**: Practice Mode toggle

**Test Steps**:
1. Toggle "🧠 Memory Challenge Mode" to ON
   - ✅ Button turns purple
   - ✅ Page resets (all words hidden)
   - ✅ Perfect Words counter appears
2. Toggle OFF
   - ✅ All words become visible
   - ✅ Perfect Words counter disappears

**Test Cases**:
- [ ] Toggling resets practice session
- [ ] State persists during session (doesn't reset randomly)

### Difficulty Levels

**Test Each Difficulty**:

**Easy Mode**:
- [ ] Shows hints after 2 failed attempts
- [ ] Shows word length with underscores
- [ ] Hint 1: First letter + underscores
- [ ] Hint 2: First two letters + underscores
- [ ] Hint 3: Full word revealed

**Medium Mode**:
- [ ] Shows hints after 3 failed attempts
- [ ] Same hint progression as Easy

**Hard Mode**:
- [ ] No hints ever shown
- [ ] Only shows "___" placeholder
- [ ] Maximum challenge

### Perfect Words Tracking

**Test Steps**:
1. Start Memory Mode (any difficulty)
2. Say first word correctly on first try
   - ✅ Word reveals and scales briefly (animation)
   - ✅ Gold ring appears around word
   - ✅ Perfect Words counter increments
3. Say next word incorrectly, then correctly
   - ✅ Word reveals but no gold ring
   - ✅ Perfect Words counter does NOT increment
4. Complete verse with all perfect words
   - ✅ Special completion message: "🎉 Perfect Memory Mastery!"
   - ✅ "🏆 Memory Master Badge Earned!" message

**Test Cases**:
- [ ] Perfect words tracked accurately
- [ ] Attempts counter shows correctly
- [ ] Sound effects play (success = high tone, error = low tone)
- [ ] Total attempts calculation correct

---

## 7. UI/UX Components

### Memorize Hub Dashboard

**Location**: `/memorize`

**Components to Test**:
1. **Hero Section**
   - [ ] Gradient title with sparkles
   - [ ] Descriptive subtitle

2. **Stats Cards**:
   - [ ] Streak Counter (current/longest streak, last practice date)
   - [ ] Verses Mastered (total count)
   - [ ] Practice Time (hours and minutes)
   - [ ] Achievements (unlocked/total)

3. **Mode Selector Tabs**:
   - [ ] Practice Modes tab active by default
   - [ ] Themes tab (Context Selector)
   - [ ] Achievements tab (shows all badges)

4. **Mode Cards**:
   - [ ] Verse Mode card (with icon, description)
   - [ ] Page Mode card
   - [ ] Juz Mode card
   - [ ] Other modes show as available

### Practice Mode UI

**Visual Elements**:
- [ ] Modal overlay with backdrop blur
- [ ] Card with rounded corners and shadows
- [ ] Progress bar animates smoothly
- [ ] Accuracy percentage updates in real-time
- [ ] Arabic text in Amiri font, proper RTL direction
- [ ] Word highlighting with color coding:
  - Pending: Gray
  - Current: Yellow with ring
  - Correct: Green with background
  - Perfect: Gold ring

**Animations**:
- [ ] Words fade in with stagger (0.05s delay each)
- [ ] Perfect words scale up briefly (1 → 1.2 → 1)
- [ ] Completion message slides in
- [ ] Countdown circle animates smoothly

### Responsive Design

**Test Breakpoints**:
- [ ] Mobile (< 640px): Single column layouts
- [ ] Tablet (640-1024px): 2-column grids
- [ ] Desktop (> 1024px): 3+ column grids
- [ ] Page grid adjusts (6 → 8 → 10 → 12 columns)
- [ ] Juz cards stack properly (1 → 2 → 3 columns)

---

## 8. Data Persistence

### LocalStorage

**Keys to Test**:
1. `lastVerse` - Stores last practiced verse key (e.g., "2:5")
2. `lastPracticeTime` - ISO timestamp of last practice
3. `autoAdvance` - Boolean string ("true"/"false")

**Test Steps**:
1. Practice a verse
   - ✅ Check DevTools → Application → LocalStorage
   - ✅ Verify `lastVerse` and `lastPracticeTime` saved
2. Toggle auto-advance
   - ✅ Verify `autoAdvance` saved
3. Refresh page
   - ✅ Auto-advance state persists
   - ✅ Resume button shows correct verse
4. Clear localStorage
   - ✅ Resume button disappears
   - ✅ Auto-advance resets to OFF

### Zustand Store (Practice Sessions)

**Store**: `useMemorizationStore`

**Test Steps**:
1. Complete a verse
2. Check store state:
   - ✅ `sessions` array has new entry
   - ✅ Session includes: verseKey, accuracy, totalWords, correctWords, duration
3. Navigate to Progress page (if implemented)
   - ✅ Stats reflect completed sessions

---

## API Integration Tests

### Quran.com API Fallback

**Primary API**: Quran Foundation (often fails)
**Fallback API**: Quran.com public API

**Test Steps**:
1. Open DevTools → Network tab
2. Load a verse
3. Check console logs:
   - ✅ "OAuth Request" log
   - ✅ "OAuth Success" or error
   - ✅ "Quran Foundation API failed, using public Quran.com API as fallback"
4. Verify verse loads successfully despite primary API failure

**API Endpoints Tested**:
- [ ] `/api/quran/verse?key=X:Y` - Single verse fetch
- [ ] Quran.com `/api/v4/verses/by_key/X:Y` - Fallback verse
- [ ] Quran.com `/api/v4/verses/by_page/N` - Page verses
- [ ] Quran.com `/api/v4/verses/by_juz/N` - Juz verses

---

## Performance Tests

### Loading States

**Test Cases**:
- [ ] Verse loading shows spinner with "Loading verse..." message
- [ ] Page loading shows "Loading page N..."
- [ ] Juz loading shows "Loading Juz N..."
- [ ] No flash of unstyled content (FOUC)

### Large Data Handling

**Test Cases**:
- [ ] Juz with 300+ verses loads without lag
- [ ] Page grid with 604 buttons renders smoothly
- [ ] Speech recognition handles continuous speech
- [ ] No memory leaks after multiple practice sessions

---

## Error Handling Tests

### Browser Compatibility Errors

**Test Steps**:
1. Open in Safari or Firefox (non-Chrome/Edge)
   - ✅ Shows "Browser Not Supported" warning
   - ✅ Red alert box with clear message
   - ✅ Practice controls disabled

### API Errors

**Simulate by blocking network**:
1. Open DevTools → Network → Offline mode
2. Try to load a verse
   - ✅ Shows "Error Loading Verse" card
   - ✅ Error message displayed
   - ✅ "Back to Memorize" button works

### Microphone Permission Errors

**Test Steps**:
1. Block microphone in browser settings
2. Click "Start Speaking"
   - ✅ Shows error: "Microphone access denied..."
   - ✅ Yellow alert box
   - ✅ Provides guidance to fix

---

## Accessibility Tests

### Keyboard Navigation

**Test Cases**:
- [ ] Tab key navigates through buttons
- [ ] Enter key activates buttons
- [ ] Esc key closes practice modal
- [ ] Arrow keys could navigate verses (not implemented yet)

### Screen Reader Support

**Test with screen reader**:
- [ ] Button labels are descriptive
- [ ] Status messages announced
- [ ] Arabic text readable
- [ ] Progress updates announced

### Color Contrast

**WCAG AA Compliance**:
- [ ] Text meets 4.5:1 contrast ratio
- [ ] Buttons have clear focus states
- [ ] Error messages have sufficient contrast

---

## Security Tests

### Input Validation

**Test Cases**:
- [ ] Invalid page numbers (< 1, > 604) show error
- [ ] Invalid Juz numbers (< 1, > 30) show error
- [ ] Invalid surah numbers (< 1, > 114) show error
- [ ] SQL injection attempts in search (should be safe with API)

### XSS Prevention

**Test Steps**:
1. Try to inject script in search: `<script>alert('xss')</script>`
   - ✅ Rendered as plain text, not executed

---

## Cross-Browser Testing Checklist

### Chrome/Edge (Supported)
- [ ] All features work
- [ ] Speech recognition functional
- [ ] Audio playback works
- [ ] Animations smooth

### Firefox (Limited Support)
- [ ] UI displays correctly
- [ ] Speech recognition shows "not supported" warning
- [ ] Manual navigation works

### Safari (Limited Support)
- [ ] UI displays correctly
- [ ] Speech recognition may not work
- [ ] Audio playback works

### Mobile Browsers
- [ ] Responsive design works
- [ ] Touch interactions functional
- [ ] Speech recognition works on Chrome Android
- [ ] Keyboard doesn't overlap content

---

## Regression Testing Checklist

**Run after any code changes**:
- [ ] Auto-advance toggle still persists
- [ ] Resume button still appears
- [ ] Speech recognition still works
- [ ] Page/Juz selectors load correctly
- [ ] Navigation buttons work
- [ ] API fallback still functional
- [ ] No console errors

---

## Test Data

### Sample Test Verses:
1. **Al-Fatihah 1:1**: `بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ`
2. **Al-Baqarah 2:5** (with Quranic marks): `أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ`
3. **Short Surah (Al-Ikhlas 112:1-4)**: Good for full surah testing

### Sample Pages:
- **Page 1**: Juz 1 start, Al-Fatihah
- **Page 21**: Juz 2 start, Al-Baqarah 2:142
- **Page 604**: Last page, short surahs

### Sample Juz:
- **Juz 1**: Al-Fatihah + Al-Baqarah 1:1-2:141
- **Juz 30** (Juz Amma): Short surahs (78-114)

---

## Test Completion Checklist

### Core Features
- [ ] Auto-advance works and persists
- [ ] Resume from last position works
- [ ] Page mode fully functional (selector + practice)
- [ ] Juz mode fully functional (selector + practice)
- [ ] Verse mode works (existing feature maintained)
- [ ] Speech recognition matches correctly
- [ ] Memory Challenge Mode all difficulties work
- [ ] All navigation buttons work correctly

### UI/UX
- [ ] All components render correctly
- [ ] Animations smooth and appropriate
- [ ] Responsive design works on all breakpoints
- [ ] No visual bugs or overlapping elements
- [ ] Loading states clear and informative

### Data & Persistence
- [ ] LocalStorage saves/loads correctly
- [ ] Zustand store updates correctly
- [ ] API integration works with fallback
- [ ] No data loss on refresh

### Error Handling
- [ ] All error states tested
- [ ] User-friendly error messages
- [ ] Graceful degradation when features unavailable

---

## Known Issues / Future Improvements

### Not Yet Implemented:
1. **Hizb/Rub' Modes**: Subdivisions of Juz (each Juz = 2 Hizb, each Hizb = 4 Rub)
2. **Full Thematic Context Mode**: Foundation exists, needs content
3. **Spaced Repetition System**: Requires scheduling algorithm
4. **Full Gamification**: Achievements exist but need more triggers
5. **Offline Support**: Service worker not implemented
6. **Audio Sync**: Word highlighting during audio playback

### Performance Optimizations Needed:
- [ ] Virtual scrolling for large verse lists
- [ ] Lazy loading for page/juz selectors
- [ ] Memoization of heavy computations
- [ ] Image optimization for achievement badges

---

## Conclusion

This testing guide covers all implemented features as of the current build. For any test that fails, please:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Verify network requests in DevTools
4. Check localStorage and store state
5. Document expected vs. actual behavior

**Testing Priority**:
1. ⭐⭐⭐ Critical: Speech recognition, auto-advance, navigation
2. ⭐⭐ High: Mode selectors, data persistence, error handling
3. ⭐ Medium: Animations, responsive design, performance

---

**Last Updated**: Auto-generated after completing major features
**Version**: 1.0.0
**Tested On**: Chrome 120+, Edge 120+
