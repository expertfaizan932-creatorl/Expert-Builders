import { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { api, type Property } from '../api';
import { navigate } from '../router';
import PropertyLocationPurpose, {
  PURPOSE_CATEGORIES,
  firstSubtype,
  type PurposeCategory,
} from './property/PropertyLocationPurpose';
import PropertyPriceArea from './property/PropertyPriceArea';
import PropertyAmenities from './property/PropertyAmenities';
import PropertyAdInfo from './property/PropertyAdInfo';
import PropertyImagesVideos, { type PendingImage } from './property/PropertyImagesVideos';
import PropertyContactInfo from './property/PropertyContactInfo';

interface PageProps {
  onNotify: (msg: string) => void;
}

interface FormState {
  purpose: 'Sell' | 'Rent';
  property_type: 'Residential' | 'Commercial' | 'Industrial' | 'Plot';
  subtype: string;
  city: string;
  address: string;
  area: string;
  size: string;
  unit: string;
  price: string;
  currency: string;
  installment: boolean;
  advanceAmount: string;
  installmentCount: string;
  monthlyInstallment: string;
  balloonPayment: boolean;
  ballotingFee: boolean;
  ballotingAmount: string;
  possessionFee: boolean;
  possessionAmount: string;
  developmentFee: boolean;
  developmentAmount: string;
  possession: boolean;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  title: string;
  description: string;
  images: PendingImage[];
  videoUrl: string;
  email: string;
  mobiles: string[];
  landline: string;
  coords: { lat: number; lng: number; label: string } | null;
}

const EMPTY: FormState = {
  purpose: 'Sell',
  property_type: 'Residential',
  subtype: firstSubtype('home'),
  city: '',
  address: '',
  area: '',
  size: '',
  unit: 'Sq. Ft.',
  price: '',
  currency: 'PKR',
installment: false,
advanceAmount: '',
installmentCount: '',
monthlyInstallment: '',
balloonPayment: false,
ballotingFee: false,
ballotingAmount: '',
possessionFee: false,
possessionAmount: '',
developmentFee: false,
developmentAmount: '',
possession: false,
  bedrooms: '',
  bathrooms: '',
  amenities: [],
  title: '',
  description: '',
  images: [],
  videoUrl: '',
  email: '',
  mobiles: ['+92 '],
  landline: '+92 ',
  coords: null,
};

/** Title doubles as the property name the backend requires. */

export default function PropertyCreatePage({ onNotify }: PageProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [category, setCategory] = useState<PurposeCategory>('home');
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [emailError, setEmailError] = useState('');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === 'title') setTitleError('');
    if (k === 'email') setEmailError('');
  };

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

  const handleSave = async () => {
    const title = form.title.trim();
    if (!title) {
      setTitleError('Title is required.');
      return;
    }
    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.createProperty({
        name: title,
        purpose: form.purpose,
        property_type: form.property_type,
        subtype: form.subtype,
        city: form.city.trim(),
        address: form.address.trim(),
        area: form.area.trim(),
        size: form.size.trim(),
        unit: form.unit,
        latitude: form.coords?.lat ?? null,
        longitude: form.coords?.lng ?? null,
        sale_price: Number(form.price.replace(/,/g, '')) || 0,
        currency: form.currency,
        installment_available: form.installment ? 1 : 0,
        advance_amount: Number(form.advanceAmount.replace(/,/g, '')) || 0,
        installment_count: Number(form.installmentCount) || 0,
        monthly_installment: Number(form.monthlyInstallment.replace(/,/g, '')) || 0,
        balloon_payment_available: form.balloonPayment ? 1 : 0,
        balloting_fee_available: form.ballotingFee ? 1 : 0,
        balloting_fee: Number(form.ballotingAmount.replace(/,/g, '')) || 0,
        possession_fee_available: form.possessionFee ? 1 : 0,
        possession_fee: Number(form.possessionAmount.replace(/,/g, '')) || 0,
        development_fee_available: form.developmentFee ? 1 : 0,
        development_fee: Number(form.developmentAmount.replace(/,/g, '')) || 0,
        ready_for_possession: form.possession ? 1 : 0,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        amenities: form.amenities.join(', '),
        description: form.description.trim(),
        video_url: form.videoUrl,
        contact_email: email,
        contact_mobile: form.mobiles
          .map((m) => m.trim())
          .filter(Boolean)
          .join(', '),
        contact_landline: form.landline.trim(),
      } as Partial<Property>);

      // Images need the new property id, so they go up right after creation.
      const propertyId = res.data?.id;
      if (propertyId) {
        for (const image of form.images) {
          try {
            await api.createPropertyImage(propertyId, { data: image.data, name: image.name });
          } catch {
            /* keep going so one bad image cannot fail the whole save */
          }
        }
      }

      onNotify(`Property "${res.data?.name ?? title}" created`);
      navigate({ name: 'property' });
    } catch (err) {
      onNotify((err as Error).message || 'Could not save property');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-slate-100">
      {/* ---------- Header ---------- */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate({ name: 'property' })}
            aria-label="Back to properties"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <span className="flex h-full select-none items-center border-b-2 border-blue-600 px-1 font-semibold text-slate-800">
            Add Property
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => navigate({ name: 'property' })}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-blue px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-blue/40 transition hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Property'}
          </button>
        </div>
      </div>

      {/* ---------- Form ---------- */}
      <div className="p-4 md:p-8">
        <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
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
            coords={form.coords}
            onCoords={(v) => set('coords', v)}
          />

          <div className="my-8 h-px bg-slate-200" />

          <PropertyPriceArea
            size={form.size}
            onSize={(v) => set('size', v)}
            unit={form.unit}
            onUnit={(v) => set('unit', v)}
            price={form.price}
            onPrice={(v) => set('price', v)}
            currency={form.currency}
            onCurrency={(v) => set('currency', v)}
            installment={form.installment}
            onInstallment={(v) => set('installment', v)}
            advanceAmount={form.advanceAmount}
            onAdvanceAmount={(v) => set('advanceAmount', v)}
            installmentCount={form.installmentCount}
            onInstallmentCount={(v) => set('installmentCount', v)}
            monthlyInstallment={form.monthlyInstallment}
            onMonthlyInstallment={(v) => set('monthlyInstallment', v)}
            balloonPayment={form.balloonPayment}
            onBalloonPayment={(v) => set('balloonPayment', v)}
            ballotingFee={form.ballotingFee}
            onBallotingFee={(v) => set('ballotingFee', v)}
            ballotingAmount={form.ballotingAmount}
            onBallotingAmount={(v) => set('ballotingAmount', v)}
            possessionFee={form.possessionFee}
            onPossessionFee={(v) => set('possessionFee', v)}
            possessionAmount={form.possessionAmount}
            onPossessionAmount={(v) => set('possessionAmount', v)}
            developmentFee={form.developmentFee}
            onDevelopmentFee={(v) => set('developmentFee', v)}
            developmentAmount={form.developmentAmount}
            onDevelopmentAmount={(v) => set('developmentAmount', v)}
            possession={form.possession}
            onPossession={(v) => set('possession', v)}
          />

          <div className="my-8 h-px bg-slate-200" />

          <PropertyAmenities
            bedrooms={form.bedrooms}
            onBedrooms={(v) => set('bedrooms', v)}
            bathrooms={form.bathrooms}
            onBathrooms={(v) => set('bathrooms', v)}
            amenities={form.amenities}
            onAmenities={(v) => set('amenities', v)}
          />

          <div className="my-8 h-px bg-slate-200" />

          <PropertyAdInfo
            title={form.title}
            onTitle={(v) => set('title', v)}
            titleError={titleError}
            description={form.description}
            onDescription={(v) => set('description', v)}
          />

          <div className="my-8 h-px bg-slate-200" />

          <PropertyImagesVideos
            images={form.images}
            onImages={(v) => set('images', v)}
            videoUrl={form.videoUrl}
            onVideoUrl={(v) => set('videoUrl', v)}
          />

          <div className="my-8 h-px bg-slate-200" />

          <PropertyContactInfo
            email={form.email}
            onEmail={(v) => set('email', v)}
            emailError={emailError}
            mobiles={form.mobiles}
            onMobiles={(v) => set('mobiles', v)}
            landline={form.landline}
            onLandline={(v) => set('landline', v)}
          />
        </div>
      </div>
    </div>
  );
}