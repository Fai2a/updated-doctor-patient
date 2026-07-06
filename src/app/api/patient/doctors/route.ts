import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      specialization: { not: '' },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(doctors);
}
