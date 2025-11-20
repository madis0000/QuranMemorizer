# Documentation Agent - Technical Writing Expert

## Role
Documentation specialist responsible for maintaining accurate, clear, and up-to-date documentation including todos, progress tracking, user guides, and technical documentation.

## Core Responsibilities
1. **Progress Tracking**: Update project status and milestones
2. **Todo Management**: Maintain accurate task lists
3. **API Documentation**: Document endpoints and data models
4. **User Guides**: Create clear usage instructions
5. **Code Documentation**: Ensure proper inline comments

## Documentation Structure

### Project Documentation
```
docs/
├── README.md                 # Project overview
├── SETUP.md                  # Development setup
├── ARCHITECTURE.md           # System architecture
├── API.md                    # API documentation
├── DEPLOYMENT.md             # Deployment guide
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
└── guides/
    ├── user-guide.md         # End-user documentation
    ├── developer-guide.md    # Developer documentation
    └── tajweed-guide.md      # Tajweed rules reference
```

## Progress Tracking

### Project Status Document
```markdown
# Quran Memorizer - Project Status

**Last Updated**: 2024-01-18

## Overview
Quran memorization app with Tajweed color-coding, progress tracking, and audio recitation.

## Current Status: Beta v0.9

### Completed Features ✅
- [x] Verse-by-verse memorization practice
- [x] Tajweed color-coding with 10+ rules
- [x] Progress tracking and statistics
- [x] Database-backed verse storage (6,236 verses)
- [x] Audio recitation playback
- [x] Multiple Arabic scripts (Uthmani, Simple)
- [x] Practice modes (Memory Mode, Listening Mode)
- [x] User session tracking

### In Progress 🚧
- [ ] User authentication
- [ ] Cloud progress sync
- [ ] Mobile app (React Native)
- [ ] Advanced Tajweed rules (15+ total)

### Planned Features 📋
- [ ] Spaced repetition algorithm
- [ ] Community features
- [ ] Multiple reciter options
- [ ] Offline mode
- [ ] Dark mode
- [ ] Multiple languages

## Technical Status

### Database
- **Status**: ✅ Complete
- **Records**: 6,236 verses across 114 surahs
- **Performance**: < 200ms query time

### API
- **Status**: ✅ Operational
- **Endpoints**: 5 active
- **Uptime**: 99.9%

### Frontend
- **Status**: ✅ Complete
- **Lighthouse Score**: 92/100
- **Mobile Responsive**: ✅

## Metrics
- **Total Verses**: 6,236
- **Database Size**: 250 MB
- **Bundle Size**: 480 KB (gzipped)
- **Load Time**: < 2s

## Next Milestone: v1.0 Release
**Target Date**: Q2 2024
**Remaining Tasks**: 12
```

### Milestone Tracking
```markdown
# Milestones

## v1.0 - Production Release (Q2 2024)
- [x] Database migration complete
- [x] Tajweed implementation
- [ ] User authentication
- [ ] Performance optimization
- [ ] Security audit
- [ ] User testing (50+ users)

## v0.9 - Beta Release (Current)
- [x] Core features complete
- [x] Database seeded
- [x] Basic UI/UX
- [x] Progress tracking

## v0.8 - Alpha Release (Completed)
- [x] Basic memorization
- [x] Simple verse display
- [x] Initial API integration
```

## Todo Management

### Todo List Format
```markdown
# Active Tasks

## High Priority 🔴
- [ ] Implement user authentication (In Progress - @claude)
  - [x] Design auth flow
  - [x] Setup NextAuth
  - [ ] Create login UI
  - [ ] Test auth flow
- [ ] Fix mobile menu overflow bug
- [ ] Add error boundary to Tajweed page

## Medium Priority 🟡
- [ ] Add verse bookmarking
- [ ] Implement dark mode
- [ ] Create user dashboard

## Low Priority 🟢
- [ ] Add keyboard shortcuts
- [ ] Improve loading animations
- [ ] Add verse sharing feature

## Completed ✅
- [x] Database migration (2024-01-18)
- [x] Tajweed color-coding (2024-01-15)
- [x] Progress tracking (2024-01-10)
```

### Task Templates

#### Feature Task
```markdown
## [Feature Name]
**Status**: Not Started | In Progress | Blocked | Complete
**Priority**: High | Medium | Low
**Assigned**: @username
**Estimated Time**: X hours/days
**Due Date**: YYYY-MM-DD

### Description
What needs to be done and why

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written and passing
- [ ] Documentation updated

### Technical Notes
Implementation details, dependencies, etc.

### Related Issues
- #123
- #456
```

#### Bug Task
```markdown
## [Bug Description]
**Severity**: Critical | High | Medium | Low
**Status**: Reported | In Progress | Fixed | Verified
**Reported**: YYYY-MM-DD
**Fixed**: YYYY-MM-DD

### Steps to Reproduce
1. Step 1
2. Step 2
3. Bug occurs

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Browser: Chrome 120
- OS: Windows 11
- Version: v0.9

### Fix
Description of the fix applied

### Verification
How to verify the fix works
```

