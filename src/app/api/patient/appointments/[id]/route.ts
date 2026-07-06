import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment || appointment.patientId !== session.userId) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  if (appointment.status !== 'PENDING') {
    return NextResponse.json({ error: 'Can only cancel pending appointments' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.appointment.delete({ where: { id } }),
    prisma.availability.update({
      where: { id: appointment.slotId },
      data: { isBooked: false },
    }),
  ]);

  return NextResponse.json({ success: true });
}
