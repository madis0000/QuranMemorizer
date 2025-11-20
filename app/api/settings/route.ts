import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/settings - Save or update a setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: key and value' },
        { status: 400 }
      );
    }

    // Upsert setting (update if exists, create if not)
    const setting = await prisma.userSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: {
        key,
        value: JSON.stringify(value),
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

// GET /api/settings - Get all settings or a specific setting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific setting
      const setting = await prisma.userSetting.findUnique({
        where: { key },
      });

      if (!setting) {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        key: setting.key,
        value: JSON.parse(setting.value),
      });
    } else {
      // Get all settings
      const settings = await prisma.userSetting.findMany();

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = JSON.parse(setting.value);
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json(settingsMap);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
