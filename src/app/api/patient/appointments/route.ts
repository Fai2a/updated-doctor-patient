import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError, readJson } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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
  } catch (error) {
    return handleApiError('GET /api/patient/appointments', error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId, slotId, concern } = await readJson(request);

    if (!doctorId || !slotId || !concern) {
      return NextResponse.json(
        { error: 'Doctor, slot, and concern are required' },
        { status: 400 }
      );
    }

    // Check if slot is still available
    const slot = await prisma.availability.findUnique({ where: { id: slotId } });
    if (!slot || slot.isBooked) {
      return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
    }

    // Create the appointment and mark the slot booked atomically so a failure
    // between the two writes can't leave an appointment on an "available" slot
    // (Atlas provides a replica set, so transactions are supported).
    const [appointment] = await prisma.$transaction([
      prisma.appointment.create({
        data: {
          doctorId,
          patientId: session.userId,
          slotId,
          concern,
          status: 'PENDING',
        },
      }),
      prisma.availability.update({
        where: { id: slotId },
        data: { isBooked: true },
      }),
    ]);

    return NextResponse.json(appointment);
  } catch (error) {
    return handleApiError('POST /api/patient/appointments', error);
  }
}
