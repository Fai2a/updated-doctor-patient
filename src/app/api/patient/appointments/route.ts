import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.userId },
    include: {
      doctor: { select: { name: true } },
      slot: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { doctorId, slotId, concern } = await request.json();

  // Check if slot is still available
  const slot = await prisma.availability.findUnique({
    where: { id: slotId },
  });

  if (!slot || slot.isBooked) {
    return NextResponse.json({ error: 'Slot no longer available' }, { status: 400 });
  }

  // Create appointment and mark slot as booked
  // Note: sequential calls instead of $transaction for MongoDB free-tier compatibility
  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      patientId: session.userId,
      slotId,
      concern,
      status: 'PENDING',
    },
  });

  await prisma.availability.update({
    where: { id: slotId },
    data: { isBooked: true },
  });

  return NextResponse.json(appointment);
}
