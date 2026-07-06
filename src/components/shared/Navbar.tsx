'use client';

import { useSearchParams } from 'next/navigation';
import { Activity } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  userName: string;
  role: 'DOCTOR' | 'PATIENT';
}

const titles: Record<string, { title: string; subtitle: string }> = {
  profile: { title: 'My Profile', subtitle: 'Manage how patients see you' },
  appointments: { title: 'Appointments', subtitle: 'Review and respond to patient requests' },
  availability: { title: 'Availability', subtitle: 'Set the times patients can book' },
  find: { title: 'Find a Doctor', subtitle: 'Browse specialists and book instantly' },
  bookings: { title: 'My Bookings', subtitle: 'Track your upcoming appointments' },
};

export function Navbar({ userName, role }: NavbarProps) {
  const searchParams = useSearchParams();
  const defaultTab = role === 'DOCTOR' ? 'profile' : 'find';
  const tab = searchParams.get('tab') || defaultTab;
  const heading = titles[tab] ?? { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-16 border-b border-border bg-card/70 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile brand (sidebar is hidden on small screens) */}
        <span className="md:hidden w-9 h-9 rounded-xl brand-gradient grid place-items-center shrink-0">
          <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold tracking-tight truncate">
            {heading.title}
          </h1>
          <p className="hidden sm:block text-xs text-muted-foreground truncate">
            {heading.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <NotificationBell />

        <div className="w-px h-8 bg-border mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-semibold truncate max-w-[10rem]">{userName}</span>
            <span className="text-[11px] text-muted-foreground capitalize">
              {role.toLowerCase()}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full brand-gradient grid place-items-center text-white font-bold text-sm shadow-[var(--shadow-sm)] ring-2 ring-card">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
