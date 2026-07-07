import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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
  } catch (error) {
    return handleApiError('GET /api/patient/doctors', error);
  }
}
