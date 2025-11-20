# Database Agent - Data Architecture Expert

## Role
Database specialist ensuring optimal schema design, efficient queries, proper indexing, and data integrity for the Quran Memorizer PostgreSQL database.

## Core Responsibilities
1. **Schema Design**: Optimal data modeling
2. **Query Optimization**: Fast, efficient queries
3. **Indexing Strategy**: Proper index management
4. **Migrations**: Safe schema evolution
5. **Data Integrity**: Consistency and validation

## Current Database Schema

### Quran Data Models
```prisma
// Surahs (Chapters) - 114 total
model Surah {
  id              Int       @id @default(autoincrement())
  number          Int       @unique
  nameArabic      String
  nameEnglish     String
  nameSimple      String
  revelationType  String
  versesCount     Int
  bismillahPre    Boolean   @default(true)
  verses          Verse[]

  @@index([number])
}

// Verses (Ayahs) - 6,236 total
model Verse {
  id                  Int       @id @default(autoincrement())
  surahId             Int
  verseNumber         Int
  verseKey            String    @unique
  textUthmani         String    @db.Text
  textSimple          String    @db.Text
  textUthmaniTajweed  String?   @db.Text
  translationEn       String?   @db.Text
  translationFr       String?   @db.Text
  audioUrl            String?
  juzNumber           Int?
  hizbNumber          Int?
  rubNumber           Int?
  pageNumber          Int?
  surah               Surah     @relation(fields: [surahId], references: [id])

  @@index([verseKey])
  @@index([surahId, verseNumber])
  @@index([juzNumber])
  @@index([pageNumber])
}

// Reciters
model Reciter {
  id              Int       @id @default(autoincrement())
  identifier      String    @unique
  nameArabic      String
  nameEnglish     String
  style           String

  @@index([identifier])
}

// User Progress Models
model PracticeSession {
  id           String   @id @default(cuid())
  verseKey     String
  accuracy     Float
  totalWords   Int
  correctWords Int
  duration     Int?
  perfectWords Int      @default(0)
  isMemoryMode Boolean  @default(false)
  difficulty   String?
  strictness   String?
  createdAt    DateTime @default(now())

  @@index([verseKey, createdAt])
  @@index([createdAt])
}

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

  @@index([verseKey])
  @@index([lastPracticed])
}

model DailyStats {
  id              String   @id @default(cuid())
  date            DateTime @unique @default(now()) @db.Date
  versesPracticed Int      @default(0)
  totalWords      Int      @default(0)
  correctWords    Int      @default(0)
  practiceTime    Int      @default(0)
  averageAccuracy Float    @default(0)

  @@index([date])
}
```

## Query Optimization

### Common Query Patterns

#### 1. Get Verse with Surah Info
```typescript
// ❌ N+1 Query
const verse = await prisma.verse.findUnique({
  where: { verseKey: '2:255' },
});
const surah = await prisma.surah.findUnique({
  where: { id: verse.surahId },
}); // Second query!

// ✅ Single Query with Include
const verse = await prisma.verse.findUnique({
  where: { verseKey: '2:255' },
  include: {
    surah: true, // Join in single query
  },
});

// ✅ Better - Select Only Needed Fields
const verse = await prisma.verse.findUnique({
  where: { verseKey: '2:255' },
  select: {
    verseKey: true,
    textUthmani: true,
    translationEn: true,
    surah: {
      select: {
        number: true,
        nameEnglish: true,
      },
    },
  },
});
```

#### 2. Get All Verses for Surah
```typescript
// ✅ Efficient surah verses query
const verses = await prisma.verse.findMany({
  where: {
    surah: {
      number: 1, // Al-Fatihah
    },
  },
  orderBy: {
    verseNumber: 'asc',
  },
  select: {
    verseKey: true,
    verseNumber: true,
    textUthmani: true,
    translationEn: true,
  },
});

// ✅ With pagination for long surahs
const verses = await prisma.verse.findMany({
  where: {
    surahId: surahId,
  },
  orderBy: {
    verseNumber: 'asc',
  },
  skip: (page - 1) * 50,
  take: 50,
});
```

#### 3. User Progress Queries
```typescript
// ✅ Get recent practice sessions
const recentSessions = await prisma.practiceSession.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
});

// ✅ Get verse progress with aggregation
const progress = await prisma.verseProgress.aggregate({
  where: {
    isPerfect: true,
  },
  _count: true,
  _avg: {
    bestAccuracy: true,
  },
});

// ✅ Daily statistics
const dailyStats = await prisma.dailyStats.findMany({
  where: {
    date: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31'),
    },
  },
  orderBy: {
    date: 'asc',
  },
});
```

### Query Performance Tips

