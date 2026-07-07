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
  // Both are required in production. Report presence (never the values).
  const env = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI),
    JWT_SECRET: Boolean(process.env.JWT_SECRET),
  };

  try {
    // MongoDB ping via Prisma raw command — cheap and doesn't touch app data.
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      status: env.JWT_SECRET ? 'ok' : 'degraded',
      database: 'connected',
      env,
      hint: env.JWT_SECRET
        ? undefined
        : 'Database is fine, but JWT_SECRET is missing — login/signup will 500 until you set it in Vercel and redeploy.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API_ERROR] GET /api/health:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'unreachable',
        // Signals the most common misconfigurations without leaking secrets.
        env,
        hint: !env.MONGODB_URI
          ? 'MONGODB_URI is NOT set in this environment — add it in Vercel → Settings → Environment Variables, then redeploy.'
          : 'MONGODB_URI is set but the connection failed — check Atlas Network Access (allow 0.0.0.0/0) and the DB user credentials.',
        errorName: error instanceof Error ? error.name : 'UnknownError',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
