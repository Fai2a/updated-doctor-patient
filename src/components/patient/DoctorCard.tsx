'use client';

import { BadgeCheck, Briefcase, CalendarDays, ArrowRight } from 'lucide-react';

interface DoctorCardProps {
  doctor: any;
  onBook: (doctor: any) => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const name: string = doctor.user.name;
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="card-surface overflow-hidden lift group flex flex-col">
      {/* Header banner */}
      <div className="relative h-28 brand-gradient overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 text-primary backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
          <BadgeCheck className="w-3.5 h-3.5" /> Verified
        </span>
      </div>

      {/* Avatar overlapping banner */}
      <div className="px-6 -mt-10">
        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-card bg-secondary grid place-items-center shadow-[var(--shadow-md)]">
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-2xl font-extrabold brand-text">{initials}</span>
          )}
        </div>
      </div>

      <div className="p-6 pt-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-primary text-sm font-semibold">{doctor.specialization}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">
            <Briefcase className="w-3.5 h-3.5 text-primary/70" />
            {doctor.experience} yrs exp
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2.5 py-1 rounded-full">
            <CalendarDays className="w-3.5 h-3.5" />
            Accepting patients
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-4 min-h-[2.5rem]">
          {doctor.bio || 'This specialist has not added a bio yet.'}
        </p>

        <button
          onClick={() => onBook(doctor)}
          className="mt-5 w-full bg-secondary hover:bg-primary hover:text-white text-secondary-foreground py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
        >
          Book appointment
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
