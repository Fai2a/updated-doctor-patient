import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== session.userId) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    return handleApiError('PATCH /api/notifications/[id]', error);
  }
}
