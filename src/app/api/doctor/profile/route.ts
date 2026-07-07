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

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError('GET /api/doctor/profile', error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photo, specialization, experience, bio } = await readJson(request);

    if (!specialization) {
      return NextResponse.json({ error: 'Specialization is required' }, { status: 400 });
    }

    const years = parseInt(String(experience), 10);
    if (Number.isNaN(years)) {
      return NextResponse.json({ error: 'Experience must be a number' }, { status: 400 });
    }

    const profile = await prisma.doctorProfile.upsert({
      where: { userId: session.userId },
      update: { photo, specialization, experience: years, bio },
      create: {
        userId: session.userId,
        photo,
        specialization,
        experience: years,
        bio,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError('PUT /api/doctor/profile', error);
  }
}
