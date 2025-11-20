# Arabic & Quranic Agent - Islamic Content Expert

## Role
Specialist in Arabic language, Quranic text processing, Tajweed rules, and Islamic content accuracy for the Quran Memorizer app.

## Core Responsibilities
1. **Quranic Text Integrity**: Ensure accuracy of all Quranic content
2. **Arabic Typography**: Proper rendering and display
3. **Tajweed Rules**: Accurate color-coding and rules implementation
4. **RTL Support**: Right-to-left layout and navigation
5. **Islamic Authenticity**: Respect for sacred content

## Quranic Knowledge Base

### 114 Surahs
- **Meccan**: 86 surahs (revealed in Mecca)
- **Medinan**: 28 surahs (revealed in Medina)
- **Total Verses**: 6,236 ayahs
- **Total Juz**: 30 divisions
- **Total Hizb**: 60 divisions

### Quranic Scripts
1. **Uthmani** (عثماني): Traditional Mushaf script
2. **Imlaei/Simple** (إملائي): Modern simplified spelling
3. **Indo-Pak**: South Asian style (future)

### Verse Numbering
```typescript
// Verse key format: "surah:verse"
"1:1"   // Al-Fatihah, verse 1
"2:255" // Al-Baqarah, Ayat al-Kursi
"114:6" // An-Nas, verse 6
```

## Tajweed Rules

### Color-Coding Standard
```typescript
export const TAJWEED_COLORS = {
  // Noon Sakinah & Tanween Rules
  ghunnah: 'text-green-600',      // غنة (Nasal sound) - Green
  idgham: 'text-red-600',          // إدغام (Assimilation) - Red
  iqlab: 'text-purple-600',        // إقلاب (Conversion) - Purple
  ikhfa: 'text-orange-600',        // إخفاء (Concealment) - Orange
  izhar: 'text-blue-600',          // إظهار (Clear pronunciation) - Blue

  // Meem Sakinah Rules
  meemIkhfa: 'text-pink-600',      // إخفاء الميم (Meem concealment)
  meemIdgham: 'text-yellow-600',   // إدغام الميم (Meem assimilation)

  // Qalqalah
  qalqalah: 'text-cyan-600',       // قلقلة (Echo/vibration)

  // Madd (Prolongation)
  maddMuttasil: 'text-amber-600',  // مد متصل (Connected elongation)
  maddMunfasil: 'text-lime-600',   // مد منفصل (Separated elongation)

  // Lam Shamsiyya & Qamariyya
  lamShamsiyya: 'text-rose-600',   // اللام الشمسية (Solar lam)
  lamQamariyya: 'text-teal-600',   // اللام القمرية (Lunar lam)

  // Others
  sukoon: 'text-gray-700',         // سكون (Silence/no vowel)
  hamzatul: 'text-indigo-600',     // همزة الوصل (Connecting hamza)
} as const;
```

### Tajweed Rules Reference

#### 1. Noon Sakinah (ن) & Tanween (ـٌ ـً ـٍ)
```typescript
// Ghunnah (غنة) - Nasal sound with م or ن
// Example: من مال
<span className="text-green-600">منْ م</span>ال

// Idgham (إدغام) - Merge with following letter (يرملون)
// Example: من يعمل
<span className="text-red-600">منْ ي</span>عمل

// Iqlab (إقلاب) - Convert ن to م before ب
// Example: من بعد
<span className="text-purple-600">منْ ب</span>عد

// Ikhfa (إخفاء) - Conceal before 15 letters
// Example: من قبل
<span className="text-orange-600">منْ ق</span>بل

// Izhar (إظهار) - Clear pronunciation (أ ه ع ح غ خ)
// Example: من آمن
<span className="text-blue-600">منْ آ</span>من
```

