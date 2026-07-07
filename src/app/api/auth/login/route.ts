import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import { handleApiError, readJson } from '@/lib/api';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await readJson(request);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ userId: user.id, role: user.role, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true, path: '/' });

    return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    return handleApiError('POST /api/auth/login', error);
  }
}
