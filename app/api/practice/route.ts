import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/practice - Save a new practice session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      verseKey,
      accuracy,
      totalWords,
      correctWords,
      duration,
      perfectWords = 0,
      isMemoryMode = false,
      difficulty,
      strictness,
    } = body;

    // Validate required fields
    if (!verseKey || accuracy === undefined || !totalWords || correctWords === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create practice session
    const session = await prisma.practiceSession.create({
      data: {
        verseKey,
        accuracy,
        totalWords,
        correctWords,
        duration,
        perfectWords,
        isMemoryMode,
        difficulty,
        strictness,
      },
    });

    // Update verse progress
    const existingProgress = await prisma.verseProgress.findUnique({
      where: { verseKey },
    });

    if (existingProgress) {
      // Update existing progress
      const newTotalAttempts = existingProgress.totalAttempts + 1;
      const newAverageAccuracy =
        (existingProgress.averageAccuracy * existingProgress.totalAttempts + accuracy) /
        newTotalAttempts;

      await prisma.verseProgress.update({
        where: { verseKey },
        data: {
          totalAttempts: newTotalAttempts,
          bestAccuracy: Math.max(existingProgress.bestAccuracy, accuracy),
          averageAccuracy: newAverageAccuracy,
          isPerfect: existingProgress.isPerfect || accuracy === 100,
        },
      });
    } else {
      // Create new progress entry
      await prisma.verseProgress.create({
        data: {
          verseKey,
          totalAttempts: 1,
          bestAccuracy: accuracy,
          averageAccuracy: accuracy,
          isPerfect: accuracy === 100,
        },
      });
    }

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await prisma.dailyStats.findUnique({
      where: { date: today },
    });

    if (dailyStats) {
      await prisma.dailyStats.update({
        where: { date: today },
        data: {
          versesPracticed: { increment: 1 },
          totalWords: { increment: totalWords },
          correctWords: { increment: correctWords },
          practiceTime: { increment: duration || 0 },
          averageAccuracy:
            (dailyStats.averageAccuracy * dailyStats.versesPracticed + accuracy) /
            (dailyStats.versesPracticed + 1),
        },
      });
    } else {
      await prisma.dailyStats.create({
        data: {
          date: today,
          versesPracticed: 1,
          totalWords,
          correctWords,
          practiceTime: duration || 0,
          averageAccuracy: accuracy,
        },
      });
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error saving practice session:', error);
    return NextResponse.json(
      { error: 'Failed to save practice session' },
      { status: 500 }
    );
  }
}

// GET /api/practice - Get practice sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verseKey = searchParams.get('verseKey');
    const limit = parseInt(searchParams.get('limit') || '50');

    const sessions = await prisma.practiceSession.findMany({
      where: verseKey ? { verseKey } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching practice sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice sessions' },
      { status: 500 }
    );
  }
}
