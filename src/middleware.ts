import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';

const protectedRoutes = ['/dashboard/doctor', '/dashboard/patient'];
const publicRoutes = ['/auth/login', '/auth/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get('session')?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  // 1. Redirect to /auth/login if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
  }

  // 2. Redirect to dashboard if user is authenticated but trying to access public routes
  if (isPublicRoute && session && !path.startsWith('/dashboard')) {
    const dashboard = session.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient';
    return NextResponse.redirect(new URL(dashboard, req.nextUrl));
  }

  // 3. Role-based access control
  if (path.startsWith('/dashboard/doctor') && session?.role !== 'DOCTOR') {
    return NextResponse.redirect(new URL('/dashboard/patient', req.nextUrl));
  }
  if (path.startsWith('/dashboard/patient') && session?.role !== 'PATIENT') {
    return NextResponse.redirect(new URL('/dashboard/doctor', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
