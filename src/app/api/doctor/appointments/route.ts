import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: session.userId },
      include: {
        patient: { select: { name: true, email: true } },
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return handleApiError('GET /api/doctor/appointments', error);
  }
}
