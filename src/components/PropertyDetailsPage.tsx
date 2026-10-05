import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaFileLines,
  FaPen,
  FaRegTrashCan,
  FaXmark,
} from 'react-icons/fa6';
import { api, type Property } from '../api';
import {
  DEFAULT_CURRENT_STATUSES,
  DEFAULT_STATUSES,
  fetchCurrentStatusOptions,
  mergeOptions,
} from '../data/propertyOptions';
import {
  forgetPropertyImages,
  isRemoteImage,
  toDataUri,
  usePropertyImages,
  type LoadedImage,
} from '../data/propertyImages';
import { navigate } from '../router';
import { HiOutlinePlus } from 'react-icons/hi2';
import ConfirmDialog from './ConfirmDialog';
import AddImageModal from './property/AddImageModal';
import CurrentStatusSelect from './property/CurrentStatusSelect';
import ListingStatusSelect from './property/ListingStatusSelect';
import PropertyFormModal from './property/PropertyFormModal';
import {
  PROP,
  PropertyAvatar,
  StatusBadge,
  TypeBadge,
} from './property/PropertyBadges';

interface PageProps {
  id: number;
  onNotify: (msg: string) => void;
}

/** Cover image, thumbnail strip, add-picture and delete controls. */
function Gallery({
  propertyId,
  onNotify,
}: {
  propertyId: number;
  onNotify: (msg: string) => void;
}) {
  const { images, loading, reload } = usePropertyImages(propertyId);
  const [active, setActive] = useState(0);
  const [deleting, setDeleting] = useState<LoadedImage | null>(null);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setActive(0);
  }, [images.length]);

  /** Appends new photos; Image Bank URLs are converted because the API stores data URIs. */
  const upload = async (items: { data: string; name: string }[]) => {
    setUploading(true);
    let saved = 0;
    for (const item of items) {
      try {
        const data = isRemoteImage(item.data) ? await toDataUri(item.data) : item.data;
        await api.createPropertyImage(propertyId, { data, name: item.name });
        saved += 1;
      } catch {
        /* keep going so one bad image cannot fail the rest */
      }
    }
    forgetPropertyImages(propertyId);
    reload();
    setUploading(false);
    onNotify(saved ? `${saved} picture${saved > 1 ? 's' : ''} added` : 'Could not add pictures');
  };

  const addBtn = (
    <button
      type="button"
      aria-label="Add pictures"
      title="Add pictures"
      disabled={uploading}
      onClick={() => setAdding(true)}
      className="absolute bottom-2 right-11 cursor-pointer rounded-lg bg-brand-blue/90 p-1.5 text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {uploading ? (
        <span className="block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <HiOutlinePlus className="h-3 w-3" strokeWidth={3} />
      )}
    </button>
  );

  const modals = (
    <>
      <AddImageModal open={adding} onClose={() => setAdding(false)} onAdd={upload} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete Image?"
        message={`Remove "${deleting?.name ?? ''}" from this property?`}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          const target = deleting;
          setDeleting(null);
          if (!target) return;
          try {
            await api.deletePropertyImage(propertyId, target.id);
            reload();
            setActive(0);
            onNotify('Image deleted');
          } catch (err) {
            onNotify((err as Error).message || 'Could not delete image');
          }
        }}
      />
    </>
  );

  if (loading && images.length === 0) {
    return (
      <div
        className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg md:h-44 md:w-56"
        style={{ background: PROP.brandSoft }}
      >
        <span className="text-xs font-medium text-blue-500/60">Loading images…</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full shrink-0 space-y-2 md:w-56">
        {modals}
        <div
          className="flex h-40 w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg md:h-44"
          style={{ background: PROP.brandSoft }}
        >
          <FaBuilding className="h-10 w-10 text-blue-500/40" />
          <span className="text-[11px] font-medium text-blue-500/60">No images uploaded</span>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-dark"
          >
            <HiOutlinePlus className="h-3 w-3" strokeWidth={3} />
            Add Pictures
          </button>
        </div>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="w-full shrink-0 space-y-2 md:w-56">
      {modals}
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-100 md:h-44">
        <img
          src={current.src}
          alt={current.name}
          onClick={() => window.open(current.src, '_blank', 'noreferrer')}
          className="h-full w-full cursor-zoom-in object-cover"
        />
        {addBtn}
        <button
          type="button"
          aria-label="Delete image"
          onClick={() => setDeleting(current)}
          className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-red-500/90 p-1.5 text-white transition hover:bg-red-600"
        >
          <FaRegTrashCan className="text-xs" />
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-11 w-14 shrink-0 overflow-hidden rounded border-2 transition ${
                i === active
                  ? 'border-brand-blue'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.src} alt={img.name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

const BUYBACK_STATUSES = [
  'Not Eligible',
  'Eligible',
  'Requested',
  'Approved',
  'Rejected',
] as const;

/** Text value with a pencil that turns it into an input, saved on Enter or the tick. */
function InlineEdit({
  value,
  label,
  placeholder = '',
  className = '',
  inputClassName = '',
  onSave,
}: {
  value: string;
  label: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSave: (next: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    input.current?.select();
  }, [open]);

  const commit = () => {
    setOpen(false);
    if (draft.trim() !== (value ?? '')) void onSave(draft);
  };

  if (!open) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className="truncate">{value || placeholder || '—'}</span>
        <button
          type="button"
          onClick={() => {
            setDraft(value ?? '');
            setOpen(true);
          }}
          aria-label={`Edit ${label}`}
          title={`Edit ${label}`}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 opacity-60 transition hover:bg-blue-50 hover:text-brand-blue hover:opacity-100"
        >
          <FaPen className="text-[9px]" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={input}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setOpen(false);
        }}
        aria-label={label}
        placeholder={placeholder}
        className={`w-full min-w-0 rounded-lg border border-brand-blue px-2.5 py-1 text-sm font-semibold text-slate-900 outline-none ${inputClassName}`}
      />
      <button
        type="button"
        onClick={commit}
        aria-label={`Save ${label}`}
        title="Save"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-blue text-white transition hover:bg-brand-dark"
      >
        <FaCheck className="text-[9px]" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={`Cancel ${label}`}
        title="Cancel"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-50"
      >
        <FaXmark className="text-[9px]" />
      </button>
    </div>
  );
}

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

