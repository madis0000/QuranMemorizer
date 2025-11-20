/**
 * Tajweed HTML Word Segmentation Utilities
 * Handles splitting Tajweed-marked HTML into individual words while preserving markup
 */

export interface TajweedWord {
  html: string;          // HTML with Tajweed tags: "<tajweed class="qalaqah">ق</tajweed>لْ"
  plainText: string;     // Plain text for matching: "قلْ"
  position: number;      // Word index in verse
}

/**
 * Tajweed color mapping (matches TajweedText.tsx colorMap)
 */
const TAJWEED_COLOR_MAP: Record<string, string> = {
  'ham_wasl': '#d500b7',
  'madda_normal': '#d500b7',
  'madda_permissible': '#d500b7',
  'madda_necessary': '#d500b7',
  'madda_obligatory': '#ff0000',
  'silent': '#aaaaaa',
  'lam_shamsiyah': '#aaaaaa',
  'laam_shamsiyah': '#aaaaaa',
  'ikhfa_shafawi': '#169777',
  'ikhfa': '#169777',
  'ikhafa': '#169777',
  'ikhafa_shafawi': '#169777',
  'iqlab': '#ff7e1e',
  'qalaqala': '#0088ff',
  'qalqalah': '#0088ff',
  'qalaqah': '#0088ff',
  'ghunna': '#ff69b4',
  'sukun': '#aaaaaa',
  'idgham_wo_ghunnah': '#aaaaaa',
  'idgham_ghunna': '#d500b7',
  'idgham_shafawi': '#ff69b4',
  'idgham_mutajanisayn': '#d500b7',
  'idgham_mutaqaribayn': '#d500b7',
  'slnt': '#aaaaaa'
};

/**
 * Convert Tajweed HTML tags to colored spans
 * Processes <tajweed class="...">text</tajweed> to <span style="color: ...">text</span>
 */