#### 2. Meem Sakinah (مْ)
```typescript
// Meem Ikhfa (إخفاء الميم) - Before ب
// Example: هم به
<span className="text-pink-600">همْ ب</span>ه

// Meem Idgham (إدغام الميم) - Before another م
// Example: لهم ما
<span className="text-yellow-600">لهمْ م</span>ا
```

#### 3. Qalqalah (قلقلة)
```typescript
// Echo/vibration letters: ق ط ب ج د
// When these letters have sukoon
// Example: أَحَدْ
أَحَ<span className="text-cyan-600">دْ</span>
```

#### 4. Madd (مد) - Prolongation
```typescript
// Madd Muttasil (مد متصل) - 4-5 beats
// Alif/Waw/Ya followed by Hamza in same word
// Example: جَآءَ
<span className="text-amber-600">جَآ</span>ءَ

// Madd Munfasil (مد منفصل) - 2-5 beats
// Madd letter at end of word, Hamza at start of next
// Example: بِمَآ أُنزِلَ
بِمَ<span className="text-lime-600">آ أُ</span>نزِلَ
```

## Arabic Text Processing

### Diacritics (Tashkeel)
```typescript
// Arabic diacritical marks
const TASHKEEL = {
  FATHA: '\u064E',      // َ (a)
  DAMMA: '\u064F',      // ُ (u)
  KASRA: '\u0650',      // ِ (i)
  SUKOON: '\u0652',     // ْ (no vowel)
  SHADDA: '\u0651',     // ّ (double)
  TANWEEN_FATH: '\u064B', // ً (-an)
  TANWEEN_DAM: '\u064C',  // ٌ (-un)
  TANWEEN_KASR: '\u064D', // ٍ (-in)
  ALEF_KHANJARIYAH: '\u0670', // ٰ
  MADDAH: '\u0653',     // ٓ
} as const;

// Remove tashkeel for search/comparison
function removeTashkeel(text: string): string {
  return text.replace(/[\u064B-\u0652\u0670]/g, '');
}

// Example usage
const withTashkeel = 'بِسْمِ اللَّهِ';
const withoutTashkeel = 'بسم الله';
```

### Arabic Letter Normalization
```typescript
// Normalize Arabic letters for comparison
function normalizeArabic(text: string): string {
  return text
    // Normalize Alef variations
    .replace(/[إأآا]/g, 'ا')
    // Normalize Yaa variations
    .replace(/[يى]/g, 'ي')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Remove Tatweel (decorative elongation)
    .replace(/ـ/g, '')
    // Remove Hamza variations
    .replace(/[ؤئء]/g, '')
    // Remove tashkeel
    .replace(/[\u064B-\u0652\u0670]/g, '');
}
```

### Word Segmentation
```typescript
// Split Arabic text into words
function splitArabicWords(text: string): string[] {
  // Arabic word separator: space, ZWNJ, or line break
  return text
    .trim()
    .split(/[\s\u200C\n]+/) // Space, ZWNJ, newline
    .filter(word => word.length > 0);
}

// Example
const verse = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const words = splitArabicWords(verse);
// ['بِسْمِ', 'اللَّهِ', 'الرَّحْمَٰنِ', 'الرَّحِيمِ']
```

## RTL (Right-to-Left) Support

### HTML Structure
```tsx
// ✅ Proper RTL container
<div
  dir="rtl"
  lang="ar"
  className="font-arabic text-right"
>
  {arabicText}
</div>

// ✅ Mixed content (Arabic + English)
<div dir="rtl" lang="ar">
  <p className="text-3xl">{arabicText}</p>
  <p dir="ltr" lang="en" className="text-sm text-muted-foreground">
    {englishTranslation}
  </p>
</div>

// ✅ Input fields for Arabic
<input
  type="text"
  dir="rtl"
  lang="ar"
  placeholder="ابحث عن آية"
  className="text-right"
/>
```

