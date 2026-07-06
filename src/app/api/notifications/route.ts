import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.userId,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}