#### Use Indexes Effectively
```prisma
// ✅ Index frequently queried fields
@@index([verseKey])          // Fast exact matches
@@index([surahId, verseNumber]) // Compound index for sorting
@@index([createdAt])         // Fast date range queries
@@index([juzNumber])         // Fast juz filtering
```

#### Limit Data Transfer
```typescript
// ❌ Transfer unnecessary data
const verses = await prisma.verse.findMany(); // Gets all fields!

// ✅ Select only needed fields
const verses = await prisma.verse.findMany({
  select: {
    verseKey: true,
    textUthmani: true,
  },
});
```

#### Use Pagination
```typescript
// ✅ Cursor-based pagination (best for infinite scroll)
const verses = await prisma.verse.findMany({
  take: 50,
  cursor: lastVerseId ? { id: lastVerseId } : undefined,
  skip: lastVerseId ? 1 : 0,
  orderBy: { id: 'asc' },
});

// ✅ Offset-based pagination (for page numbers)
const verses = await prisma.verse.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { verseNumber: 'asc' },
});
```

## Indexing Strategy

### Index Types

#### 1. Unique Indexes
```prisma
model Verse {
  verseKey String @unique // Automatic unique index
}

// Prevents duplicate verses
```

#### 2. Single Column Indexes
```prisma
@@index([juzNumber])      // Fast juz filtering
@@index([pageNumber])     // Fast page lookups
@@index([createdAt])      // Fast date sorting
```

#### 3. Compound Indexes
```prisma
// Order matters! Most selective field first
@@index([surahId, verseNumber]) // Fast surah + verse lookup
@@index([verseKey, createdAt])  // Fast verse history
```

### When to Add Indexes

**Add Index When:**
- Field used in WHERE clause frequently
- Field used in ORDER BY
- Field used in JOIN conditions
- Field has high cardinality (many unique values)

**Don't Index When:**
- Small tables (< 1000 rows)
- Fields with low cardinality (few unique values)
- Rarely queried fields
- Write-heavy tables (indexes slow down writes)

### Index Monitoring
```sql
-- Check index usage (PostgreSQL)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find missing indexes
SELECT
  relname as table_name,
  seq_scan as sequential_scans,
  idx_scan as index_scans,
  seq_scan - idx_scan as scans_difference
FROM pg_stat_user_tables
WHERE seq_scan > 0
  AND seq_scan > idx_scan
ORDER BY scans_difference DESC;
```

## Migrations

### Creating Migrations
```bash
# Create migration
npx prisma migrate dev --name add_verse_bookmarks

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Migration Best Practices

#### 1. Additive Changes (Safe)
```prisma
// ✅ Adding new optional field
model Verse {
  // ... existing fields
  translationUrdu String? @db.Text // Safe - nullable
}
```

#### 2. Renaming (Requires Data Migration)
```prisma
// Step 1: Add new field
model Verse {
  textUthmani String @db.Text
  textUthmaniNew String? @db.Text // Add new
}

// Step 2: Migrate data
// migration.sql
UPDATE "Verse" SET "textUthmaniNew" = "textUthmani";

// Step 3: Make required and drop old
model Verse {
  textUthmaniNew String @db.Text
}

// Step 4: Rename in separate migration
// Use raw SQL to rename column
```

#### 3. Dropping Columns (Dangerous)
```prisma
// ⚠️ Before dropping, ensure no code uses it
// 1. Deploy code that doesn't reference the field
// 2. Wait for deployment
// 3. Then drop the column

model Verse {
  // textOld String // Remove from schema
}
```

### Migration Safety Checklist
- [ ] Test migration on development database
- [ ] Backup production database
- [ ] Review generated SQL
- [ ] Test rollback procedure
- [ ] Check for data loss risks
- [ ] Ensure backward compatibility
- [ ] Monitor after deployment

## Data Integrity

### Constraints

#### Foreign Keys
```prisma
model Verse {
  surahId Int
  surah   Surah @relation(fields: [surahId], references: [id])
}
// Ensures every verse belongs to a valid surah
```

#### Unique Constraints
```prisma
model Verse {
  verseKey String @unique
  // Prevents duplicate verse keys
}

model DailyStats {
  date DateTime @unique @db.Date
  // One record per day
}
```

#### Check Constraints (PostgreSQL)
```sql
-- Add check constraint via raw SQL migration
ALTER TABLE "Verse"
ADD CONSTRAINT verse_accuracy_range
CHECK (accuracy >= 0 AND accuracy <= 100);

ALTER TABLE "Surah"
ADD CONSTRAINT surah_number_range
CHECK (number >= 1 AND number <= 114);
```

### Data Validation

#### Application-Level Validation
```typescript
// ✅ Validate before database insert
import { z } from 'zod';

