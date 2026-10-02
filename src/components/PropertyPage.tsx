import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaArrowDownAZ,
  FaArrowUpAZ,
  FaBuilding,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEllipsisVertical,
  FaMagnifyingGlass,
  FaPen,
  FaPlus,
  FaRegTrashCan,
  FaSliders,
  FaXmark,
} from 'react-icons/fa6';
import { api, type Property } from '../api';
import { navigate } from '../router';
import ConfirmDialog from './ConfirmDialog';
import PropertyFormModal from './property/PropertyFormModal';
import PropertyFilterPanel, {
  EMPTY_FILTERS,
  hasActiveFilters,
  type PropertyFilterValues,
} from './property/PropertyFilterPanel';
import {
  CurrentStatusBadge,
  PROP,
  PropertyAvatar,
  StatusBadge,
  TypeBadge,
} from './property/PropertyBadges';

interface PageProps {
  onNotify: (msg: string) => void;
}

type SortKey = 'name' | 'property_type' | 'sale_price' | 'status' | 'current_status';
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey | null; label: string; className?: string }[] = [
  { key: 'name', label: 'Property' },
  { key: 'property_type', label: 'Type' },
  { key: null, label: 'Registration #' },
  { key: 'current_status', label: 'Current Status' },
  { key: 'status', label: 'Status' },
  { key: 'sale_price', label: 'Sale Price' },
  { key: null, label: 'Actions', className: 'text-right' },
];

const PAGE_SIZES = [10, 25, 50, 100];

