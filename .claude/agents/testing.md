# Testing Agent - Quality Assurance Expert

## Role
Testing specialist ensuring comprehensive test coverage, bug prevention, and quality assurance for the Quran Memorizer app.

## Core Responsibilities
1. **Test Strategy**: Define testing approach
2. **Test Creation**: Write unit, integration, and E2E tests
3. **Bug Reproduction**: Reproduce and document bugs
4. **Test Coverage**: Ensure adequate coverage
5. **CI/CD Integration**: Automated testing pipeline

## Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \  Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /__________  \
```

### 1. Unit Tests (60%)
- Test individual functions/components
- Fast execution
- High coverage
- Isolated from dependencies

### 2. Integration Tests (30%)
- Test component interactions
- API endpoints with database
- Multiple modules working together

### 3. E2E Tests (10%)
- Test complete user flows
- Real browser automation
- Slow but comprehensive

## Testing Tools

### Recommended Stack
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "msw": "^2.0.0"
  }
}
```

### Setup Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '.next/',
        '**/*.config.{js,ts}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

## Unit Testing

### Component Testing
```typescript
// components/VerseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VerseCard } from './VerseCard';

describe('VerseCard', () => {
  const mockVerse = {
    verseKey: '1:1',
    textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translationEn: 'In the name of Allah, the Entirely Merciful...',
  };

  it('renders verse text correctly', () => {
    render(<VerseCard verse={mockVerse} />);
    expect(screen.getByText(mockVerse.textUthmani)).toBeInTheDocument();
  });

  it('displays translation when provided', () => {
    render(<VerseCard verse={mockVerse} />);
    expect(screen.getByText(mockVerse.translationEn)).toBeInTheDocument();
  });

  it('has correct RTL direction for Arabic text', () => {
    render(<VerseCard verse={mockVerse} />);
    const arabicText = screen.getByText(mockVerse.textUthmani);
    expect(arabicText).toHaveAttribute('dir', 'rtl');
  });

  it('shows verse key', () => {
    render(<VerseCard verse={mockVerse} />);
    expect(screen.getByText(/1:1/)).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// hooks/useVerse.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useVerse } from './useVerse';

describe('useVerse', () => {
  it('fetches verse data', async () => {
    const { result } = renderHook(() => useVerse('1:1'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.verse).toBe(null);

    // Wait for fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify data
    expect(result.current.verse).not.toBe(null);
    expect(result.current.verse?.verseKey).toBe('1:1');
  });

  it('handles fetch errors', async () => {
    // Mock fetch to fail
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useVerse('999:999'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBe(null);
    expect(result.current.verse).toBe(null);
  });
});
```

### Utility Function Testing
```typescript
// utils/arabic.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeArabic, removeTashkeel, splitArabicWords } from './arabic';

describe('Arabic utilities', () => {
  describe('removeTashkeel', () => {
    it('removes all diacritical marks', () => {
      const input = 'بِسْمِ ٱللَّهِ';
      const expected = 'بسم ٱلله';
      expect(removeTashkeel(input)).toBe(expected);
    });

    it('preserves base letters', () => {
      const input = 'اَلْحَمْدُ';
      const expected = 'الحمد';
      expect(removeTashkeel(input)).toBe(expected);
    });
  });

  describe('normalizeArabic', () => {
    it('normalizes alef variations', () => {
      expect(normalizeArabic('أ')).toBe(normalizeArabic('ا'));
      expect(normalizeArabic('إ')).toBe(normalizeArabic('ا'));
      expect(normalizeArabic('آ')).toBe(normalizeArabic('ا'));
    });

    it('normalizes yaa variations', () => {
      expect(normalizeArabic('ي')).toBe(normalizeArabic('ى'));
    });
  });

  describe('splitArabicWords', () => {
    it('splits text by spaces', () => {
      const text = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ';
      const words = splitArabicWords(text);
      expect(words).toHaveLength(3);
      expect(words[0]).toBe('بِسْمِ');
    });

    it('handles multiple spaces', () => {
      const text = 'بِسْمِ  ٱللَّهِ';
      const words = splitArabicWords(text);
      expect(words).toHaveLength(2);
    });
  });
});
```

## Integration Testing

### API Endpoint Testing
```typescript
// app/api/quran/verse/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from './route';

describe('/api/quran/verse', () => {
  it('returns verse data for valid key', async () => {
    const request = new Request('http://localhost/api/quran/verse?key=1:1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verseKey).toBe('1:1');
    expect(data.textUthmani).toBeTruthy();
    expect(data.translationEn).toBeTruthy();
  });

  it('returns 400 for missing key', async () => {
    const request = new Request('http://localhost/api/quran/verse');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });

  it('returns 404 for invalid key', async () => {
    const request = new Request('http://localhost/api/quran/verse?key=999:999');
    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it('validates verse key format', async () => {
    const request = new Request('http://localhost/api/quran/verse?key=invalid');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid');
  });
});
```