function applyTajweedColorsToHtml(html: string): string {
  if (!html) return html;

  // Process <tajweed> tags with both quoted and unquoted class attributes
  let processed = html.replace(
    /<tajweed\s+class=["']?([^"'\s>]+)["']?[^>]*>(.*?)<\/tajweed>/gs,
    (match, className, content) => {
      let color = '';

      // Find matching color
      for (const [key, value] of Object.entries(TAJWEED_COLOR_MAP)) {
        if (className.toLowerCase().includes(key)) {
          color = value;
          break;
        }
      }

      if (color) {
        return `<span style="color: ${color} !important;">${content}</span>`;
      }
      return content;
    }
  );

  // Also handle any remaining <span> tags with classes
  processed = processed.replace(
    /<span\s+class=["']?([^"'\s>]+)["']?[^>]*>(.*?)<\/span>/gs,
    (match, className, content) => {
      // Skip if already has style attribute
      if (match.includes('style=')) {
        return match;
      }

      let color = '';
      for (const [key, value] of Object.entries(TAJWEED_COLOR_MAP)) {
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

  return processed;
}

/**
 * Extract plain text from HTML, removing all tags
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

/**
 * Split Tajweed HTML into word segments
 * Strategy: Build a character-by-character mapping of HTML positions to plain text positions
 */
export function splitTajweedHtmlByWords(tajweedHtml: string): TajweedWord[] {
  if (!tajweedHtml) return [];

  // Remove verse number markers (e.g., <span class=end>٤</span>) before processing
  // These are visual markers and should not be counted as words to memorize
  let cleanedHtml = tajweedHtml.replace(/<span[^>]*class=["']?end["']?[^>]*>.*?<\/span>/gi, '');

  // Step 1: Extract plain text and split into words
  const plainText = stripHtmlTags(cleanedHtml);
  const plainWords = plainText
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0);

  if (plainWords.length === 0) return [];

  // Step 2: Build character mapping (HTML index -> plain text index)
  const charMap: number[] = []; // Maps plain text index to HTML index
  let plainIdx = 0;
  let inTag = false;

  for (let i = 0; i < cleanedHtml.length; i++) {
    const char = cleanedHtml[i];

    if (char === '<') {
      inTag = true;
    } else if (char === '>') {
      inTag = false;
      continue;
    }

    if (!inTag) {
      charMap[plainIdx] = i;
      plainIdx++;
    }
  }

  // Step 3: Find word boundaries in plain text
  const wordBoundaries: Array<{ start: number; end: number; text: string }> = [];
  let searchStart = 0;

  for (const word of plainWords) {
    const startIdx = plainText.indexOf(word, searchStart);
    if (startIdx === -1) {
      console.warn(`Word "${word}" not found in plain text`);
      continue;
    }

    wordBoundaries.push({
      start: startIdx,
      end: startIdx + word.length,
      text: word,
    });

    searchStart = startIdx + word.length;
  }

  // Step 4: Extract HTML segments for each word
  const result: TajweedWord[] = [];

  for (let i = 0; i < wordBoundaries.length; i++) {
    const boundary = wordBoundaries[i];
    const htmlStart = charMap[boundary.start] || 0;

    // Find HTML end: look for next word start or end of string
    let htmlEnd: number;
    if (i < wordBoundaries.length - 1) {
      // Find whitespace before next word in HTML
      const nextWordHtmlStart = charMap[wordBoundaries[i + 1].start];
      htmlEnd = cleanedHtml.lastIndexOf(' ', nextWordHtmlStart - 1) + 1;
      if (htmlEnd === 0) htmlEnd = nextWordHtmlStart; // No space found
    } else {
      htmlEnd = cleanedHtml.length;
    }

    // Extract HTML segment and clean up
    let htmlSegment = cleanedHtml.substring(htmlStart, htmlEnd).trim();

    // Ensure all opened tags are closed
    htmlSegment = balanceHtmlTags(htmlSegment);

    result.push({
      html: htmlSegment,
      plainText: boundary.text,
      position: i,
    });
  }

  return result;
}

/**
 * Balance HTML tags - ensure all opened tags are closed
 * Handles nested <tajweed> tags
 */
function balanceHtmlTags(html: string): string {
  const openTags: string[] = [];
  let balanced = html;

  // Find all opening tags
  const openTagRegex = /<(tajweed|span)([^>]*)>/g;
  let match;

  while ((match = openTagRegex.exec(html)) !== null) {
    openTags.push(match[1]);
  }

  // Find all closing tags
  const closeTags = (html.match(/<\/(tajweed|span)>/g) || []).map(
    tag => tag.replace(/<\/|>/g, '')
  );

  // Add missing closing tags
  for (const tag of openTags) {
    if (!closeTags.includes(tag) || openTags.filter(t => t === tag).length > closeTags.filter(t => t === tag).length) {
      balanced += `</${tag}>`;
    }
  }

  return balanced;
}

/**
 * Render word with Memory Mode hiding/revealing logic
 * Combines HTML Tajweed markup with progressive hints
 */
export function renderTajweedWordWithMemoryMode(
  tajweedWord: TajweedWord,
  isMemoryMode: boolean,
  isRevealed: boolean,
  hintsShown: number,
  memoryDifficulty: 'easy' | 'medium' | 'hard',
  isCurrent: boolean
): string {
  // If not in memory mode or word is revealed, show full HTML with colors
  if (!isMemoryMode || isRevealed) {
    return applyTajweedColorsToHtml(tajweedWord.html);
  }

  // Memory mode - word is hidden
  const plainText = tajweedWord.plainText;

  // Non-current words: show placeholder
  if (!isCurrent) {
    if (memoryDifficulty === 'hard') {
      return '___';
    } else {
      return '_'.repeat(Math.min(plainText.length, 10));
    }
  }

  // Current word: show hints based on attempts
  if (hintsShown === 0) {
    // No hints
    if (memoryDifficulty === 'hard') {
      return '___';
    } else {
      return '_'.repeat(Math.min(plainText.length, 10));
    }
  } else if (hintsShown === 1) {
    // Show first letter with Tajweed colors
    const hintHtml = extractFirstLettersWithTajweed(tajweedWord.html, 1);
    return applyTajweedColorsToHtml(hintHtml);
  } else if (hintsShown === 2) {
    // Show first 2 letters with Tajweed colors
    const hintHtml = extractFirstLettersWithTajweed(tajweedWord.html, 2);
    return applyTajweedColorsToHtml(hintHtml);
  } else {
    // Show full word with colors
    return applyTajweedColorsToHtml(tajweedWord.html);
  }
}

/**
 * Extract first N letters from Tajweed HTML while preserving colors
 * Handles RTL and HTML tags
 */
function extractFirstLettersWithTajweed(html: string, count: number): string {
  const plainText = stripHtmlTags(html);

  if (count >= plainText.length) {
    return html;
  }

  // Build result by traversing HTML and counting visible characters
  let result = '';
  let visibleChars = 0;
  let inTag = false;
  let currentTag = '';
  const openTags: string[] = [];

  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    if (char === '<') {
      inTag = true;
      currentTag = '';
    }

    if (inTag) {
      currentTag += char;
      if (char === '>') {
        inTag = false;

        // Track opening tags
        if (!currentTag.startsWith('</')) {
          result += currentTag;
          const tagName = currentTag.match(/<(\w+)/)?.[1];
          if (tagName) openTags.push(tagName);
        } else {
          // Closing tag
          result += currentTag;
          openTags.pop();
        }

        currentTag = '';
      }
    } else {
      // Visible character
      if (visibleChars < count) {
        result += char;
        visibleChars++;
      } else {
        break;
      }
    }
  }

  // Close any open tags
  while (openTags.length > 0) {
    const tag = openTags.pop();
    result += `</${tag}>`;
  }

  // Add remaining placeholder underscores
  const remaining = Math.max(0, Math.min(plainText.length - count, 8));
  const placeholder = '_'.repeat(remaining);

  return result + placeholder;
}