/** Inline-editable pricing field: click the value to replace it with an input. */
function EditField({
  label,
  value,
  type = 'text',
  onSave,
}: {
  label: string;
  value: number | string;
  type?: 'text' | 'number';
  onSave: (next: string) => void;
}) {
  const display = type === 'number' ? fmtPrice(Number(value) || 0) : String(value ?? '');
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5">
        <InlineEdit
          value={display}
          label={label}
          placeholder="Empty"
          inputClassName="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-blue"
          onSave={(next) => onSave(type === 'number' ? String(Number(next) || 0) : next)}
        />
      </dd>
    </div>
  );
}

/** Date editor using a native picker so the value always matches the DATE column. */
function EditDateField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string | null | undefined;
  onSave: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const iso = (value ?? '').slice(0, 10);

  if (!open) {
    return (
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-slate-800">{fmtDate(value)}</span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Edit ${label}`}
              title={`Edit ${label}`}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 opacity-60 transition hover:bg-blue-50 hover:text-brand-blue hover:opacity-100"
            >
              <FaPen className="text-[9px]" />
            </button>
          </div>
        </dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5">
        <input
          type="date"
          value={iso}
          onChange={(e) => {
            onSave(e.target.value);
            setOpen(false);
          }}
          aria-label={label}
          className="rounded-lg border border-brand-blue bg-white px-2.5 py-1 text-sm font-medium text-slate-800 outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={`Cancel ${label}`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-50"
        >
          <FaXmark className="text-[9px]" />
        </button>
      </dd>
    </div>
  );
}

