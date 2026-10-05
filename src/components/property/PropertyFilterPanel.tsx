import { FaFilter, FaXmark } from 'react-icons/fa6';

export interface PropertyFilterValues {
  property_type: string;
  current_status: string;
  status: string;
  floor: string;
  block: string;
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_FILTERS: PropertyFilterValues = {
  property_type: '',
  current_status: '',
  status: '',
  floor: '',
  block: '',
  minPrice: '',
  maxPrice: '',
};

export function hasActiveFilters(f: PropertyFilterValues): boolean {
  return Object.values(f).some((v) => v !== '');
}

const selectCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/40';

interface Props {
  open: boolean;
  values: PropertyFilterValues;
  floors: string[];
  blocks: string[];
  /** Distinct values found in the dataset, so no status is hidden from the filter. */
  currentStatuses?: string[];
  onChange: (next: PropertyFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export default function PropertyFilterPanel({
  open,
  values,
  floors,
  blocks,
  currentStatuses = ['UnSold', 'Sold'],
  onChange,
  onApply,
  onClear,
  onClose,
}: Props) {
  if (!open) return null;

  const set = (k: keyof PropertyFilterValues, v: string) =>
    onChange({ ...values, [k]: v });

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-slate-900/20"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="animate-pop fixed right-0 top-0 z-[75] flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl"
        aria-label="Property filters"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-slate-900">
            <FaFilter className="h-4 w-4" />
            <h2 className="text-base font-bold">Filters</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Property Type
            </label>
            <select
              value={values.property_type}
              onChange={(e) => set('property_type', e.target.value)}
              className={selectCls}
            >
              <option value="">All types</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
              <option>Plot</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Current Status
            </label>
            <select
              value={values.current_status}
              onChange={(e) => set('current_status', e.target.value)}
              className={selectCls}
            >
              <option value="">All</option>
              {currentStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Status
            </label>
            <select
              value={values.status}
              onChange={(e) => set('status', e.target.value)}
              className={selectCls}
            >
              <option value="">All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Floor</label>
            <select
              value={values.floor}
              onChange={(e) => set('floor', e.target.value)}
              className={selectCls}
            >
              <option value="">All floors</option>
              {floors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Block</label>
            <select
              value={values.block}
              onChange={(e) => set('block', e.target.value)}
              className={selectCls}
            >
              <option value="">All blocks</option>
              {blocks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={values.minPrice}
                onChange={(e) => set('minPrice', e.target.value)}
                placeholder="Min"
                className={selectCls}
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                min={0}
                value={values.maxPrice}
                onChange={(e) => set('maxPrice', e.target.value)}
                placeholder="Max"
                className={selectCls}
              />
            </div>
          </div>
        </div>

        <footer className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClear}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>
          <button
            onClick={onApply}
            className="flex-1 rounded-lg bg-brand-blue px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Apply Filters
          </button>
        </footer>
      </aside>
    </>
  );
}