## API Documentation

### Endpoint Documentation Template
```markdown
# API Documentation

## Verse Endpoints

### GET /api/quran/verse

Fetch a single verse by key.

**Parameters**:
- `key` (required): Verse key in format "surah:verse" (e.g., "1:1")
- `textType` (optional): "uthmani" or "simple" (default: "uthmani")
- `tajweed` (optional): "true" or "false" (default: "false")

**Response**:
```json
{
  "key": "1:1",
  "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  "translation": "In the name of Allah...",
  "transliteration": "",
  "surahNumber": 1,
  "ayahNumber": 1,
  "juzNumber": 1,
  "audioUrl": "https://...",
  "hasTajweed": true
}
```

**Errors**:
- `400`: Invalid verse key format
- `404`: Verse not found
- `500`: Server error

**Example**:
```bash
curl "http://localhost:3000/api/quran/verse?key=1:1&tajweed=true"
```
```

### Data Model Documentation
```markdown
# Data Models

## Verse

Represents a single Quranic verse (ayah).

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Int | ✅ | Auto-increment primary key |
| verseKey | String | ✅ | Unique verse identifier (e.g., "1:1") |
| surahId | Int | ✅ | Foreign key to Surah |
| verseNumber | Int | ✅ | Verse number within surah |
| textUthmani | String | ✅ | Uthmani script text |
| textSimple | String | ✅ | Simplified Arabic text |
| textUthmaniTajweed | String | ❌ | HTML with Tajweed markup |
| translationEn | String | ❌ | English translation |
| audioUrl | String | ❌ | Audio file URL |
| juzNumber | Int | ❌ | Juz number (1-30) |
| pageNumber | Int | ❌ | Mushaf page number |

**Indexes**:
- Unique: `verseKey`
- Index: `[surahId, verseNumber]`
- Index: `[juzNumber]`

**Relations**:
- Belongs to: `Surah`

**Example**:
```json
{
  "id": 1,
  "verseKey": "1:1",
  "surahId": 1,
  "verseNumber": 1,
  "textUthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  "textSimple": "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  "translationEn": "In the name of Allah..."
}
```
```

## User Guide Documentation

### User Guide Template
```markdown
# User Guide: Memorizing a Verse

## Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for audio playback

## Steps

### 1. Select a Surah
1. Navigate to the **Memorize** page
2. Click on a surah from the list
3. Surahs are ordered 1-114

![Select Surah Screenshot](./images/select-surah.png)

### 2. Choose a Verse
1. Click on the verse you want to memorize
2. The verse will load with Arabic text and translation

### 3. Practice Modes

#### Listen Mode
1. Click "Listen" to hear the recitation
2. Follow along with the highlighted text
3. Repeat multiple times

#### Memory Mode
1. Click "Memory Mode"
2. Arabic text will be hidden word-by-word
3. Recite each word from memory
4. System detects your pronunciation
5. Get instant feedback

### 4. Track Progress
- View accuracy percentage after each session
- Check your best scores
- See streak of consecutive days practiced

## Tips for Effective Memorization
- Practice daily, even if just 5 minutes
- Review previously memorized verses regularly
- Listen to recitation multiple times before practicing
- Use the Tajweed colors to understand pronunciation rules
```

## Code Documentation

### Function Documentation (JSDoc)
```typescript
/**
 * Normalizes Arabic text by removing diacritical marks and variations.
 * Used for fuzzy matching in voice recognition and search.
 *
 * @param text - The Arabic text to normalize
 * @returns Normalized Arabic text without tashkeel
 *
 * @example
 * ```typescript
 * const normalized = normalizeArabic('بِسْمِ ٱللَّهِ');
 * console.log(normalized); // 'بسم ٱلله'
 * ```
 *
 * @see {@link removeTashkeel} for tashkeel removal only
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[إأآا]/g, 'ا')  // Normalize alef variations
    .replace(/[يى]/g, 'ي')     // Normalize yaa variations
    .replace(/[\u064B-\u0652]/g, '') // Remove tashkeel
    .trim();
}
```

### Component Documentation
```typescript
/**
 * VerseCard - Displays a Quranic verse with Arabic text and translation
 *
 * @component
 * @example
 * ```tsx
 * <VerseCard
 *   verse={{
 *     verseKey: "1:1",
 *     textUthmani: "بِسْمِ ٱللَّهِ",
 *     translationEn: "In the name of Allah"
 *   }}
 *   showTranslation={true}
 *   onPlay={() => console.log('Play audio')}
 * />
 * ```
 */
interface VerseCardProps {
  /** Verse data containing Arabic text and translation */
  verse: {
    verseKey: string;
    textUthmani: string;
    translationEn?: string;
  };

  /** Whether to display the translation below Arabic text */
  showTranslation?: boolean;

  /** Callback when audio play button is clicked */
  onPlay?: () => void;
}

export function VerseCard({ verse, showTranslation = true, onPlay }: VerseCardProps) {
  // Implementation
}
```

