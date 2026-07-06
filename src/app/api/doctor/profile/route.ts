import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.userId },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { photo, specialization, experience, bio } = await request.json();

  const profile = await prisma.doctorProfile.upsert({
    where: { userId: session.userId },
    update: { photo, specialization, experience: parseInt(experience), bio },
    create: {
      userId: session.userId,
      photo,
      specialization,
      experience: parseInt(experience),
      bio,
    },
  });

  return NextResponse.json(profile);
}
