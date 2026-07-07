import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Verbose query logging only in development; errors/warnings in production.
    log:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'error', 'warn'],
  });

// Cache the client on the global object in development so hot-reload doesn't
// spawn a new connection pool on every change. In production each serverless
// instance keeps its own single client, which is the intended behaviour.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
