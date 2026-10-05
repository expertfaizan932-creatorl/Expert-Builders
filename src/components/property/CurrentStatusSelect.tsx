import PillSelect, { type PillSelectStyle } from './PillSelect';

/** Per-status colors, mirroring the badge palette already used in the Property module. */
const STATUS_STYLE: Record<string, PillSelectStyle> = {
  Sold: { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
};

/**
 * Current Status (Sold / UnSold) rendered as a select instead of a static badge.
 * It keeps the badge's pill shape, colors, and typography, and adds a caret.
 */
export default function CurrentStatusSelect({
  value,
  options,
  onChange,
  className = '',
  ariaLabel = 'Current status',
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  /** Wrapper sizing, e.g. `w-full` in a table cell or `w-32` on a card. */
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <PillSelect
      value={value || 'UnSold'}
      options={options}
      onChange={onChange}
      styles={STATUS_STYLE}
      className={className}
      ariaLabel={ariaLabel}
      title="Change current status"
    />
  );
}