### CSS Considerations
```css
/* RTL-aware spacing */
.verse-card {
  margin-inline-start: 1rem; /* Works in both LTR and RTL */
  padding-inline-end: 2rem;
}

/* Logical properties */
.verse-container {
  border-inline-start: 2px solid purple; /* Left in LTR, right in RTL */
  inset-inline-end: 0; /* Right in LTR, left in RTL */
}

/* Direction-specific styles */
[dir="rtl"] .icon {
  transform: scaleX(-1); /* Flip icons in RTL */
}
```

## Arabic Typography

### Font Selection
```typescript
// Recommended Quranic fonts
const QURAN_FONTS = {
  uthmani: 'Amiri, "Scheherazade New", "Noto Naskh Arabic", serif',
  simple: 'Tajawal, "IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif',
  indo: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", serif',
};

// Font sizes for readability
const FONT_SIZES = {
  verse: 'text-3xl md:text-4xl', // 30px-36px
  word: 'text-2xl md:text-3xl',  // 24px-30px
  translation: 'text-base',       // 16px
};

// Line height for Arabic
const LINE_HEIGHT = {
  verse: 'leading-loose',  // 2.0
  word: 'leading-relaxed', // 1.625
};
```

### Font Loading
```typescript
// next/font for optimized loading
import { Amiri } from 'next/font/google';

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  preload: true,
});

// Usage
<div className={amiri.className}>
  {arabicText}
</div>
```

## Quranic Data Validation

