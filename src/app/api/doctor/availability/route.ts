import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const availability = await prisma.availability.findMany({
    where: { doctorId: session.userId },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(availability);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { date, startTime, endTime } = await request.json();

  const slot = await prisma.availability.create({
    data: {
      doctorId: session.userId,
      date: new Date(date),
      startTime,
      endTime,
    },
  });

  return NextResponse.json(slot);
}
