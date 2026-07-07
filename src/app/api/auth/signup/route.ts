import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import { handleApiError, readJson } from '@/lib/api';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await readJson(request);

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (role !== 'DOCTOR' && role !== 'PATIENT') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ userId: user.id, role: user.role, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true, path: '/' });

    return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    return handleApiError('POST /api/auth/signup', error);
  }
}
