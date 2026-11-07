export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'university-guide-theme';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function readStoredTheme(storage: StorageLike | null | undefined): Theme | null {
  try {
    return parseTheme(storage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredTheme(storage: StorageLike | null | undefined, theme: Theme): boolean {
  try {
    if (!storage) return false;
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

/** Explicit stored choice wins; otherwise follow the system preference. */
export function resolveTheme(stored: Theme | null, systemPrefersDark: boolean): Theme {
  return stored ?? (systemPrefersDark ? 'dark' : 'light');
}
