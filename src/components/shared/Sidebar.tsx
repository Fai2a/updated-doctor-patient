'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  Settings,
  Search,
  BookOpen,
  LogOut,
  Activity,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'DOCTOR' | 'PATIENT';
}

const doctorTabs = [
  { name: 'Profile', tab: 'profile', href: '/dashboard/doctor?tab=profile', icon: User },
  { name: 'Appointments', tab: 'appointments', href: '/dashboard/doctor?tab=appointments', icon: Calendar },
  { name: 'Availability', tab: 'availability', href: '/dashboard/doctor?tab=availability', icon: Settings },
];

const patientTabs = [
  { name: 'Find Doctors', tab: 'find', href: '/dashboard/patient?tab=find', icon: Search },
  { name: 'My Bookings', tab: 'bookings', href: '/dashboard/patient?tab=bookings', icon: BookOpen },
];

export function Sidebar({ role }: SidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabs = role === 'DOCTOR' ? doctorTabs : patientTabs;
  const defaultTab = role === 'DOCTOR' ? 'profile' : 'find';
  const activeTab = searchParams.get('tab') || defaultTab;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-card/70 backdrop-blur-xl h-screen sticky top-0 flex-col">
      {/* Brand */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-10 h-10 rounded-xl brand-gradient grid place-items-center shadow-[var(--shadow-glow)] group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight brand-text">MediBook</span>
            <span className="text-[11px] font-medium text-muted-foreground mt-1">
              {role === 'DOCTOR' ? 'Clinician Portal' : 'Patient Portal'}
            </span>
          </span>
        </Link>
      </div>

      <div className="px-6 mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = tab.tab === activeTab;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary-foreground brand-gradient shadow-[var(--shadow-glow)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <span
                className={cn(
                  'grid place-items-center w-8 h-8 rounded-lg transition-colors',
                  isActive
                    ? 'bg-white/20'
                    : 'bg-secondary group-hover:bg-primary/10 group-hover:text-primary'
                )}
              >
                <tab.icon className="w-[18px] h-[18px]" />
              </span>
              <span className="font-medium text-sm">{tab.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Support card */}
      <div className="px-4 pb-3">
        <div className="rounded-2xl border border-border bg-secondary/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Need help?</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our care team is available 24/7 for any questions.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
        >
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-secondary">
            <LogOut className="w-[18px] h-[18px]" />
          </span>
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </aside>
  );
}