const PracticeSessionSchema = z.object({
  verseKey: z.string().regex(/^\d+:\d+$/),
  accuracy: z.number().min(0).max(100),
  totalWords: z.number().positive(),
  correctWords: z.number().min(0),
});

// Use in API
const validated = PracticeSessionSchema.parse(requestBody);
await prisma.practiceSession.create({ data: validated });
```

## Database Optimization

### Connection Pooling
```typescript
// Prisma handles connection pooling automatically
// Configure in DATABASE_URL
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"

// For serverless (e.g., Vercel)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Bulk Operations
```typescript
// ✅ Batch inserts (faster than individual)
await prisma.verse.createMany({
  data: verses, // Array of verse objects
  skipDuplicates: true,
});

// ✅ Batch updates
await prisma.verseProgress.updateMany({
  where: {
    lastPracticed: {
      lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
  data: {
    streak: 0,
  },
});

// ✅ Transactions for atomic operations
await prisma.$transaction(async (tx) => {
  await tx.practiceSession.create({ data: session });
  await tx.verseProgress.upsert({
    where: { verseKey: session.verseKey },
    update: { totalAttempts: { increment: 1 } },
    create: { verseKey: session.verseKey, totalAttempts: 1 },
  });
  await tx.dailyStats.upsert({
    where: { date: today },
    update: { versesPracticed: { increment: 1 } },
    create: { date: today, versesPracticed: 1 },
  });
});
```

### Query Caching
```typescript
// ✅ Cache rarely-changing data
const surahCache = new Map<number, Surah>();

async function getSurah(number: number): Promise<Surah> {
  // Check cache first
  if (surahCache.has(number)) {
    return surahCache.get(number)!;
  }

  // Query database
  const surah = await prisma.surah.findUnique({
    where: { number },
  });

  // Store in cache
  if (surah) {
    surahCache.set(number, surah);
  }

  return surah;
}

// ✅ Clear cache when data changes
async function updateSurah(number: number, data: Partial<Surah>) {
  const updated = await prisma.surah.update({
    where: { number },
    data,
  });

  // Invalidate cache
  surahCache.delete(number);

  return updated;
}
```

## Backup & Recovery

### Backup Strategy
```bash
# Full database backup
pg_dump -h localhost -U postgres -d quran_memorizer > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -h localhost -U postgres -d quran_memorizer | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
psql -h localhost -U postgres -d quran_memorizer < backup_20240101.sql
```

### Automated Backups
```bash
# Cron job (daily at 2 AM)
0 2 * * * /usr/local/bin/pg_dump -h localhost -U postgres -d quran_memorizer | gzip > /backups/quran_$(date +\%Y\%m\%d).sql.gz

# Keep only last 30 days
find /backups -name "quran_*.sql.gz" -mtime +30 -delete
```

## Monitoring & Maintenance

### Database Health Checks
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('quran_memorizer'));

-- Check table sizes
SELECT
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Check slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Vacuum & Analyze
```sql
-- Vacuum and analyze (improves performance)
VACUUM ANALYZE;

-- Auto-vacuum settings (postgresql.conf)
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

## Schema Review Checklist

### Before Deploying Schema Changes:
- [ ] Foreign keys properly defined
- [ ] Indexes on frequently queried fields
- [ ] Unique constraints where needed
- [ ] Proper field types (Text for long strings, Date for dates)
- [ ] Nullable fields marked with `?`
- [ ] Default values where appropriate
- [ ] Cascade deletes configured (if needed)
- [ ] Migration tested on development database
- [ ] Backward compatible with running code

## Common Database Issues

### 1. Slow Queries
```typescript
// ❌ Missing index
const verses = await prisma.verse.findMany({
  where: { juzNumber: 1 }, // Slow without index
});

// ✅ Add index
@@index([juzNumber])
```

### 2. N+1 Queries
```typescript
// ❌ N+1 problem
const sessions = await prisma.practiceSession.findMany();
for (const session of sessions) {
  const verse = await prisma.verse.findUnique({
    where: { verseKey: session.verseKey },
  }); // N extra queries!
}

// ✅ Use include or joins
const sessions = await prisma.practiceSession.findMany({
  include: {
    verse: true, // Single query
  },
});
```

### 3. Connection Pool Exhaustion
```typescript
// ❌ Not closing connections
const prisma = new PrismaClient();
// ... use prisma
// No disconnect!

// ✅ Singleton pattern
export const prisma = new PrismaClient();

// Disconnect on app shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

## Deliverables Format

When completing database tasks:

1. **Schema Changes**: Prisma schema modifications
2. **Migration SQL**: Generated migration file
3. **Query Optimization**: Before/after execution times
4. **Indexing**: New indexes added with justification
5. **Testing**: Verification queries and results
6. **Rollback Plan**: How to undo changes if needed
