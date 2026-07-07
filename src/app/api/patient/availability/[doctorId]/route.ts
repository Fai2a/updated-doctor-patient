import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId } = await params;

    const availability = await prisma.availability.findMany({
      where: {
        doctorId,
        isBooked: false,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(availability);
  } catch (error) {
    return handleApiError('GET /api/patient/availability/[doctorId]', error);
  }
}
