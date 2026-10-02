import type {
  PropertySaleStatus,
  PropertyStatus,
  PropertyType,
} from '../../api';

/** Shared design tokens for the Property module (matches the app's brand blue). */
export const PROP = {
  brand: '#0A58A3',
  brandDark: '#0A4A8C',
  brandSoft: '#EFF6FF',
  success: '#22C55E',
  cyan: '#18CFE3',
  canvas: '#F7F7F8',
  text: '#374151',
  muted: '#6B7280',
  border: '#E5E7EB',
} as const;

/** Shared layout classes for the Property form sections (icon rail + numbered steps). */
export const STEP_ICON_CLS =
  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500';
export const STEP_LABEL_CLS = 'mb-3 block text-sm font-bold text-slate-800';
export const FIELD_CLS =
  'w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-700 shadow-sm outline-none transition focus:border-brand-blue focus:text-slate-800';
export const CARET_CLS =
  'pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400';

const base =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap';

/** Sold / UnSold — the sale state of a property. */
export function CurrentStatusBadge({ value }: { value: PropertySaleStatus | string }) {
  const isSold = value === 'Sold';
  return (
    <span
      className={base}
      style={
        isSold
          ? { background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' }
          : { background: '#ECFEFF', color: '#0E7490', borderColor: '#A5F3FC' }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: isSold ? PROP.success : PROP.cyan }}
      />
      {value || 'UnSold'}
    </span>
  );
}

/** Active / Inactive — the listing state of a property. */
export function StatusBadge({ value }: { value: PropertyStatus | string }) {
  const isActive = value === 'Active';
  return (
    <span
      className={base}
      style={
        isActive
          ? { background: PROP.brandSoft, color: PROP.brand, borderColor: '#BFDBFE' }
          : { background: '#F1F5F9', color: PROP.muted, borderColor: '#E2E8F0' }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: isActive ? PROP.success : '#94A3B8' }}
      />
      {value || 'Inactive'}
    </span>
  );
}

const TYPE_STYLES: Record<string, { bg: string; fg: string; bd: string }> = {
  Residential: { bg: '#EFF6FF', fg: '#1D4ED8', bd: '#BFDBFE' },
  Commercial: { bg: '#FFF7ED', fg: '#C2410C', bd: '#FED7AA' },
  Industrial: { bg: '#F5F3FF', fg: '#6D28D9', bd: '#DDD6FE' },
  Plot: { bg: '#F0FDF4', fg: '#15803D', bd: '#BBF7D0' },
};

export function TypeBadge({ value }: { value: PropertyType | string }) {
  const s = TYPE_STYLES[value] ?? TYPE_STYLES.Residential;
  return (
    <span className={base} style={{ background: s.bg, color: s.fg, borderColor: s.bd }}>
      {value || 'Residential'}
    </span>
  );
}

const AVATAR_TONES = [
  ['#EFF6FF', '#0A58A3'],
  ['#ECFEFF', '#0E7490'],
  ['#FFF7ED', '#C2410C'],
  ['#EFF6FF', '#1D4ED8'],
  ['#F5F3FF', '#6D28D9'],
  ['#FDF2F8', '#BE185D'],
] as const;

/** Deterministic avatar colour so a property always looks the same. */
export function PropertyAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const seed = (name || '?').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = AVATAR_TONES[seed % AVATAR_TONES.length];
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const cls =
    size === 'lg'
      ? 'h-14 w-14 text-lg'
      : size === 'sm'
      ? 'h-7 w-7 text-[10px]'
      : 'h-9 w-9 text-xs';

  return (
    <span
      className={`${cls} flex shrink-0 items-center justify-center rounded-full font-bold`}
      style={{ background: bg, color: fg }}
    >
      {initial}
    </span>
  );
}