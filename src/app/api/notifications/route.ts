import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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
  } catch (error) {
    return handleApiError('GET /api/notifications', error);
  }
}