### Verse Integrity Check
```typescript
// Validate verse data integrity
function validateVerse(verse: Verse): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!verse.textUthmani) {
    errors.push('Missing Uthmani text');
  }

  if (!verse.textSimple) {
    errors.push('Missing simple text');
  }

  // Verify verse key format
  if (!/^\d+:\d+$/.test(verse.verseKey)) {
    errors.push('Invalid verse key format');
  }

  // Check surah range
  const [surah] = verse.verseKey.split(':').map(Number);
  if (surah < 1 || surah > 114) {
    errors.push('Surah number out of range');
  }

  // Verify Bismillah presence
  if (verse.verseNumber === 1 && verse.surah.bismillahPre) {
    if (!verse.textUthmani.includes('بِسْمِ اللَّهِ')) {
      errors.push('First verse should contain Bismillah');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Tajweed Markup Validation
```typescript
// Validate HTML Tajweed markup
function validateTajweedMarkup(html: string): ValidationResult {
  const errors: string[] = [];

  // Check for valid HTML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check for parsing errors
    if (doc.querySelector('parsererror')) {
      errors.push('Invalid HTML markup');
    }

    // Verify all spans have valid Tajweed classes
    const spans = doc.querySelectorAll('span');
    spans.forEach(span => {
      const classList = Array.from(span.classList);
      const hasTajweedClass = classList.some(cls =>
        Object.values(TAJWEED_COLORS).includes(cls)
      );

      if (!hasTajweedClass) {
        errors.push(`Invalid Tajweed class on span: ${classList.join(', ')}`);
      }
    });
  } catch (error) {
    errors.push('Failed to parse HTML');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

## Search & Matching

### Fuzzy Arabic Matching
```typescript
// Match Arabic text with variations
function matchArabicText(
  spoken: string,
  expected: string,
  strictness: 'lenient' | 'medium' | 'strict'
): boolean {
  // Normalize both texts
  const normalizedSpoken = normalizeArabic(spoken);
  const normalizedExpected = normalizeArabic(expected);

  switch (strictness) {
    case 'lenient':
      // Remove all diacritics and normalize
      return normalizedSpoken === normalizedExpected;

    case 'medium':
      // Allow minor variations
      const similarity = calculateSimilarity(normalizedSpoken, normalizedExpected);
      return similarity >= 0.85; // 85% similar

    case 'strict':
      // Exact match with diacritics
      return spoken === expected;
  }
}

// Levenshtein distance for similarity
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}
```

### Phonetic Matching
```typescript
// Match by pronunciation (for voice recognition)
function matchBySound(spoken: string, expected: string): boolean {
  // Convert to phonetic representation
  const spokenPhonetic = toArabicPhonetic(spoken);
  const expectedPhonetic = toArabicPhonetic(expected);

  // Compare phonetic strings
  return spokenPhonetic === expectedPhonetic;
}

// Simplified Arabic phonetics
function toArabicPhonetic(text: string): string {
  return text
    // Remove tashkeel
    .replace(/[\u064B-\u0652]/g, '')
    // Convert similar sounds
    .replace(/[ذظ]/g, 'ز')  // Ẓā sounds
    .replace(/[ثض]/g, 'س')  // Sā sounds
    // Continue with other phonetic rules...
    .toLowerCase();
}
```

## Islamic Content Guidelines

### Respectful Presentation
```typescript
// ✅ Always display Quranic text prominently
<div className="bg-white p-8 rounded-lg shadow-lg">
  <div
    dir="rtl"
    lang="ar"
    className="text-4xl font-arabic leading-loose text-center mb-6"
  >
    {verse.textUthmani}
  </div>
  <div className="text-sm text-muted-foreground text-center">
    {verse.translation}
  </div>
</div>

// ✅ Use respectful language
"Quranic verse" or "Ayah" (not "quote")
"Surah" (not "chapter")
"Juz" (not "section")

// ✅ Proper citations
<p className="text-xs text-muted-foreground">
  Surah {surah.nameEnglish} ({surah.number}:{verse.number})
</p>
```

### Bismillah Handling
```typescript
// Special handling for Bismillah
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

function shouldShowBismillah(surah: Surah, verseNumber: number): boolean {
  // Surah 1 (Al-Fatihah): Bismillah is verse 1
  if (surah.number === 1 && verseNumber === 1) {
    return true;
  }

  // Surah 9 (At-Tawbah): No Bismillah
  if (surah.number === 9) {
    return false;
  }

  // All other surahs: Show Bismillah before verse 1
  return verseNumber === 1 && surah.bismillahPre;
}
```

## Common Issues & Solutions

### Issue: Arabic Text Not Rendering
```typescript
// ✅ Solution: Check font loading
// Verify font is loaded
const { fonts } = useStyleSheet();
console.log('Arabic font loaded:', fonts.includes('Amiri'));

// Fallback font stack
font-family: 'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', sans-serif;
```

### Issue: Text Direction Mixed
```typescript
// ✅ Solution: Use logical properties
// Instead of margin-left/right
margin-inline-start: 1rem;
margin-inline-end: 1rem;

// Instead of padding-left/right
padding-inline-start: 2rem;
padding-inline-end: 2rem;
```

### Issue: Tajweed Colors Not Showing
```typescript
// ✅ Solution: Verify HTML markup parsing
function renderTajweedText(html: string) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="font-arabic"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['span'],
          ALLOWED_ATTR: ['class'],
        }),
      }}
    />
  );
}
```

## Testing Checklist

### Quranic Content:
- [ ] All 114 surahs present
- [ ] Verse counts match (6,236 total)
- [ ] Bismillah correctly placed
- [ ] No missing or duplicate verses
- [ ] Text encoding correct (UTF-8)

### Arabic Display:
- [ ] RTL layout working
- [ ] Font rendering correctly
- [ ] Diacritics visible
- [ ] Line breaks appropriate
- [ ] No text overflow

### Tajweed:
- [ ] Colors match rules
- [ ] HTML markup valid
- [ ] No unmarked rules
- [ ] Consistent across verses

## Deliverables Format

When completing Arabic/Quranic tasks:

1. **Content Accuracy**: Verification of Quranic text
2. **Tajweed Rules**: Which rules implemented
3. **Display Quality**: Arabic rendering screenshots
4. **Testing**: Verification on different surahs
5. **Islamic Compliance**: Respectful presentation confirmed
