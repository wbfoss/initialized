import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { settingsUpdateSchema, yearQuerySchema, validateInput } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    // Validate year parameter
    const validation = validateInput(yearQuerySchema, { year: yearParam });
    if (!validation.success) {
      return NextResponse.json(
        { error: `Invalid input: ${validation.error}` },
        { status: 400 }
      );
    }

    const year = validation.data.year;

    const settings = await prisma.profileSettings.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
    });

    if (!settings) {
      // Return defaults
      return NextResponse.json({
        year,
        publicProfileEnabled: false,
        includePrivateRepos: false,
        themeVariant: 'nebula-blue',
      });
    }

    return NextResponse.json({
      year: settings.year,
      publicProfileEnabled: settings.publicProfileEnabled,
      includePrivateRepos: settings.includePrivateRepos,
      themeVariant: settings.themeVariant,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(
      `settings:${session.user.id}`,
      RATE_LIMITS.settings
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const validation = validateInput(settingsUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: `Invalid input: ${validation.error}` },
        { status: 400 }
      );
    }

    const { year, publicProfileEnabled, includePrivateRepos, themeVariant } = validation.data;

    const settings = await prisma.profileSettings.upsert({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
      update: {
        publicProfileEnabled: publicProfileEnabled ?? undefined,
        includePrivateRepos: includePrivateRepos ?? undefined,
        themeVariant: themeVariant ?? undefined,
      },
      create: {
        userId: session.user.id,
        year,
        publicProfileEnabled: publicProfileEnabled ?? false,
        includePrivateRepos: includePrivateRepos ?? false,
        themeVariant: themeVariant ?? 'nebula-blue',
      },
    });

    return NextResponse.json(
      {
        success: true,
        settings: {
          year: settings.year,
          publicProfileEnabled: settings.publicProfileEnabled,
          includePrivateRepos: settings.includePrivateRepos,
          themeVariant: settings.themeVariant,
        },
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
