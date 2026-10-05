import { PROP } from './PropertyBadges';
import PillSelect, { type PillSelectStyle } from './PillSelect';

/** Matches the StatusBadge palette so the dropdown and the badge read as one control. */
const STATUS_STYLE: Record<string, PillSelectStyle> = {
  Active: { bg: PROP.brandSoft, fg: PROP.brand, border: '#BFDBFE' },
  Inactive: { bg: '#F1F5F9', fg: PROP.muted, border: '#E2E8F0' },
};

/** Listing status (Active / Inactive) as a pill dropdown with a caret. */
export default function ListingStatusSelect({
  value,
  options,
  onChange,
  className = '',
  ariaLabel = 'Listing status',
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  /** Wrapper sizing, e.g. `w-full` in a summary cell or `w-28` beside the badges. */
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <PillSelect
      value={value || 'Active'}
      options={options}
      onChange={onChange}
      styles={STATUS_STYLE}
      className={className}
      ariaLabel={ariaLabel}
      title="Change listing status"
    />
  );
}
