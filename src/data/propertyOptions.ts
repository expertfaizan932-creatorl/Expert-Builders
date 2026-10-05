import { api } from '../api';

/** Values the backend currently accepts; anything else found in data is added on top. */
export const DEFAULT_CURRENT_STATUSES = ['UnSold', 'Sold'];
export const DEFAULT_STATUSES = ['Active', 'Inactive'];

/** Keeps the defaults first, then appends any extra values sorted alphabetically. */
export function mergeOptions(defaults: string[], extra: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  [...defaults, ...extra].forEach((v) => {
    const t = v?.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  });
  return out;
}

/** Distinct values actually present in the dataset, so nothing gets hidden. */
export function collectValues(rows: { current_status?: string }[], field: 'current_status'): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    const v = r[field]?.trim();
    if (v) set.add(v);
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

/**
 * Distinct `current_status` values across all properties, cached for the session.
 * The list endpoint returns every row, so no extra endpoint is needed.
 */
export function fetchCurrentStatusOptions(): Promise<string[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = api
      .listProperties()
      .then((res) => {
        cached = collectValues(res.data ?? [], 'current_status');
        return cached;
      })
      .catch(() => {
        cached = [];
        return cached;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function resetStatusOptionsCache(): void {
  cached = null;
  inflight = null;
}