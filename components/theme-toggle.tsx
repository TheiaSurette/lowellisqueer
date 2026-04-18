'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';

const modes = ['light', 'dark', 'system'] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-5" />;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border p-0.5">
      {modes.map((mode) => {
        const active = theme === mode;
        const Icon = mode === 'light' ? SunIcon : mode === 'dark' ? MoonIcon : MonitorIcon;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`rounded-full p-1.5 transition-colors ${
              active
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
            title={mode.charAt(0).toUpperCase() + mode.slice(1)}
          >
            <Icon className="size-3" />
          </button>
        );
      })}
    </div>
  );
}
