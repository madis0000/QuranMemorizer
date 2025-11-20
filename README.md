# 🌙 Quran Memorizer

> Your AI-powered companion for memorizing the Holy Quran with scientifically-backed spaced repetition, beautiful recitations, and personalized learning paths.

**بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ**

## ✨ Features

### Currently Implemented (Phase 1)

- ✅ **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- ✅ **Quran Foundation API Integration**: OAuth2 authentication with full API service
- ✅ **Spaced Repetition Algorithm (SM-2)**: Scientifically-backed memorization system
- ✅ **Beautiful UI Components**: Shadcn/ui with Islamic design theme
- ✅ **VerseCard Component**: Display verses with translations, tajweed, and memory strength
- ✅ **Audio Player**: Full-featured player with speed control, repeat modes
- ✅ **State Management**: Zustand stores for memorization progress and UI preferences
- ✅ **Dark/Light Theme**: System-aware theme switching
- ✅ **Responsive Layout**: Mobile-first design with sidebar navigation
- ✅ **TypeScript Types**: Comprehensive type definitions for all features

### Coming Soon (Phases 2-9)

- 🔄 **Database Integration**: Supabase for cloud sync
- 🔄 **Review Queue System**: Smart daily review recommendations
- 🔄 **Progress Analytics**: Detailed statistics and insights
- 🔄 **Gamification**: Achievements, XP, streaks, and challenges
- 🔄 **AI Features**: Claude-powered tafsir, mnemonics, and learning insights
- 🔄 **Social Features**: Study circles, accountability partners
- 🔄 **PWA Support**: Offline functionality
- 🔄 **Multi-language Support**: Arabic, English, Urdu, Indonesian, French

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd QuranMemorizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   The `.env.local` file is already configured with pre-production API credentials. For production, update with your own credentials.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

## 📁 Project Structure

```
QuranMemorizer/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles with CSS variables
├── components/              # React components
│   ├── ui/                  # Shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   ├── slider.tsx
│   │   └── tabs.tsx
│   ├── AudioPlayer.tsx      # Full-featured audio player
│   ├── VerseCard.tsx        # Verse display component
│   ├── Header.tsx           # App header with navigation
│   ├── Sidebar.tsx          # Mobile/desktop sidebar
│   ├── Footer.tsx           # App footer
│   └── ThemeProvider.tsx    # Theme initialization
├── services/                # API and business logic
│   ├── quranAPI.ts          # Quran Foundation API service
│   └── spacedRepetition.ts  # SM-2 algorithm implementation
├── store/                   # Zustand state management
│   ├── useMemorizationStore.ts  # Memorization progress state
│   └── useUIStore.ts            # UI preferences state
├── types/                   # TypeScript type definitions
│   └── index.ts             # All app types
├── lib/                     # Utility functions
│   └── utils.ts             # cn() utility for className merging
├── public/                  # Static assets
│   ├── fonts/
│   └── images/
└── .env.local              # Environment variables

```

## 🎨 Design System

### Colors

- **Primary**: Deep Islamic Green (#1B4F3A)
- **Accent**: Gold (#FFD700) for achievements
- **Background**: Adaptive based on theme
- **Tajweed Colors**: Proper color coding for Quranic rules

### Typography

- **Arabic**: Amiri font (loaded from Google Fonts)
- **English**: Inter font
- **Sizes**: Responsive with mobile-first approach

## 🔧 Key Technologies

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety and better DX |
| Tailwind CSS | Utility-first styling |
| Shadcn/ui | Beautiful, accessible components |
| Zustand | Lightweight state management |
| Howler.js | Audio playback |
| Framer Motion | Smooth animations |
| Recharts | Data visualization |
| Radix UI | Headless UI primitives |

## 🧠 Spaced Repetition (SM-2 Algorithm)

The app uses the SuperMemo 2 (SM-2) algorithm for optimal review scheduling:

- **Quality Ratings** (0-5):
  - 0: Complete blackout
  - 1: Incorrect but familiar
  - 2: Incorrect but easy after hint
  - 3: Correct with difficulty
  - 4: Correct with hesitation
  - 5: Perfect recall

- **Review Intervals**:
  - First review: 1 day
  - Second review: 6 days
  - Subsequent: Calculated based on easiness factor

## 📖 API Integration

### Quran Foundation API

The app integrates with the Quran Foundation API for:

- ✅ Verse retrieval with translations
- ✅ Audio recitations (multiple reciters)
- ✅ Tafsir (interpretations)
- ✅ Surah information
- ✅ Search functionality
- ✅ Word-by-word breakdown

**API Credentials**: Pre-configured for development. See `.env.example` for production setup.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Adding New Components

We follow the Shadcn/ui pattern for new UI components:

```tsx
// components/ui/example.tsx
import { cn } from "@/lib/utils"

export function Example({ className, ...props }) {
  return <div className={cn("base-classes", className)} {...props} />
}
```

### State Management

Use Zustand stores for global state:

```tsx
// In a component
import { useMemorizationStore } from '@/store/useMemorizationStore'

function MyComponent() {
  const { recordReview } = useMemorizationStore()

  const handleReview = () => {
    recordReview('1:1', 5) // Perfect recall
  }
}
```

## 🗓️ Roadmap

### Phase 1: Foundation ✅ (COMPLETED)
- Project setup
- API integration
- Core components
- Spaced repetition algorithm

### Phase 2: Core Features (Next Up)
- Review queue interface
- Verse memorization flow
- Progress tracking
- Local storage persistence

### Phase 3: Database & Sync
- Supabase integration
- User authentication
- Cloud progress sync
- Multi-device support

### Phase 4: Enhanced Learning
- Multi-modal learning modes
- Audio looping and practice
- Voice recording comparison
- Interactive exercises

### Phase 5: Gamification
- Achievement system
- XP and leveling
- Daily challenges
- Leaderboards

### Phase 6: AI Features
- Claude AI integration
- Smart tafsir summaries
- Mnemonic generation
- Personalized learning plans

### Phase 7: Social
- Study circles
- Accountability partners
- Reflection sharing
- Community features

### Phase 8: Polish
- Accessibility improvements
- Performance optimization
- PWA functionality
- Mobile optimization

### Phase 9: Launch
- Testing
- Documentation
- Deployment
- Marketing materials

## 🤝 Contributing

This is a learning project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Quran Foundation** for providing the API
- **Anthropic** for Claude AI capabilities
- **The Muslim Ummah** for inspiration and purpose

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Check the FAQ (coming soon)
- Join our community (coming soon)

---

**وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ**

*"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"* (Quran 54:17)

---

Made with ❤️ for Muslims worldwide
