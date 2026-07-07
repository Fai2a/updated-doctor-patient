import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

/**
 * Central API error handler.
 *
 * - Always logs the *real* error server-side (visible in Vercel runtime logs).
 * - Maps known failure modes to correct HTTP status codes.
 * - Returns a helpful (but non-sensitive) message. Full detail is logged, not
 *   sent to the client, except in non-production where the message aids local
 *   debugging.
 *
 * Pass a `context` label (e.g. "POST /api/auth/login") so logs are greppable.
 */
export function handleApiError(context: string, error: unknown): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';

  // Log the full error with a stable, searchable prefix.
  console.error(`[API_ERROR] ${context}:`, error);

  // Database is unreachable / misconfigured (missing DATABASE_URL, Atlas
  // network block, bad credentials). This is a server/infra problem, so 503.
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error: 'Database connection failed. Check DATABASE_URL and Atlas network access.',
        code: 'DB_CONNECTION',
      },
      { status: 503 }
    );
  }

  // Known Prisma request errors carry a code we can translate.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record with that value already exists.', code: error.code },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found.', code: error.code },
        { status: 404 }
      );
    }
    // P2010 = raw query failed (e.g. Atlas permission denied). Surface as 502.
    return NextResponse.json(
      { error: 'A database request failed.', code: error.code },
      { status: 502 }
    );
  }

  // Malformed JSON body from the client.
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Fallback. Expose the message only outside production.
  const message =
    !isProd && error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Safely parse a JSON request body. Throws a SyntaxError (handled as 400 by
 * handleApiError) on malformed input rather than a bare 500.
 */
// Defaults to `any` so call sites can destructure fields directly (matching the
// ergonomics of `request.json()`); pass an explicit type argument for safety.
export async function readJson<T = any>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new SyntaxError('Request body is not valid JSON');
  }
}
