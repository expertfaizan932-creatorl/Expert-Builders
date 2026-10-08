import { useState } from 'react';
import {
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineEllipsisHorizontal,
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlinePlus,
  HiOutlineRectangleStack,
  HiOutlineShieldCheck,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { STEP_ICON_CLS } from './PropertyBadges';

export const BEDROOM_CHIPS = [
  'Studio',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '10+',
];

export const BATHROOM_CHIPS = ['1', '2', '3', '4', '5', '6', '6+'];

type FieldKind = 'check' | 'text' | 'number' | 'select';

interface AmenityField {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  placeholder?: string;
}

interface AmenityTab {
  key: string;
  label: string;
  fields: AmenityField[];
}

export const AMENITY_TABS: AmenityTab[] = [
  {
    key: 'main',
    label: 'Main Features',
    fields: [
      {
        key: 'Flooring',
        label: 'Flooring',
        kind: 'select',
        options: ['Marble / Tiles', 'Wooden', 'Carpeted'],
      },
      {
        key: 'Electricity Backup',
        label: 'Electricity Backup',
        kind: 'select',
        options: ['Generator', 'UPS / Inverter', 'Solar Power', 'None'],
      },
      { key: 'View', label: 'View', kind: 'text' },
      { key: 'Other Main Features', label: 'Other Main Features', kind: 'text' },
      { key: 'Built in year', label: 'Built in year', kind: 'text' },
      { key: 'Parking Spaces', label: 'Parking Spaces', kind: 'text', placeholder: 'Count' },
      { key: 'Floors', label: 'Floors', kind: 'text', placeholder: 'Count' },
      { key: 'Double Glazed Windows', label: 'Double Glazed Windows', kind: 'check' },
      { key: 'Central Air Conditioning', label: 'Central Air Conditioning', kind: 'check' },
      { key: 'Central Heating', label: 'Central Heating', kind: 'check' },
      { key: 'Waste Disposal', label: 'Waste Disposal', kind: 'check' },
      { key: 'Elevator or Lift', label: 'Elevator or Lift', kind: 'check' },
    ],
  },
  {
    key: 'rooms',
    label: 'Rooms',
    fields: [
      { key: 'Bedrooms', label: 'Bedrooms', kind: 'text', placeholder: 'Count' },
      { key: 'Bathrooms', label: 'Bathrooms', kind: 'text', placeholder: 'Count' },
      { key: 'Servant Quarters', label: 'Servant Quarters', kind: 'check' },
      { key: 'Drawing Room', label: 'Drawing Room', kind: 'check' },
      { key: 'Dining Room', label: 'Dining Room', kind: 'check' },
      { key: 'Kitchens', label: 'Kitchens', kind: 'number', placeholder: 'Count' },
    ],
  },
  {
    key: 'business',
    label: 'Business and Communication',
    fields: [
      { key: 'Broadband Internet Access', label: 'Broadband Internet Access', kind: 'check' },
      { key: 'Satellite or Cable TV Ready', label: 'Satellite or Cable TV Ready', kind: 'check' },
      { key: 'Intercom Facility', label: 'Intercom Facility', kind: 'check' },
      { key: 'Business Center', label: 'Business Center', kind: 'check' },
    ],
  },
  {
    key: 'community',
    label: 'Community Features',
    fields: [
      { key: 'Community Lawn or Garden', label: 'Community Lawn or Garden', kind: 'check' },
      { key: 'Community Swimming Pool', label: 'Community Swimming Pool', kind: 'check' },
      { key: 'Community Gym', label: 'Community Gym', kind: 'check' },
      { key: 'Kids Play Area', label: 'Kids Play Area', kind: 'check' },
    ],
  },
  {
    key: 'healthcare',
    label: 'Healthcare Recreational',
    fields: [
      { key: 'Lawn or Garden', label: 'Lawn or Garden', kind: 'check' },
      { key: 'Sauna / Steam Room', label: 'Sauna / Steam Room', kind: 'check' },
      { key: 'Jacuzzi', label: 'Jacuzzi', kind: 'check' },
    ],
  },
  {
    key: 'nearby',
    label: 'Nearby Locations',
    fields: [
      { key: 'Nearby Schools', label: 'Nearby Schools', kind: 'check' },
      { key: 'Nearby Hospitals', label: 'Nearby Hospitals', kind: 'check' },
      { key: 'Nearby Shopping Malls', label: 'Nearby Shopping Malls', kind: 'check' },
      { key: 'Nearby Public Transport', label: 'Nearby Public Transport', kind: 'check' },
    ],
  },
  {
    key: 'other',
    label: 'Other Facilities',
    fields: [
      { key: 'Maintenance Staff', label: 'Maintenance Staff', kind: 'check' },
      { key: 'Security Staff', label: 'Security Staff', kind: 'check' },
    ],
  },
];

/** Flat list of every checkbox label, used for the quality score and the saved chips. */
export const AMENITY_OPTIONS = AMENITY_TABS.flatMap((t) =>
  t.fields.filter((f) => f.kind === 'check').map((f) => f.key),
);

/** Target filled-field count for a full quality score. */
const TARGET_AMENITIES = 12;

const TITLE_CLS = 'text-sm font-bold text-slate-800';
const HINT_CLS = 'mt-0.5 text-xs text-slate-400';

const chipOff =
  'h-8 min-w-[32px] rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-200';
const chipOn =
  'h-8 min-w-[32px] rounded-full border border-brand-blue bg-blue-50 px-2.5 text-xs font-semibold text-brand-blue transition-all duration-150';

const CARD_CLS =
  'flex min-h-[72px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300';
const CONTROL_CLS =
  'w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 outline-none transition focus:border-emerald-500';

function Chip({ label, on, onSelect }: { label: string; on: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={on ? chipOn : chipOff}>
      {label}
    </button>
  );
}

/** Green rounded checkbox with a white tick, matching the reference design. */
function Tick({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
        on ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      {on && <HiOutlineCheck className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </button>
  );
}

/** 0-100 score, one twelfth per filled field up to the target. */
function scoreFor(count: number): { pct: number; tone: string; tip: string } {
  const pct = Math.min(100, count * (100 / TARGET_AMENITIES));
  if (pct === 0) {
    return { pct, tone: 'bg-red-100 text-red-500', tip: `Add at least ${TARGET_AMENITIES} features` };
  }
  if (pct < 100) {
    const left = TARGET_AMENITIES - count;
    return {
      pct,
      tone: 'bg-amber-100 text-amber-600',
      tip: `Great! Add ${left} more ${left === 1 ? 'feature' : 'features'} for max score`,
    };
  }
  return { pct, tone: 'bg-emerald-100 text-emerald-600', tip: 'Excellent! Maximum amenities score reached' };
}

interface Props {
  bedrooms: string;
  onBedrooms: (v: string) => void;
  bathrooms: string;
  onBathrooms: (v: string) => void;
  amenities: string[];
  onAmenities: (v: string[]) => void;
  /** Values for the non-checkbox fields, keyed by field label. */
  amenityDetails: Record<string, string>;
  onAmenityDetails: (v: Record<string, string>) => void;
}

/** "Feature and Amenities" — bed/bath chips plus a tabbed feature picker and a quality score. */
export default function PropertyAmenities({
  bedrooms,
  onBedrooms,
  bathrooms,
  onBathrooms,
  amenities,
  onAmenities,
  amenityDetails,
  onAmenityDetails,
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(AMENITY_TABS[0].key);

  const checkedCount = amenities.length;
  const detailCount = Object.values(amenityDetails).filter((v) => v.trim() !== '').length;
  const score = scoreFor(checkedCount + detailCount);

  const toggleAmenity = (name: string) =>
    onAmenities(
      amenities.includes(name) ? amenities.filter((a) => a !== name) : [...amenities, name],
    );

  const setDetail = (key: string, value: string) => {
    const next = { ...amenityDetails };
    if (value.trim() === '') delete next[key];
    else next[key] = value;
    onAmenityDetails(next);
  };

  const detailFor = (field: AmenityField): string => {
    if (field.key === 'Bedrooms') return bedrooms;
    if (field.key === 'Bathrooms') return bathrooms;
    return amenityDetails[field.key] ?? '';
  };

  const changeDetail = (field: AmenityField, value: string) => {
    if (field.key === 'Bedrooms') return onBedrooms(value);
    if (field.key === 'Bathrooms') return onBathrooms(value);
    setDetail(field.key, value);
  };

  return (
    <section className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-16">
      {/* Sidebar / section header */}
      <div className="flex shrink-0 flex-col items-start pt-1 md:w-48">
        <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <HiOutlineHome className="h-7 w-7 text-brand-blue" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-blue text-white">
            <HiOutlineInformationCircle className="h-3 w-3" />
          </span>
        </div>
        <h3 className="text-base font-bold leading-tight text-slate-900">
          Feature and
          <br className="hidden md:inline" /> Amenities
        </h3>
      </div>

      {/* Form steps */}
      <div className="max-w-2xl flex-1 space-y-7">
        {/* Bedrooms */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineRectangleStack className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-2.5 block text-sm font-bold text-slate-800">Bedrooms</label>
            <div className="flex flex-wrap items-center gap-2">
              {BEDROOM_CHIPS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  on={bedrooms === c}
                  onSelect={() => onBedrooms(bedrooms === c ? '' : c)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bathrooms */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineRectangleStack className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2.5 block text-sm font-bold text-slate-800">Bathrooms</label>
            <div className="flex flex-wrap items-center gap-2">
              {BATHROOM_CHIPS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  on={bathrooms === c}
                  onSelect={() => onBathrooms(bathrooms === c ? '' : c)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Amenities + quality tip */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineHome className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className={TITLE_CLS}>Feature and Amenities</h3>
                <p className={HINT_CLS}>
                  Add additional features e.g. parking spaces, waste disposal, internet etc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
              >
                <HiOutlinePlus className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>Add Amenities</span>
              </button>
            </div>

            {/* Selected chips */}
            {(amenities.length > 0 || detailCount > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(amenityDetails).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDetail(k, '')}
                    title="Remove"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    {v ? `${k}: ${v}` : k}
                    <HiOutlineXMark className="h-3 w-3" />
                  </button>
                ))}
                {amenities.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    title="Remove"
                    className="inline-flex items-center gap-1 rounded-full border border-brand-blue/20 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-brand-blue transition hover:bg-blue-100"
                  >
                    {a}
                    <HiOutlineXMark className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 sm:p-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand-blue">
                  <HiOutlineShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">Quality Tip</h4>
                  <p className="truncate text-[11px] text-slate-500">{score.tip}</p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded px-2.5 py-0.5 text-xs font-bold ${score.tone}`}
              >
                {Math.round(score.pct)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Amenities picker ---------- */}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px] evee-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-pop flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Feature and Amenities
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="relative border-b border-slate-200 bg-white px-6 pt-3">
              <div className="no-scrollbar flex items-center gap-6 overflow-x-auto pr-8">
                {AMENITY_TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-all ${
                        active
                          ? 'border-emerald-600 font-semibold text-emerald-600'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute right-4 top-3 bg-gradient-to-l from-white via-white to-transparent pl-4 pr-1 text-slate-500">
                <HiOutlineEllipsisHorizontal className="h-5 w-5" />
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {AMENITY_TABS.find((t) => t.key === tab)!.fields.map((field) => {
                  const value = detailFor(field);

                  if (field.kind === 'check') {
                    const on = amenities.includes(field.key);
                    return (
                      <div key={field.key} className={CARD_CLS}>
                        <span className="text-sm font-medium text-slate-800">{field.label}</span>
                        <Tick on={on} onToggle={() => toggleAmenity(field.key)} label={field.label} />
                      </div>
                    );
                  }

                  const numeric = field.kind === 'number';

                  return (
                    <div key={field.key} className={CARD_CLS}>
                      <span className="min-w-0 text-sm font-medium text-slate-800">
                        {field.label}
                      </span>
                      {field.kind === 'select' ? (
                        <div className="relative w-36 sm:w-44">
                          <select
                            value={value}
                            onChange={(e) => changeDetail(field, e.target.value)}
                            className={`${CONTROL_CLS} cursor-pointer`}
                          >
                            <option value="">Select</option>
                            {field.options!.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                            <HiOutlineChevronDown className="h-3 w-3" />
                          </span>
                        </div>
                      ) : (
                        <div className="w-36 sm:w-44">
                          <input
                            type={numeric ? 'number' : 'text'}
                            inputMode={numeric ? 'numeric' : undefined}
                            value={value}
                            onChange={(e) => changeDetail(field, e.target.value)}
                            placeholder={field.placeholder ?? ''}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder-slate-400 focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <span className="text-xs text-slate-500">
                Changes will be saved to your property listing
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Save Features
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}