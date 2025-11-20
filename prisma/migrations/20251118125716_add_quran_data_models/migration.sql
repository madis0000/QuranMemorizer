-- CreateTable
CREATE TABLE "Surah" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "nameArabic" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "nameSimple" TEXT NOT NULL,
    "revelationType" TEXT NOT NULL,
    "versesCount" INTEGER NOT NULL,
    "bismillahPre" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Surah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verse" (
    "id" SERIAL NOT NULL,
    "surahId" INTEGER NOT NULL,
    "verseNumber" INTEGER NOT NULL,
    "verseKey" TEXT NOT NULL,
    "textUthmani" TEXT NOT NULL,
    "textSimple" TEXT NOT NULL,
    "textUthmaniTajweed" TEXT,
    "translationEn" TEXT,
    "translationFr" TEXT,
    "audioUrl" TEXT,
    "juzNumber" INTEGER,
    "hizbNumber" INTEGER,
    "rubNumber" INTEGER,
    "pageNumber" INTEGER,

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reciter" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "nameArabic" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "style" TEXT NOT NULL,

    CONSTRAINT "Reciter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Surah_number_key" ON "Surah"("number");

-- CreateIndex
CREATE INDEX "Surah_number_idx" ON "Surah"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_verseKey_key" ON "Verse"("verseKey");

-- CreateIndex
CREATE INDEX "Verse_verseKey_idx" ON "Verse"("verseKey");

-- CreateIndex
CREATE INDEX "Verse_surahId_verseNumber_idx" ON "Verse"("surahId", "verseNumber");

-- CreateIndex
CREATE INDEX "Verse_juzNumber_idx" ON "Verse"("juzNumber");

-- CreateIndex
CREATE INDEX "Verse_pageNumber_idx" ON "Verse"("pageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Reciter_identifier_key" ON "Reciter"("identifier");

-- CreateIndex
CREATE INDEX "Reciter_identifier_idx" ON "Reciter"("identifier");

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "Surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
