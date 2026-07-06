'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  HeartPulse,
  Stethoscope,
  Check,
} from 'lucide-react';
import { BrandPanel } from '@/components/shared/BrandPanel';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(form.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient');
    } else {
      setError(data.error || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="w-11 h-11 rounded-xl brand-gradient grid place-items-center shadow-[var(--shadow-glow)]">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold brand-text">MediBook</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground mt-2">Join MediBook and get care in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20 animate-scale-in">
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/90 ml-1">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  active={form.role === 'PATIENT'}
                  onClick={() => setForm({ ...form, role: 'PATIENT' })}
                  icon={HeartPulse}
                  title="Patient"
                  desc="Book appointments"
                />
                <RoleCard
                  active={form.role === 'DOCTOR'}
                  onClick={() => setForm({ ...form, role: 'DOCTOR' })}
                  icon={Stethoscope}
                  title="Doctor"
                  desc="Offer consultations"
                />
              </div>
            </div>

            <Field label="Full name">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card outline-none transition-all"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>

            <Field label="Email address">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-card outline-none transition-all"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>

            <Field label="Password">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-border bg-card outline-none transition-all"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full brand-gradient text-white py-4 rounded-2xl font-bold shadow-[var(--shadow-glow)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground/90 ml-1">{label}</label>
      <div className="relative">{children}</div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
        active
          ? 'border-primary bg-primary/5 shadow-[var(--shadow-sm)]'
          : 'border-border hover:border-primary/40 bg-card'
      }`}
    >
      {active && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full brand-gradient grid place-items-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      )}
      <span
        className={`inline-grid place-items-center w-10 h-10 rounded-xl mb-2 transition-colors ${
          active ? 'brand-gradient text-white' : 'bg-secondary text-muted-foreground'
        }`}
      >
        <Icon className="w-5 h-5" />
      </span>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}
