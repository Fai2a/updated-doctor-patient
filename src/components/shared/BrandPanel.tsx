import {
  Activity,
  ShieldCheck,
  CalendarClock,
  Stethoscope,
} from 'lucide-react';

/**
 * The marketing / brand side of the auth split-screen.
 * Purely presentational — shown on lg+ screens.
 */
export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden brand-gradient text-white p-12">
      {/* Decorative orbs + dot grid */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-float" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
          <Activity className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <span className="text-2xl font-extrabold tracking-tight">MediBook</span>
      </div>

      <div className="relative space-y-8 max-w-md">
        <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
          Healthcare, booked in seconds.
        </h2>
        <p className="text-white/80 text-lg leading-relaxed">
          Connect with trusted specialists, manage your schedule, and stay on top of your
          care — all in one calm, effortless place.
        </p>

        <div className="space-y-4">
          <Feature icon={Stethoscope} title="Verified specialists" desc="Every clinician is reviewed and vetted." />
          <Feature icon={CalendarClock} title="Real-time availability" desc="See open slots and book instantly." />
          <Feature icon={ShieldCheck} title="Private & secure" desc="Your health data stays protected." />
        </div>
      </div>

      <div className="relative flex items-center gap-8 text-white/90">
        <Stat value="10k+" label="Patients" />
        <div className="w-px h-10 bg-white/20" />
        <Stat value="500+" label="Doctors" />
        <div className="w-px h-10 bg-white/20" />
        <Stat value="4.9★" label="Avg rating" />
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-white/70">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}
