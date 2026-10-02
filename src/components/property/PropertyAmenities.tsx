import { useState } from 'react';
import {
  HiOutlineCheck,
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

export const AMENITY_OPTIONS = [
  'Parking Spaces',
  'Broadband Internet',
  'Waste Disposal',
  'Central Air Conditioning',
  'Lawn or Garden',
  'Elevator / Lift',
  'Security Staff',
  'Electricity Backup',
];

/** Target amenity count for a full quality score. */
const TARGET_AMENITIES = 5;

const TITLE_CLS = 'text-sm font-bold text-slate-800';
const HINT_CLS = 'mt-0.5 text-xs text-slate-400';

const chipOff =
  'h-8 min-w-[32px] rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-200';
const chipOn =
  'h-8 min-w-[32px] rounded-full border border-brand-blue bg-blue-50 px-2.5 text-xs font-semibold text-brand-blue transition-all duration-150';

function Chip({ label, on, onSelect }: { label: string; on: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={on ? chipOn : chipOff}>
      {label}
    </button>
  );
}

/** 0-100 score, one fifth per amenity up to the target of five. */
function scoreFor(count: number): { pct: number; tone: string; tip: string } {
  const pct = Math.min(100, count * (100 / TARGET_AMENITIES));
  if (pct === 0) {
    return { pct, tone: 'bg-red-100 text-red-500', tip: `Add at least ${TARGET_AMENITIES} amenities` };
  }
  if (pct < 100) {
    const left = TARGET_AMENITIES - count;
    return {
      pct,
      tone: 'bg-amber-100 text-amber-600',
      tip: `Great! Add ${left} more ${left === 1 ? 'amenity' : 'amenities'} for max score`,
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
}

/** "Feature and Amenities" — bed/bath chips, an amenities picker and a quality score. */
export default function PropertyAmenities({
  bedrooms,
  onBedrooms,
  bathrooms,
  onBathrooms,
  amenities,
  onAmenities,
}: Props) {
  const [open, setOpen] = useState(false);

  const score = scoreFor(amenities.length);

  const toggleAmenity = (name: string) =>
    onAmenities(
      amenities.includes(name) ? amenities.filter((a) => a !== name) : [...amenities, name],
    );

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
                <Chip key={c} label={c} on={bedrooms === c} onSelect={() => onBedrooms(c)} />
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
                <Chip key={c} label={c} on={bathrooms === c} onSelect={() => onBathrooms(c)} />
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
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
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
            className="animate-pop w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                  <HiOutlineCheck className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Select Features &amp; Amenities</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
              <p className="text-xs text-slate-500">
                Select options to boost your listing quality tip score:
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {AMENITY_OPTIONS.map((a) => {
                  const on = amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        on
                          ? 'border-brand-blue bg-blue-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          on ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300'
                        }`}
                      >
                        {on && <HiOutlineCheck className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{a}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                <strong className="text-brand-blue">{amenities.length}</strong> amenities selected
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-brand-blue px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-dark"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}