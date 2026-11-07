import { useSyncExternalStore } from 'react';
import { universities } from '../catalog';
import { universityKey } from '@workspace/campass-data';

export const COMPARE_MAX = 4;
export const COMPARE_MIN = 2;
const KEY = 'campass-compare-ids';
const validIds = new Set(universities.map((item) => item.id));
const identities = new Map(universities.map((item) => [item.id, universityKey(item)]));

function sanitize(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item === 'string' && validIds.has(item) && !seen.has(identities.get(item)!)) {
      out.push(item);
      seen.add(identities.get(item)!);
    }
    if (out.length >= COMPARE_MAX) break;
  }
  return out;
}

function read(): string[] {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return [];
  }
}

let ids: string[] = read();
const listeners = new Set<() => void>();

function write(next: string[]) {
  ids = sanitize(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Comparison still works in memory when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

export const compareStore = {
  add(id: string): 'added' | 'full' | 'exists' {
    if (!validIds.has(id) || ids.some((item) => identities.get(item) === identities.get(id))) return 'exists';
    if (ids.length >= COMPARE_MAX) return 'full';
    write([...ids, id]);
    return 'added';
  },
  remove(id: string) { write(ids.filter((item) => item !== id)); },
  clear() { write([]); },
};

export function useCompareIds() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => ids,
  );
}
