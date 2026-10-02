import { useCallback, useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaFileLines,
  FaPen,
  FaRegTrashCan,
} from 'react-icons/fa6';
import { api, type Property } from '../api';
import { navigate } from '../router';
import ConfirmDialog from './ConfirmDialog';
import PropertyFormModal from './property/PropertyFormModal';
import {
  CurrentStatusBadge,
  PROP,
  PropertyAvatar,
  StatusBadge,
  TypeBadge,
} from './property/PropertyBadges';

interface PageProps {
  id: number;
  onNotify: (msg: string) => void;
}

const TABS = [
  'Overview',
  'Property Information',
  'Pricing',
  'Sales',
  'Transfers',
  'Buy-back',
  'Receipts',
  'Documents',
  'Activity',
] as const;

type Tab = (typeof TABS)[number];

const RECEIPT_COLS = [
  'Receipt #', 'Date', 'Customer', 'Amount', 'Payment Method', 'Status', 'Actions',
];

function fmtPrice(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(v: string | null | undefined): string {
  if (!v) return '-';
  const d = new Date(v.includes('T') ? v : v.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString();
}

/** Small labelled value used throughout the detail panels. */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-800">
        {value || '-'}
      </dd>
    </div>
  );
}

function Panel({
  title,
  children,
  cols = 3,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const grid = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[cols];
  return (
    <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <h3
        className="border-b border-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider"
        style={{ color: PROP.brand }}
      >
        {title}
      </h3>
      <dl className={`grid grid-cols-1 gap-4 px-5 py-4 ${grid}`}>{children}</dl>
    </section>
  );
}

export default function PropertyDetailsPage({ id, onNotify }: PageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProperty(id);
      setProperty(res.data ?? null);
    } catch (err) {
      onNotify((err as Error).message || 'Could not load property');
    } finally {
      setLoading(false);
    }
  }, [id, onNotify]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await api.updateProperty(id, payload as Partial<Property>);
      setProperty(res.data ?? null);
      setEditOpen(false);
      onNotify('Property updated');
    } catch (err) {
      onNotify((err as Error).message || 'Could not save property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteProperty(id);
      onNotify('Property deleted');
      navigate({ name: 'property' });
    } catch (err) {
      onNotify((err as Error).message || 'Could not delete property');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading property…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100">
        <FaBuilding className="h-9 w-9 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">Property not found</p>
        <button
          onClick={() => navigate({ name: 'property' })}
          className="rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  const p = property;
  const finalPrice = Number(p.sale_price) - Number(p.discount);

  return (
    <div className="min-h-full w-full bg-slate-100">
      {/* ---------- Header ---------- */}
      <div className="h-14 border-b border-slate-200 px-3 md:px-6 flex items-center justify-between bg-white flex-shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate({ name: 'property' })}
            aria-label="Back to properties"
            className="w-8 h-8 shrink-0 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <span className="text-slate-800 border-b-2 border-blue-600 h-full flex items-center px-1 font-semibold select-none truncate">
            {p.name}
          </span>
          <StatusBadge value={p.status} />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete property"
            title="Delete"
          >
            <FaRegTrashCan className="text-sm" />
          </button>
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-blue px-3.5 text-xs font-bold text-white shadow-sm shadow-brand-blue/40 transition hover:bg-brand-dark"
          >
            <FaPen className="text-[10px]" />
            Edit Property
          </button>
        </div>
      </div>

      {/* ---------- Summary card ---------- */}
      <div className="px-3 pt-4 md:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row">
            {/* Gallery */}
            <div
              className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg md:h-44 md:w-56"
              style={{ background: PROP.brandSoft }}
            >
              <FaBuilding className="h-12 w-12 text-blue-500/40" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <PropertyAvatar name={p.name} size="lg" />
                <div className="min-w-0">
                  <div className="truncate text-lg font-bold text-slate-900">{p.name}</div>
                  <div className="truncate text-xs text-slate-500">
                    {[p.floor, p.block].filter(Boolean).join(' • ') || '—'}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Code
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-800">{p.code || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Registration #
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-800">
                    {p.registration_no || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Sale Price
                  </div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                    {fmtPrice(p.sale_price)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Current Status
                  </div>
                  <div className="mt-1">
                    <CurrentStatusBadge value={p.current_status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TypeBadge value={p.property_type} />
                <StatusBadge value={p.status} />
                {p.city && (
                  <span className="text-xs text-slate-500">
                    {p.address ? `${p.address}, ` : ''}{p.city}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="mt-4 border-b border-slate-200 bg-white px-3 md:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${
                tab === t
                  ? 'border-current'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              style={tab === t ? { color: '#2563EB' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Tab panels ---------- */}
      <div className="space-y-4 px-3 py-4 md:px-6">
        {tab === 'Overview' && (
          <>
            <Panel title="Property Information">
              <Field label="Property Name" value={p.name} />
              <Field label="Property Code" value={p.code} />
              <Field label="Type" value={<TypeBadge value={p.property_type} />} />
              <Field label="Registration Number" value={p.registration_no} />
              <Field label="Floor" value={p.floor} />
              <Field label="Block" value={p.block} />
              <Field label="Size" value={p.size} />
              <Field label="Unit" value={p.unit} />
              <Field label="Address" value={p.address} />
              <Field label="City" value={p.city} />
              <Field label="Area" value={p.area} />
              <Field label="Description" value={p.description} />
            </Panel>

            <Panel title="Pricing">
              <Field label="Sale Price" value={fmtPrice(p.sale_price)} />
              <Field label="Original Price" value={fmtPrice(p.original_price)} />
              <Field label="Discount" value={fmtPrice(p.discount)} />
              <Field label="Final Price" value={fmtPrice(finalPrice)} />
              <Field label="Payment Plan" value={p.payment_plan} />
            </Panel>

            <Panel title="Sales Information">
              <Field label="Sale Status" value={<CurrentStatusBadge value={p.current_status} />} />
              <Field label="Customer" value={p.customer} />
              <Field label="Agent" value={p.agent} />
              <Field label="Sale Date" value={fmtDate(p.sale_date)} />
              <Field label="Booking Date" value={fmtDate(p.booking_date)} />
            </Panel>

            <Panel title="Transfer Information">
              <Field label="Transfer Status" value={p.transfer_status} />
              <Field label="Transfer Date" value={fmtDate(p.transfer_date)} />
              <Field label="Transfer From" value={p.transfer_from} />
              <Field label="Transfer To" value={p.transfer_to} />
            </Panel>
          </>
        )}

        {tab === 'Property Information' && (
          <Panel title="Property Information" cols={4}>
            <Field label="Property Name" value={p.name} />
            <Field label="Property Code" value={p.code} />
            <Field label="Purpose" value={p.purpose} />
            <Field label="Type" value={<TypeBadge value={p.property_type} />} />
            <Field label="Sub Type" value={p.subtype} />
            <Field label="Registration Number" value={p.registration_no} />
            <Field label="Floor" value={p.floor} />
            <Field label="Block" value={p.block} />
            <Field label="Size" value={p.size} />
            <Field label="Unit" value={p.unit} />
            <Field label="Address" value={p.address} />
            <Field label="City" value={p.city} />
            <Field label="Area" value={p.area} />
            <Field label="Status" value={<StatusBadge value={p.status} />} />
          </Panel>
        )}

        {tab === 'Pricing' && (
          <Panel title="Pricing" cols={2}>
            <Field label="Sale Price" value={fmtPrice(p.sale_price)} />
            <Field label="Original Price" value={fmtPrice(p.original_price)} />
            <Field label="Discount" value={fmtPrice(p.discount)} />
            <Field label="Final Price" value={fmtPrice(finalPrice)} />
            <Field label="Payment Plan" value={p.payment_plan} />
          </Panel>
        )}

        {tab === 'Sales' && (
          <Panel title="Sales Information">
            <Field label="Sale Status" value={<CurrentStatusBadge value={p.current_status} />} />
            <Field label="Customer" value={p.customer} />
            <Field label="Agent" value={p.agent} />
            <Field label="Sale Date" value={fmtDate(p.sale_date)} />
            <Field label="Booking Date" value={fmtDate(p.booking_date)} />
          </Panel>
        )}

        {tab === 'Transfers' && (
          <Panel title="Transfer Information">
            <Field label="Transfer Status" value={p.transfer_status} />
            <Field label="Transfer Date" value={fmtDate(p.transfer_date)} />
            <Field label="Transfer From" value={p.transfer_from} />
            <Field label="Transfer To" value={p.transfer_to} />
          </Panel>
        )}

        {tab === 'Buy-back' && (
          <Panel title="Buy-back Information">
            <Field label="Buy-back Status" value="Not Eligible" />
            <Field label="Buy-back Price" value="-" />
            <Field label="Requested On" value="-" />
            <Field label="Approved On" value="-" />
          </Panel>
        )}

        {tab === 'Receipts' && (
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="bg-slate-50">
                    {RECEIPT_COLS.map((c, i) => (
                      <th
                        key={c}
                        scope="col"
                        className={`border-b border-slate-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${
                          i === RECEIPT_COLS.length - 1 ? 'text-right' : ''
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <FaFileLines className="mx-auto mb-3 h-7 w-7 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No receipts yet</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Receipts linked to this property will appear here.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Documents' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3
              className="mb-3 text-xs font-bold uppercase tracking-wider"
              style={{ color: PROP.brand }}
            >
              Documents
            </h3>
            <label
              htmlFor="pd-files"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-brand-blue hover:bg-brand-blue/5"
            >
              <span className="text-sm font-semibold text-slate-700">
                Click to upload property documents
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Ownership papers, floor plans, agreements
              </span>
              <input id="pd-files" type="file" multiple className="hidden" />
            </label>
          </div>
        )}

        {tab === 'Activity' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3
              className="mb-4 text-xs font-bold uppercase tracking-wider"
              style={{ color: PROP.brand }}
            >
              Activity
            </h3>
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: PROP.success }}
              >
                <FaCheck className="h-3 w-3" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Property record created</p>
                <p className="text-xs text-slate-500">{fmtDate(p.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <PropertyFormModal
        open={editOpen}
        property={p}
        saving={saving}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Property?"
        message={`Are you sure you want to delete "${p.name}"? This action cannot be undone.`}
        confirmLabel="Delete Property"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}