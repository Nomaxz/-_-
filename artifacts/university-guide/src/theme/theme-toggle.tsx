import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { readStoredTheme, resolveTheme, writeStoredTheme, type Theme } from './theme-core';
import type { Language } from '../test-content';

const QUERY = '(prefers-color-scheme: dark)';

function getStorage(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

function getMedia(): MediaQueryList | null {
  try { return typeof window.matchMedia === 'function' ? window.matchMedia(QUERY) : null; } catch { return null; }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function ThemeToggle({ language }: { language: Language }) {
  const [explicit, setExplicit] = useState<Theme | null>(() => readStoredTheme(getStorage()));
  const [systemDark, setSystemDark] = useState(() => Boolean(getMedia()?.matches));
  const theme = resolveTheme(explicit, systemDark);

  useEffect(() => {
    const media = getMedia();
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener?.(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener?.(onChange);
    };
  }, []);

  useEffect(() => applyTheme(theme), [theme]);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = language === 'ru'
    ? (next === 'dark' ? 'Включить тёмную тему' : 'Включить светлую тему')
    : (next === 'dark' ? 'Switch to dark theme' : 'Switch to light theme');

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => { setExplicit(next); writeStoredTheme(getStorage(), next); }}
      aria-label={label}
      title={label}
      aria-pressed={theme === 'dark'}
      data-testid="button-theme"
    >
      {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
}
