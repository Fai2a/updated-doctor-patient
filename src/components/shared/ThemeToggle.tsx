'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className="relative w-10 h-10 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      {/* Avoid hydration mismatch: render a stable icon until mounted */}
      <Sun
        className={`w-5 h-5 absolute transition-all duration-300 ${
          mounted && !dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
      <Moon
        className={`w-5 h-5 absolute transition-all duration-300 ${
          mounted && dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
    </button>
  );
}
