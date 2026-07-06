'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { BrandPanel } from '@/components/shared/BrandPanel';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(data.user.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient');
    } else {
      setError(data.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <BrandPanel />

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="w-11 h-11 rounded-xl brand-gradient grid place-items-center shadow-[var(--shadow-glow)]">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold brand-text">MediBook</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Log in to manage your appointments and care.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-destructive/10 text-destructive rounded-xl text-sm font-medium border border-destructive/20 animate-scale-in">
                {error}
              </div>
            )}

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
                placeholder="••••••••"
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
                  Log in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">
              Create one
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
