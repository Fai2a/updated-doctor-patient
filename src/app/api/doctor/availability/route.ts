import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError, readJson } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const availability = await prisma.availability.findMany({
      where: { doctorId: session.userId },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(availability);
  } catch (error) {
    return handleApiError('GET /api/doctor/availability', error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, startTime, endTime } = await readJson(request);

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const slot = await prisma.availability.create({
      data: {
        doctorId: session.userId,
        date: parsedDate,
        startTime,
        endTime,
      },
    });

    return NextResponse.json(slot);
  } catch (error) {
    return handleApiError('POST /api/doctor/availability', error);
  }
}
