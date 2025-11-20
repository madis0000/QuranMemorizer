-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "verseKey" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "correctWords" INTEGER NOT NULL,
    "duration" INTEGER,
    "perfectWords" INTEGER NOT NULL DEFAULT 0,
    "isMemoryMode" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" TEXT,
    "strictness" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerseProgress" (
    "id" TEXT NOT NULL,
    "verseKey" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "bestAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPracticed" TIMESTAMP(3) NOT NULL,
    "firstPracticed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPerfect" BOOLEAN NOT NULL DEFAULT false,
    "streak" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VerseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versesPracticed" INTEGER NOT NULL DEFAULT 0,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "correctWords" INTEGER NOT NULL DEFAULT 0,
    "practiceTime" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeSession_verseKey_createdAt_idx" ON "PracticeSession"("verseKey", "createdAt");

-- CreateIndex
CREATE INDEX "PracticeSession_createdAt_idx" ON "PracticeSession"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_key_key" ON "UserSetting"("key");

-- CreateIndex
CREATE INDEX "UserSetting_key_idx" ON "UserSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "VerseProgress_verseKey_key" ON "VerseProgress"("verseKey");

-- CreateIndex
CREATE INDEX "VerseProgress_verseKey_idx" ON "VerseProgress"("verseKey");

-- CreateIndex
CREATE INDEX "VerseProgress_lastPracticed_idx" ON "VerseProgress"("lastPracticed");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");

-- CreateIndex
CREATE INDEX "DailyStats_date_idx" ON "DailyStats"("date");
