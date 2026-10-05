import { HiOutlineChevronDown } from 'react-icons/hi2';

export interface PillSelectStyle {
  bg: string;
  fg: string;
  border: string;
}

/** Fallback palette; specific selects pass their own map so unknown values stay readable. */
export const PILL_DEFAULT_STYLE: PillSelectStyle = {
  bg: '#ECFEFF',
  fg: '#0E7490',
  border: '#A5F3FC',
};

/**
 * A small pill-shaped select with a caret on the right. Shared by the Property
 * module's status dropdowns so every one of them looks and behaves the same.
 */
export default function PillSelect({
  value,
  options,
  onChange,
  styles,
  className = '',
  ariaLabel,
  title,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  /** Per-value colors; anything not listed falls back to `PILL_DEFAULT_STYLE`. */
  styles?: Record<string, PillSelectStyle>;
  /** Wrapper sizing, e.g. `w-full` in a table cell or `w-32` on a card. */
  className?: string;
  ariaLabel: string;
  title: string;
}) {
  const current = value || options[0] || '';
  const style = styles?.[current] ?? PILL_DEFAULT_STYLE;

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label={ariaLabel}
        title={title}
        style={{ background: style.bg, color: style.fg, borderColor: style.border }}
        className="w-full cursor-pointer appearance-none rounded-full border py-0.5 pl-2.5 pr-6 text-[11px] font-semibold whitespace-nowrap outline-none transition hover:brightness-95 focus:ring-1 focus:ring-brand-blue/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-1.5 flex items-center"
        style={{ color: style.fg }}
      >
        <HiOutlineChevronDown className="h-3 w-3" />
      </span>
    </span>
  );
}