### Database Integration Testing
```typescript
// lib/database.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Database Integration', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.practiceSession.deleteMany({
      where: { verseKey: { startsWith: 'test-' } },
    });
  });

  afterEach(async () => {
    await prisma.practiceSession.deleteMany({
      where: { verseKey: { startsWith: 'test-' } },
    });
  });

  it('creates practice session', async () => {
    const session = await prisma.practiceSession.create({
      data: {
        verseKey: 'test-1:1',
        accuracy: 95.5,
        totalWords: 10,
        correctWords: 9,
      },
    });

    expect(session.id).toBeTruthy();
    expect(session.accuracy).toBe(95.5);
  });

  it('updates verse progress', async () => {
    await prisma.verseProgress.upsert({
      where: { verseKey: 'test-1:1' },
      update: { totalAttempts: { increment: 1 } },
      create: { verseKey: 'test-1:1', totalAttempts: 1 },
    });

    const progress = await prisma.verseProgress.findUnique({
      where: { verseKey: 'test-1:1' },
    });

    expect(progress?.totalAttempts).toBeGreaterThan(0);
  });
});
```

## E2E Testing with Playwright

### Setup Playwright
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples
```typescript
// e2e/memorization.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Verse Memorization Flow', () => {
  test('user can practice a verse', async ({ page }) => {
    // Navigate to memorize page
    await page.goto('/memorize');

    // Select surah
    await page.click('text=Al-Fatihah');

    // Select verse
    await page.click('text=Verse 1');

    // Wait for verse to load
    await expect(page.locator('[dir="rtl"]')).toBeVisible();

    // Verify Arabic text is displayed
    const arabicText = await page.locator('[dir="rtl"]').textContent();
    expect(arabicText).toContain('بِسْمِ');

    // Start practice
    await page.click('button:has-text("Start Practice")');

    // Verify practice UI
    await expect(page.locator('text=Word 1')).toBeVisible();
  });

  test('displays progress after completion', async ({ page }) => {
    await page.goto('/memorize');

    // Complete practice session
    await page.click('text=Al-Fatihah');
    await page.click('text=Verse 1');
    await page.click('button:has-text("Start Practice")');

    // Simulate completion
    // (In real test, interact with practice UI)

    // Verify progress is shown
    await expect(page.locator('text=Accuracy')).toBeVisible();
    await expect(page.locator('text=%')).toBeVisible();
  });
});

test.describe('Tajweed Practice', () => {
  test('displays Tajweed colors', async ({ page }) => {
    await page.goto('/tajweed');

    // Select surah with Tajweed
    await page.click('text=Al-Fatihah');

    // Wait for Tajweed markup
    await page.waitForSelector('.text-green-600, .text-red-600, .text-blue-600', {
      state: 'visible',
    });

    // Verify colors are applied
    const coloredSpans = await page.locator('span[class*="text-"]').count();
    expect(coloredSpans).toBeGreaterThan(0);
  });
});
```

## Visual Regression Testing
```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('verse card matches screenshot', async ({ page }) => {
    await page.goto('/memorize');
    await page.click('text=Al-Fatihah');

    // Wait for verse card
    const verseCard = page.locator('[data-testid="verse-card"]');
    await verseCard.waitFor();

    // Take screenshot and compare
    await expect(verseCard).toHaveScreenshot('verse-card.png');
  });

  test('Tajweed colors match screenshot', async ({ page }) => {
    await page.goto('/tajweed/1/1');

    const tajweedVerse = page.locator('[data-testid="tajweed-verse"]');
    await tajweedVerse.waitFor();

    await expect(tajweedVerse).toHaveScreenshot('tajweed-verse.png');
  });
});
```

## Mocking & Fixtures

### MSW (Mock Service Worker)
```typescript
// test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/quran/verse', (req, res, ctx) => {
    const key = req.url.searchParams.get('key');

    if (key === '1:1') {
      return res(
        ctx.status(200),
        ctx.json({
          verseKey: '1:1',
          textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
          translationEn: 'In the name of Allah...',
          surahNumber: 1,
          ayahNumber: 1,
        })
      );
    }

    return res(ctx.status(404), ctx.json({ error: 'Verse not found' }));
  }),
];

// test/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Test Fixtures
```typescript
// test/fixtures/verses.ts
export const mockVerses = {
  fatiha1: {
    verseKey: '1:1',
    textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    textSimple: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    translationEn: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    surahNumber: 1,
    ayahNumber: 1,
    audioUrl: 'https://verses.quran.com/Abdul_Basit/mp3/001001.mp3',
  },
  ayatulKursi: {
    verseKey: '2:255',
    textUthmani: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ...',
    // ... full verse data
  },
};

// Use in tests
import { mockVerses } from '@/test/fixtures/verses';

test('renders Ayatul Kursi', () => {
  render(<VerseCard verse={mockVerses.ayatulKursi} />);
  // ...
});
```

## Test Coverage

### Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows covered

### Generate Coverage Report
```bash
# Run tests with coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Configuration
```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
  exclude: [
    'node_modules/',
    'test/',
    '.next/',
    '**/*.config.{js,ts}',
    '**/*.d.ts',
  ],
}
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Checklist

### Before Merging:
- [ ] All tests pass
- [ ] Coverage thresholds met
- [ ] No console errors/warnings
- [ ] E2E tests for new features
- [ ] Integration tests for API changes
- [ ] Unit tests for utility functions
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass

## Deliverables Format

When completing testing tasks:

1. **Test Files**: Created/modified test files
2. **Coverage Report**: Before/after coverage %
3. **Test Results**: All tests passing screenshot
4. **Bug Reproductions**: Steps to reproduce
5. **Recommendations**: Additional tests needed