/** Toggle rendered as a switch; only mounted while the panel is in edit mode. */
function EditToggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onToggle(!checked)}
          className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            checked ? 'bg-brand-blue' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </dd>
    </div>
  );
}

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
  action,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  /** Rendered on the right of the panel header, e.g. an edit button. */
  action?: React.ReactNode;
}) {
  const grid = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[cols];
  return (
    <section className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: PROP.brand }}
        >
          {title}
        </h3>
        {action}
      </div>
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
  const [pricingEditing, setPricingEditing] = useState(false);
  const [salesEditing, setSalesEditing] = useState(false);
  const [transfersEditing, setTransfersEditing] = useState(false);
  const [buybackEditing, setBuybackEditing] = useState(false);
  /* Known values first, then anything else the dataset contains. */
  const [statusValues, setStatusValues] = useState<string[]>(DEFAULT_CURRENT_STATUSES);

  useEffect(() => {
    void fetchCurrentStatusOptions().then((found) =>
      setStatusValues(mergeOptions(DEFAULT_CURRENT_STATUSES, found)),
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProperty(id);
      let row = res.data ?? null;
      /* Listing saved before property codes existed — hand it the next number. */
      if (row && !row.code) {
        try {
          const list = await api.listProperties();
          const [filled] = await api.fillPropertyCodes(
            (list.data ?? []).map((p) => (p.id === id ? row as Property : p)),
          );
          if (filled) row = filled;
        } catch {
          /* keep whatever we have */
        }
      }
      setProperty(row);
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

  /** Saves one pricing field in place; toggles also clear their dependent amounts. */
  const patchPricing = async (field: string, value: string | number) => {
    if (!property) return;
    const payload: Record<string, unknown> = { [field]: value };
    if (field === 'installment_available' && Number(value) === 0) {
      payload.advance_amount = 0;
      payload.installment_count = 0;
      payload.monthly_installment = 0;
    }
    if (field === 'balloon_payment_available' && Number(value) === 0) {
      payload.balloon_amount = 0;
      payload.balloon_payment_count = 0;
    }
    if (field === 'balloting_fee_available' && Number(value) === 0) payload.balloting_fee = 0;
    if (field === 'possession_fee_available' && Number(value) === 0) payload.possession_fee = 0;
    if (field === 'development_fee_available' && Number(value) === 0) payload.development_fee = 0;
    try {
      const res = await api.updateProperty(id, payload as Partial<Property>);
      setProperty(res.data ?? null);
      onNotify('Pricing updated');
    } catch (err) {
      onNotify((err as Error).message || 'Could not update pricing');
    }
  };

  /** Saves one sales field in place. */
  const patchSales = async (field: string, value: string) => {
    if (!property) return;
    try {
      const res = await api.updateProperty(id, { [field]: value } as Partial<Property>);
      setProperty(res.data ?? null);
      onNotify('Sales information updated');
    } catch (err) {
      onNotify((err as Error).message || 'Could not update sales information');
    }
  };

  /** Saves one buy-back field in place. */
  const patchBuyback = async (field: string, value: string) => {
    if (!property) return;
    try {
      const res = await api.updateProperty(id, { [field]: value } as Partial<Property>);
      setProperty(res.data ?? null);
      onNotify('Buy-back information updated');
    } catch (err) {
      onNotify((err as Error).message || 'Could not update buy-back information');
    }
  };

  /** Saves one transfer field in place. */
  const patchTransfers = async (field: string, value: string) => {
    if (!property) return;
    try {
      const res = await api.updateProperty(id, { [field]: value } as Partial<Property>);
      setProperty(res.data ?? null);
      onNotify('Transfer information updated');
    } catch (err) {
      onNotify((err as Error).message || 'Could not update transfer information');
    }
  };

  const patchField = async (
    field: 'name' | 'registration_no' | 'current_status' | 'status' | 'floor' | 'block' | 'address',
    next: string,
  ) => {
    const value = next.trim();
    if (!property || !value || value === (property[field] ?? '')) return;
    try {
      const res = await api.updateProperty(id, { [field]: value } as Partial<Property>);
      setProperty(res.data ?? null);
      onNotify(
        field === 'name'
          ? 'Property name updated'
          : field === 'registration_no'
            ? 'Registration number updated'
            : `Property marked as ${value}`,
      );
    } catch (err) {
      onNotify((err as Error).message || 'Could not update property');
    }
  };

  /** Renders a read-only field normally, and an inline editor while Pricing is in edit mode. */
  const priceField = (
    label: string,
    field: string,
    value: number | string,
    type: 'text' | 'number' = 'number',
  ) =>
    pricingEditing ? (
      <EditField
        key={label}
        label={label}
        value={value}
        type={type}
        onSave={(v) => patchPricing(field, v)}
      />
    ) : (
      <Field
        key={label}
        label={label}
        value={type === 'number' ? fmtPrice(Number(value) || 0) : value || '-'}
      />
    );

  /** Same idea for the Yes/No toggles. */
  const priceToggle = (label: string, field: string, current: number) =>
    pricingEditing ? (
      <EditToggle
        key={label}
        label={label}
        checked={Number(current) === 1}
        onToggle={(v) => patchPricing(field, v ? 1 : 0)}
      />
    ) : (
      <Field key={label} label={label} value={Number(current) === 1 ? 'Yes' : 'No'} />
    );

  /** Read-only field, inline text editor, or native date picker depending on edit mode. */
  const textField = (
    label: string,
    field: string,
    value: string | number | null | undefined,
    editing: boolean,
    onSave: (field: string, next: string) => void,
  ) => {
    const isDate = field.endsWith('_date');
    if (!editing) {
      return (
        <Field
          key={label}
          label={label}
          value={isDate ? fmtDate(value as string | null) : value || '-'}
        />
      );
    }
    return isDate ? (
      <EditDateField
        key={label}
        label={label}
        value={value as string | null}
        onSave={(next) => onSave(field, next)}
      />
    ) : (
      <EditField
        key={label}
        label={label}
        value={value ?? ''}
        type="text"
        onSave={(next) => onSave(field, next)}
      />
    );
  };

  /** Shared Edit / Done header button for a details panel. */
  const editButton = (editing: boolean, label: string, setEditing: (v: boolean) => void) =>
    editing ? (
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
      >
        <FaCheck className="h-3 w-3 text-emerald-600" />
        Done
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-brand-blue"
      >
        <FaPen className="h-3 w-3" />
        {label}
      </button>
    );

  const salesEditButton = editButton(salesEditing, 'Edit Sales', setSalesEditing);
  const transferEditButton = editButton(transfersEditing, 'Edit Transfers', setTransfersEditing);
  const buybackEditButton = editButton(buybackEditing, 'Edit Buy-back', setBuybackEditing);

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
          <div className="h-full min-w-0 truncate border-b-2 border-blue-600 px-1 font-semibold text-slate-800">
            {p.name}
          </div>
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
            <Gallery propertyId={p.id} onNotify={onNotify} />

            <div className="min-w-0 flex-1">
<div className="flex items-center gap-3">
                  <PropertyAvatar name={p.name} size="lg" />
                <div className="min-w-0">
                  <InlineEdit
                    value={p.name}
                    label="property name"
                    className="text-lg font-bold text-slate-900"
                    onSave={(v) => patchField('name', v)}
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <InlineEdit
                      value={p.floor ?? ''}
                      label="floor"
                      placeholder="No floor"
                      onSave={(v) => patchField('floor', v)}
                    />
                    <span className="text-slate-300">•</span>
                    <InlineEdit
                      value={p.block ?? ''}
                      label="block"
                      placeholder="No block"
                      onSave={(v) => patchField('block', v)}
                    />
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
                  <InlineEdit
                    value={p.registration_no ?? ''}
                    label="registration number"
                    placeholder="Not added yet"
                    className="mt-0.5 text-sm font-medium text-slate-800"
                    onSave={(v) => patchField('registration_no', v)}
                  />
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
                  <CurrentStatusSelect
                    value={p.current_status || 'UnSold'}
                    options={statusValues}
                    onChange={(next) => patchField('current_status', next)}
                    className="mt-1 w-full"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TypeBadge value={p.property_type} />
                <ListingStatusSelect
                  value={p.status || 'Active'}
                  options={DEFAULT_STATUSES}
                  onChange={(next) => patchField('status', next)}
                />
                <InlineEdit
                  value={p.address ?? ''}
                  label="address"
                  placeholder="No address"
                  className="min-w-0 max-w-full text-xs text-slate-500"
                  onSave={(v) => patchField('address', v)}
                />
                {p.city && <span className="shrink-0 text-xs text-slate-500">• {p.city}</span>}
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
              <Field label="Installment Available" value={Number(p.installment_available) === 1 ? 'Yes' : 'No'} />
              {Number(p.installment_available) === 1 && (
                <>
                  <Field label="Advance Amount" value={`${fmtPrice(p.advance_amount)} ${p.currency}`} />
                  <Field label="No of Installments" value={p.installment_count || '-'} />
<Field label="Monthly Installments" value={`${fmtPrice(p.monthly_installment)} ${p.currency}`} />
                  <Field label="Balloon Payment Available" value={Number(p.balloon_payment_available) === 1 ? 'Yes' : 'No'} />
                  {Number(p.balloon_payment_available) === 1 && (
                    <>
                      <Field label="Balloon Amount" value={`${fmtPrice(p.balloon_amount)} ${p.currency}`} />
                      <Field label="No. of Balloon Payments" value={p.balloon_payment_count || '-'} />
                    </>
                  )}
                  <Field label="Balloting Fee" value={Number(p.balloting_fee_available) === 1 ? `${fmtPrice(p.balloting_fee)} ${p.currency}` : 'No'} />
                  <Field label="Possession Fee" value={Number(p.possession_fee_available) === 1 ? `${fmtPrice(p.possession_fee)} ${p.currency}` : 'No'} />
                  <Field label="Development Fee" value={Number(p.development_fee_available) === 1 ? `${fmtPrice(p.development_fee)} ${p.currency}` : 'No'} />
                </>
              )}
              <Field label="Ready for Possession" value={Number(p.ready_for_possession) === 1 ? 'Yes' : 'No'} />
            </Panel>

            <Panel title="Sales Information" action={salesEditButton}>
              <Field
                label="Sale Status"
                value={
                  <CurrentStatusSelect
                    value={p.current_status || 'UnSold'}
                    options={statusValues}
                    onChange={(next) => patchField('current_status', next)}
                    className="w-32"
                  />
                }
              />
              {textField('Customer', 'customer', p.customer, salesEditing, patchSales)}
              {textField('Agent', 'agent', p.agent, salesEditing, patchSales)}
              {textField('Sale Date', 'sale_date', p.sale_date, salesEditing, patchSales)}
              {textField('Booking Date', 'booking_date', p.booking_date, salesEditing, patchSales)}
            </Panel>

            <Panel title="Transfer Information" action={transferEditButton}>
              {textField('Transfer Status', 'transfer_status', p.transfer_status, transfersEditing, patchTransfers)}
              {textField('Transfer Date', 'transfer_date', p.transfer_date, transfersEditing, patchTransfers)}
              {textField('Transfer From', 'transfer_from', p.transfer_from, transfersEditing, patchTransfers)}
              {textField('Transfer To', 'transfer_to', p.transfer_to, transfersEditing, patchTransfers)}
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
          <Panel
            title="Pricing"
            cols={2}
            action={
              pricingEditing ? (
                <button
                  type="button"
                  onClick={() => setPricingEditing(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  <FaCheck className="h-3 w-3 text-emerald-600" />
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPricingEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-brand-blue"
                >
                  <FaPen className="h-3 w-3" />
                  Edit Pricing
                </button>
              )
            }
          >
            {priceField('Sale Price', 'sale_price', p.sale_price)}
            {priceField('Original Price', 'original_price', p.original_price)}
            {priceField('Discount', 'discount', p.discount)}
            <Field label="Final Price" value={fmtPrice(finalPrice)} />
            <div className="sm:col-span-2">
              {priceField('Payment Plan', 'payment_plan', p.payment_plan ?? '', 'text')}
            </div>
            {priceToggle('Installment Available', 'installment_available', p.installment_available)}
            {Number(p.installment_available) === 1 && (
              <>
                {priceField('Advance Amount', 'advance_amount', p.advance_amount)}
                {priceField('No of Installments', 'installment_count', p.installment_count)}
                {priceField('Monthly Installments', 'monthly_installment', p.monthly_installment)}
                {priceToggle('Balloon Payment Available', 'balloon_payment_available', p.balloon_payment_available)}
                {Number(p.balloon_payment_available) === 1 && (
                  <>
                    {priceField('Balloon Amount', 'balloon_amount', p.balloon_amount)}
                    {priceField('No. of Balloon Payments', 'balloon_payment_count', p.balloon_payment_count)}
                  </>
                )}
                {priceToggle('Balloting Fee', 'balloting_fee_available', p.balloting_fee_available)}
                {Number(p.balloting_fee_available) === 1 &&
                  priceField('Balloting Fee Amount', 'balloting_fee', p.balloting_fee)}
                {priceToggle('Possession Fee', 'possession_fee_available', p.possession_fee_available)}
                {Number(p.possession_fee_available) === 1 &&
                  priceField('Possession Fee Amount', 'possession_fee', p.possession_fee)}
                {priceToggle('Development Fee', 'development_fee_available', p.development_fee_available)}
                {Number(p.development_fee_available) === 1 &&
                  priceField('Development Fee Amount', 'development_fee', p.development_fee)}
              </>
            )}
            {priceToggle('Ready for Possession', 'ready_for_possession', p.ready_for_possession)}
          </Panel>
        )}

        {tab === 'Sales' && (
          <Panel
            title="Sales Information"
            action={salesEditButton}
          >
            <Field
              label="Sale Status"
              value={
                <CurrentStatusSelect
                  value={p.current_status || 'UnSold'}
                  options={statusValues}
                  onChange={(next) => patchField('current_status', next)}
                  className="w-32"
                />
              }
            />
            {textField('Customer', 'customer', p.customer, salesEditing, patchSales)}
            {textField('Agent', 'agent', p.agent, salesEditing, patchSales)}
            {textField('Sale Date', 'sale_date', p.sale_date, salesEditing, patchSales)}
            {textField('Booking Date', 'booking_date', p.booking_date, salesEditing, patchSales)}
          </Panel>
        )}

        {tab === 'Transfers' && (
          <Panel title="Transfer Information" action={transferEditButton}>
            {textField('Transfer Status', 'transfer_status', p.transfer_status, transfersEditing, patchTransfers)}
            {textField('Transfer Date', 'transfer_date', p.transfer_date, transfersEditing, patchTransfers)}
            {textField('Transfer From', 'transfer_from', p.transfer_from, transfersEditing, patchTransfers)}
            {textField('Transfer To', 'transfer_to', p.transfer_to, transfersEditing, patchTransfers)}
          </Panel>
        )}

        {tab === 'Buy-back' && (
          <Panel title="Buy-back Information" action={buybackEditButton}>
            <Field
              label="Buy-back Status"
              value={
                buybackEditing ? (
                  <select
                    value={p.buyback_status || 'Not Eligible'}
                    onChange={(e) => patchBuyback('buyback_status', e.target.value)}
                    aria-label="Buy-back status"
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/40"
                  >
                    {BUYBACK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-medium text-slate-800">
                    {p.buyback_status || 'Not Eligible'}
                  </span>
                )
              }
            />
            {buybackEditing ? (
              <EditField
                label="Buy-back Price"
                value={p.buyback_price}
                type="number"
                onSave={(v) => patchBuyback('buyback_price', v)}
              />
            ) : (
              <Field
                label="Buy-back Price"
                value={Number(p.buyback_price) ? fmtPrice(p.buyback_price) : '-'}
              />
            )}
            {textField('Requested On', 'buyback_requested_on', p.buyback_requested_on, buybackEditing, patchBuyback)}
            {textField('Approved On', 'buyback_approved_on', p.buyback_approved_on, buybackEditing, patchBuyback)}
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
