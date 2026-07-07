import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Never cache — this must reflect live DB state on every call.
export const dynamic = 'force-dynamic';

/**
 * Lightweight diagnostic endpoint. Hit /api/health in any environment to check
 * whether the app can actually reach MongoDB. Returns 200 when connected,
 * 503 when not. The real error is logged server-side (Vercel logs); only a
 * safe summary is returned to the caller.
 */
export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);

  try {
    // MongoDB ping via Prisma raw command — cheap and doesn't touch app data.
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      env: { DATABASE_URL: hasDbUrl },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API_ERROR] GET /api/health:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'unreachable',
        // Signals the two most common misconfigurations without leaking secrets.
        env: { DATABASE_URL: hasDbUrl },
        hint: hasDbUrl
          ? 'DATABASE_URL is set but the connection failed — check Atlas Network Access (allow 0.0.0.0/0) and the DB user credentials.'
          : 'DATABASE_URL is NOT set in this environment — add it in Vercel → Settings → Environment Variables, then redeploy.',
        errorName: error instanceof Error ? error.name : 'UnknownError',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