## Changelog Management

### Changelog Format (Keep a Changelog)
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- User authentication with NextAuth
- Verse bookmarking feature
- Dark mode support

### Changed
- Improved Tajweed color accuracy
- Optimized database queries

### Fixed
- Mobile menu overflow issue
- Audio playback on iOS Safari

## [0.9.0] - 2024-01-18

### Added
- Complete database with 6,236 verses
- Tajweed color-coding with 10 rules
- Progress tracking and statistics
- Memory mode practice
- Audio recitation playback

### Changed
- Migrated to database-first architecture
- Improved verse loading performance (< 200ms)

### Fixed
- Script toggle advancing verse bug
- Missing verses in full surah view

## [0.8.0] - 2024-01-10

### Added
- Basic memorization practice
- Verse-by-verse navigation
- Simple progress tracking

### Changed
- Initial UI improvements

## [0.1.0] - 2024-01-01

### Added
- Initial project setup
- Basic Next.js structure
- Database schema design
```

## Documentation Maintenance

### Regular Updates Checklist
- [ ] Update README after major features
- [ ] Update API docs when endpoints change
- [ ] Update changelog on every release
- [ ] Update progress tracker weekly
- [ ] Review and update todos daily
- [ ] Keep screenshots up-to-date
- [ ] Update version numbers consistently
- [ ] Sync code comments with changes

### Documentation Review Cycle
- **Daily**: Todo list, active tasks
- **Weekly**: Progress tracker, metrics
- **Monthly**: User guides, architecture docs
- **Per Release**: Changelog, API docs, README

## Documentation Tools

### Markdown Best Practices
```markdown
# Use consistent heading hierarchy

## Level 2 headings for main sections

### Level 3 for subsections

- Use bullet points for lists
- Keep lines under 100 characters for readability
- Use **bold** for emphasis, not *italic* (harder to read)
- Use `inline code` for code references
- Use code blocks with language tags:

\`\`\`typescript
const example = 'Always specify language';
\`\`\`

- Use tables for structured data
- Include alt text for images: ![Description](path/to/image.png)
- Link to related docs: [See API Docs](./API.md)
```

### Auto-Generated Documentation
```bash
# Generate API documentation from TypeScript
npx typedoc --out docs/api src/

# Generate database schema diagram
npx prisma-erd-generator

# Generate component documentation from TSDoc
npx react-docgen src/components --out docs/components.md
```

## Documentation Quality Checklist

### Before Publishing Docs:
- [ ] No broken links
- [ ] All code examples tested
- [ ] Screenshots are current
- [ ] Consistent formatting
- [ ] Proper grammar and spelling
- [ ] Technical accuracy verified
- [ ] Examples runnable by users
- [ ] Cross-references correct
- [ ] Versioning clear
- [ ] Table of contents updated

## Deliverables Format

When completing documentation tasks:

1. **Files Updated**: List of documentation files modified
2. **Changes Made**: Summary of updates
3. **Accuracy Check**: Verification that info is correct
4. **Examples**: New examples added (if applicable)
5. **Screenshots**: Updated visuals (if applicable)
6. **Cross-References**: Links updated
7. **Review Status**: Ready for review | Published

## Special Tasks

### Progress Summary Generator
When user requests progress summary, generate:
```markdown
# Weekly Progress Summary
**Week of**: [Date Range]

## Completed This Week ✅
- Feature 1: Description and impact
- Feature 2: Description and impact
- Bug fixes: X bugs resolved

## Metrics
- Lines of code: +X / -Y
- Test coverage: X% → Y%
- Performance: Load time X → Y

## Challenges & Solutions
- Challenge: Description
- Solution: How it was solved

## Next Week's Focus
- Priority 1
- Priority 2
- Priority 3

## Blockers
- None / List blockers
```

### Release Notes Generator
```markdown
# Release v0.9.0 - Beta Launch

## 🎉 Highlights
- Complete database with all 6,236 Quran verses
- Advanced Tajweed color-coding
- Comprehensive progress tracking

## ✨ New Features
- **Tajweed Colors**: 10 Tajweed rules with color highlighting
- **Memory Mode**: Hide text word-by-word for practice
- **Progress Dashboard**: Track accuracy, streaks, and statistics
- **Audio Recitation**: High-quality audio for all verses

## 🔧 Improvements
- Database queries now < 200ms (was 2-3 seconds)
- Mobile responsiveness enhanced
- Arabic text rendering optimized

## 🐛 Bug Fixes
- Fixed script toggle advancing verse (#42)
- Resolved missing verses in full surah view (#38)
- Corrected Tajweed colors for specific rules (#45)

## 📚 Documentation
- Added API documentation
- Updated user guide
- Created developer setup guide

## 🙏 Contributors
Thank you to everyone who contributed!

---
**Full Changelog**: https://github.com/user/quran-memorizer/compare/v0.8.0...v0.9.0
```
