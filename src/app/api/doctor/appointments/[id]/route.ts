import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError, readJson } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await readJson<{ action?: string }>(request); // "accept" or "reject"
    const { id } = await params;

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, slot: true },
    });

    if (!appointment || appointment.doctorId !== session.userId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    // If rejected, free up the slot
    if (action === 'reject') {
      await prisma.availability.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    }

    // Create notification for patient
    const dateStr = appointment.slot.date.toLocaleDateString();
    const timeStr = `${appointment.slot.startTime} - ${appointment.slot.endTime}`;
    const message = `Dr. ${appointment.doctor.name} ${action}ed your appointment for ${dateStr} at ${timeStr}`;

    await prisma.notification.create({
      data: {
        userId: appointment.patientId,
        message,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    return handleApiError('PATCH /api/doctor/appointments/[id]', error);
  }
}
