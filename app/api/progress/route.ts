import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/progress - Get verse progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verseKey = searchParams.get('verseKey');

    if (verseKey) {
      // Get specific verse progress
      const progress = await prisma.verseProgress.findUnique({
        where: { verseKey },
      });

      if (!progress) {
        return NextResponse.json(
          { error: 'Progress not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(progress);
    } else {
      // Get all verse progress
      const progress = await prisma.verseProgress.findMany({
        orderBy: { lastPracticed: 'desc' },
      });

      return NextResponse.json(progress);
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
