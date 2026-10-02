import { useEffect, useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import type {
  Property,
  PropertyPurpose,
  PropertySaleStatus,
  PropertyStatus,
  PropertyType,
} from '../../api';
import PropertyLocationPurpose, {
  PURPOSE_CATEGORIES,
  categoryForType,
  firstSubtype,
  type PurposeCategory,
} from './PropertyLocationPurpose';

interface FormState {
  name: string;
  code: string;
  property_type: PropertyType;
  subtype: string;
  purpose: PropertyPurpose;
  floor: string;
  block: string;
  registration_no: string;
  sale_price: string;
  original_price: string;
  discount: string;
  payment_plan: string;
  current_status: PropertySaleStatus;
  status: PropertyStatus;
  description: string;
  address: string;
  city: string;
  area: string;
  size: string;
  unit: string;
}

const EMPTY: FormState = {
  name: '', code: '', property_type: 'Residential', subtype: 'House', purpose: 'Sell',
  floor: '', block: '',
  registration_no: '', sale_price: '', original_price: '', discount: '',
  payment_plan: '', current_status: 'UnSold', status: 'Active',
  description: '', address: '', city: '', area: '', size: '', unit: '',
};

function toForm(p: Property): FormState {
  return {
    name: p.name ?? '',
    code: p.code ?? '',
    property_type: p.property_type ?? 'Residential',
    subtype: p.subtype ?? firstSubtype(categoryForType(p.property_type)),
    purpose: p.purpose ?? 'Sell',
    floor: p.floor ?? '',
    block: p.block ?? '',
    registration_no: p.registration_no ?? '',
    sale_price: p.sale_price != null ? String(p.sale_price) : '',
    original_price: p.original_price != null ? String(p.original_price) : '',
    discount: p.discount != null ? String(p.discount) : '',
    payment_plan: p.payment_plan ?? '',
    current_status: p.current_status ?? 'UnSold',
    status: p.status ?? 'Active',
    description: p.description ?? '',
    address: p.address ?? '',
    city: p.city ?? '',
    area: p.area ?? '',
    size: p.size ?? '',
    unit: p.unit ?? '',
  };
}

interface Props {
  open: boolean;
  /** When set the form edits this property; otherwise it creates a new one. */
  property?: Property | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
}

export default function PropertyFormModal({ open, property, saving, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [category, setCategory] = useState<PurposeCategory>('home');
  const isEdit = Boolean(property?.id);

  useEffect(() => {
    if (!open) return;
    const next = property?.id ? toForm(property) : EMPTY;
    setForm(next);
    setCategory(categoryForType(next.property_type));
  }, [open, property]);

  if (!open) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  /** Switching tab retargets property_type and resets the subtype to its first pill. */
  const changeCategory = (key: PurposeCategory) => {
    const def = PURPOSE_CATEGORIES.find((c) => c.key === key);
    if (!def) return;
    setCategory(key);
    setForm((f) => ({
      ...f,
      property_type: def.propertyType,
      subtype: def.subtypes[0].name,
    }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();

    onSave({
      ...form,
      name: form.name.trim(),
      city: form.city || '',
      area: form.area.trim(),
      sale_price: Number(form.sale_price.replace(/,/g, '')) || 0,
      original_price: Number(form.original_price.replace(/,/g, '')) || 0,
      discount: Number(form.discount.replace(/,/g, '')) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-6 evee-fade-in">
      <form
        onSubmit={handleSubmit}
        className="animate-pop my-4 w-full max-w-4xl rounded-2xl border border-slate-100 bg-white shadow-xl"
        noValidate
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? 'Edit Property' : 'Add Property'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isEdit ? `Updating ${property?.name}` : 'Create a new property record'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
          <PropertyLocationPurpose
            purpose={form.purpose}
            onPurpose={(v) => set('purpose', v)}
            category={category}
            onCategory={changeCategory}
            subtype={form.subtype}
            onSubtype={(v) => set('subtype', v)}
            city={form.city}
            onCity={(v) => set('city', v)}
            address={form.address}
            onAddress={(v) => set('address', v)}
            location={form.area}
            onLocation={(v) => set('area', v)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-blue px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-blue/40 transition hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
}