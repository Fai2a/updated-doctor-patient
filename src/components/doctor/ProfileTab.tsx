'use client';

import { useState, useEffect } from 'react';
import { Save, User as UserIcon, Loader2, Upload, Trash2, BadgeCheck, Sparkles } from 'lucide-react';
import { Skeleton } from '../shared/Skeleton';
import { toast } from '../shared/Toast';

export default function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    photo: '',
    specialization: '',
    experience: 0,
    bio: '',
  });

  useEffect(() => {
    fetch('/api/doctor/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data)
          setProfile({
            photo: data.photo || '',
            specialization: data.specialization || '',
            experience: data.experience || 0,
            bio: data.bio || '',
          });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/doctor/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    if (res.ok) toast('Profile updated successfully', 'success');
    else toast('Could not save your profile', 'error');
  };

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('Please choose an image smaller than 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProfile((p) => ({ ...p, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      {/* Identity card */}
      <div className="card-surface p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border bg-secondary grid place-items-center">
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-9 h-9 text-muted-foreground" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full brand-gradient grid place-items-center text-white cursor-pointer shadow-[var(--shadow-sm)] hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {profile.specialization || 'Your specialization'}
              </h2>
              <BadgeCheck className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {profile.experience ? `${profile.experience} years of experience` : 'Add your experience'}{' '}
              · Visible in patient searches
            </p>
            {profile.photo && (
              <button
                type="button"
                onClick={() => setProfile({ ...profile, photo: '' })}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details form */}
      <form onSubmit={handleSave} className="card-surface p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Profile details</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Specialization</label>
            <input
              type="text"
              placeholder="e.g. Cardiologist"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none transition-all"
              value={profile.specialization}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Years of experience</label>
            <input
              type="number"
              min={0}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none transition-all"
              value={profile.experience}
              onChange={(e) =>
                setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold">Professional bio</label>
          <textarea
            rows={4}
            placeholder="Tell patients about your expertise, approach, and areas of focus..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none transition-all resize-none"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
          <p className="text-xs text-muted-foreground ml-1">
            A clear bio helps patients choose you with confidence.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="brand-gradient text-white px-6 py-3 rounded-xl font-bold shadow-[var(--shadow-glow)] hover:brightness-105 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