function fmtPrice(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return v.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "9th Floor" / "A Block" — the grey sub-line under a property name. */
function subLine(p: Property): string {
  return [p.floor, p.block].filter(Boolean).join(' • ') || '—';
}

export default function PropertyPage({ onNotify }: PageProps) {
  const [rows, setRows] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilterValues>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listProperties();
      setRows(res.data ?? []);
    } catch (err) {
      onNotify((err as Error).message || 'Could not load properties');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [moreOpen]);

  // Derived filter options come from the full dataset.
  const { floors, blocks } = useMemo(() => {
    const f = new Set<string>();
    const b = new Set<string>();
    rows.forEach((r) => {
      if (r.floor) f.add(r.floor);
      if (r.block) b.add(r.block);
    });
    return { floors: [...f].sort(), blocks: [...b].sort() };
  }, [rows]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const min = filters.minPrice ? Number(filters.minPrice) : null;
    const max = filters.maxPrice ? Number(filters.maxPrice) : null;

    const out = rows.filter((p) => {
      if (filters.property_type && p.property_type !== filters.property_type) return false;
      if (filters.current_status && p.current_status !== filters.current_status) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.floor && p.floor !== filters.floor) return false;
      if (filters.block && p.block !== filters.block) return false;
      if (min !== null && Number(p.sale_price) < min) return false;
      if (max !== null && Number(p.sale_price) > max) return false;

      if (term) {
        const hay = [p.name, p.code, p.registration_no, p.floor, p.block]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...out].sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      if (sortKey === 'sale_price') return (Number(a.sale_price) - Number(b.sale_price)) * dir;
      return av.localeCompare(bv) * dir;
    });
  }, [rows, search, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = visible.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await api.updateProperty(editing.id, payload as Partial<Property>);
        onNotify(`Property "${editing.name}" updated`);
      } else {
        await api.createProperty(payload as Partial<Property>);
        onNotify(`Property "${payload.name}" created`);
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      onNotify((err as Error).message || 'Could not save property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.deleteProperty(deleting.id);
      onNotify(`Property "${deleting.name}" deleted`);
      setDeleting(null);
      await load();
    } catch (err) {
      onNotify((err as Error).message || 'Could not delete property');
    }
  };

  const exportCsv = () => {
    const header = ['Property', 'Type', 'Registration #', 'Current Status', 'Status', 'Sale Price'];
    const body = visible.map((p) => [
      p.name, p.property_type, p.registration_no || '-', p.current_status, p.status, p.sale_price,
    ]);
    const csv = [header, ...body]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Properties exported to CSV');
  };

  const iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40';

  /** White bordered action button — matches the app's existing toolbar style. */
  const barIconBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-600 transition hover:bg-slate-50 hover:text-brand-blue';

  return (
    <div className="min-h-full w-full bg-slate-100">
      {/* ---------- Page header (matches the app TopBar) ---------- */}
      <div className="h-14 border-b border-slate-200 px-3 md:px-6 flex items-center justify-between bg-white flex-shrink-0 gap-2">
        <div className="flex items-center min-w-0">
          <span className="text-slate-800 border-b-2 border-blue-600 h-full flex items-center px-1 font-semibold select-none">
            All Properties
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className={barIconBtn}
            aria-label="Search properties"
            title="Search"
          >
            <FaMagnifyingGlass className="text-sm" />
          </button>

          <button
            onClick={() => navigate({ name: 'property-new' })}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-blue px-3.5 text-xs font-bold text-white shadow-sm shadow-brand-blue/40 transition hover:bg-brand-dark"
          >
            <FaPlus className="text-[10px]" />
            Add Property
          </button>

          <button
            onClick={() => setFilterOpen(true)}
            className={barIconBtn}
            aria-label="Filter properties"
            title="Filters"
          >
            <FaSliders className="text-sm" />
          </button>

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={barIconBtn}
              aria-label="More actions"
              title="More"
            >
              <FaEllipsisVertical className="text-sm" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                <button
                  onClick={() => { setMoreOpen(false); exportCsv(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <FaDownload className="h-3.5 w-3.5 text-slate-400" />
                  Export as CSV
                </button>
                <button
                  onClick={() => { setMoreOpen(false); setFilters(EMPTY_FILTERS); setSearch(''); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <FaXmark className="h-3.5 w-3.5 text-slate-400" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Search bar ---------- */}
      {searchOpen && (
        <div className="border-b border-slate-200 bg-white px-3 py-2.5 md:px-6">
          <div className="relative max-w-md">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, registration #, block or floor"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <FaXmark className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------- Filter chips ---------- */}
      {hasActiveFilters(filters) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5 md:px-6">
          {Object.entries(filters)
            .filter(([, v]) => v !== '')
            .map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: PROP.brandSoft, color: PROP.brand }}
              >
                {k.replace(/_/g, ' ')}: {v}
                <button
                  onClick={() => setFilters({ ...filters, [k]: '' })}
                  aria-label={`Remove ${k} filter`}
                  className="hover:opacity-70"
                >
                  <FaXmark className="h-3 w-3" />
                </button>
              </span>
            ))}
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-[11px] font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ---------- Table ---------- */}
      <div className="px-3 py-4 md:px-6">
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          {/* Card toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
            <span className="text-xs text-slate-500">
              {visible.length} propert{visible.length === 1 ? 'y' : 'ies'}
            </span>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[11px] font-bold text-slate-600 transition hover:border-brand-blue hover:text-brand-blue"
            >
              <FaMagnifyingGlass className="text-[10px]" />
              {searchOpen ? 'Hide search' : 'Search'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      scope="col"
                      className={`border-b border-slate-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${
                        col.className ?? ''
                      }`}
                    >
                      {col.key ? (
                        <button
                          onClick={() => toggleSort(col.key as SortKey)}
                          className="inline-flex items-center gap-1.5 transition hover:text-slate-800"
                        >
                          {col.label}
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
                              <FaArrowUpAZ className="h-3 w-3" style={{ color: PROP.brand }} />
                            ) : (
                              <FaArrowDownAZ className="h-3 w-3" style={{ color: PROP.brand }} />
                            )
                          ) : (
                            <FaArrowUpAZ className="h-3 w-3 text-slate-300" />
                          )}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-slate-500">
                      Loading properties…
                    </td>
                  </tr>
                )}

                {!loading && pageRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <FaBuilding className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No properties found</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try adjusting your search or filters.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  pageRows.map((p) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-brand-blue/5"
                      onClick={() => navigate({ name: 'property-detail', id: p.id })}
                    >
                      {/* Property */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <PropertyAvatar name={p.name} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-800">
                              {p.name}
                            </div>
                            <div className="truncate text-xs text-slate-500">{subLine(p)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <TypeBadge value={p.property_type} />
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {p.registration_no || '-'}
                      </td>

                      <td className="px-4 py-3">
                        <CurrentStatusBadge value={p.current_status} />
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge value={p.status} />
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold tabular-nums text-slate-800">
                        {fmtPrice(p.sale_price)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                            className={iconBtn}
                            aria-label={`Edit ${p.name}`}
                            title="Edit"
                          >
                            <FaPen className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleting(p); }}
                            className={`${iconBtn} hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                            aria-label={`Delete ${p.name}`}
                            title="Delete"
                          >
                            <FaRegTrashCan className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* ---------- Pagination ---------- */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Rows per page:</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Rows per page"
                  className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-blue"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <FaChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {visible.length === 0
                  ? '0 of 0'
                  : `${start + 1}–${Math.min(start + pageSize, visible.length)} of ${visible.length}`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={iconBtn}
                  aria-label="Previous page"
                >
                  <FaChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className={iconBtn}
                  aria-label="Next page"
                >
                  <FaChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Mobile cards ---------- */}
      <div className="space-y-3 px-3 pb-6 md:hidden">
        {pageRows.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            onClick={() => navigate({ name: 'property-detail', id: p.id })}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <PropertyAvatar name={p.name} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                  <div className="truncate text-xs text-slate-500">{subLine(p)}</div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => openEdit(p)} className={iconBtn} aria-label="Edit">
                  <FaPen className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(p)}
                  className={iconBtn}
                  aria-label="Delete"
                >
                  <FaRegTrashCan className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TypeBadge value={p.property_type} />
              <CurrentStatusBadge value={p.current_status} />
              <StatusBadge value={p.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">Reg: {p.registration_no || '-'}</span>
              <span className="font-semibold tabular-nums text-slate-800">
                {fmtPrice(p.sale_price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Dialogs ---------- */}
      <PropertyFormModal
        open={formOpen}
        property={editing}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <PropertyFilterPanel
        open={filterOpen}
        values={filters}
        floors={floors}
        blocks={blocks}
        onChange={setFilters}
        onApply={() => setFilterOpen(false)}
        onClear={() => setFilters(EMPTY_FILTERS)}
        onClose={() => setFilterOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Property?"
        message={`Are you sure you want to delete "${deleting?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete Property"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}