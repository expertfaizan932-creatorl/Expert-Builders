import { useState, type MouseEvent } from 'react';
import type { IconType } from 'react-icons';
import {
  HiOutlineBeaker,
  HiOutlineBuildingLibrary,
  HiOutlineBuildingOffice,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineMap,
  HiOutlineMapPin,
  HiOutlineRectangleStack,
  HiOutlineShoppingBag,
  HiOutlineSquare3Stack3D,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import type { PropertyPurpose, PropertyType } from '../../api';
import { CARET_CLS, FIELD_CLS, STEP_ICON_CLS, STEP_LABEL_CLS } from './PropertyBadges';

/** Which purpose the listing is for — Sell / Rent. */
export const PURPOSES: { value: PropertyPurpose; icon: IconType }[] = [
  { value: 'Sell', icon: HiOutlineHome },
  { value: 'Rent', icon: HiOutlineBuildingOffice2 },
];

/** The categories backing the "Select Property Type" tab strip. */
export type PurposeCategory = 'home' | 'plots' | 'commercial' | 'industrial';

interface Subtype {
  name: string;
  icon: IconType;
}

interface CategoryDef {
  key: PurposeCategory;
  label: string;
  propertyType: PropertyType;
  subtypes: Subtype[];
}

export const PURPOSE_CATEGORIES: CategoryDef[] = [
  {
    key: 'home',
    label: 'Home',
    propertyType: 'Residential',
    subtypes: [
      { name: 'House', icon: HiOutlineHome },
      { name: 'Flat', icon: HiOutlineBuildingOffice2 },
      { name: 'Upper Portion', icon: HiOutlineHomeModern },
      { name: 'Lower Portion', icon: HiOutlineHomeModern },
      { name: 'Farm House', icon: HiOutlineBeaker },
      { name: 'Room', icon: HiOutlineSquare3Stack3D },
      { name: 'Penthouse', icon: HiOutlineBuildingOffice },
    ],
  },
  {
    key: 'plots',
    label: 'Plots',
    propertyType: 'Plot',
    subtypes: [
      { name: 'Residential Plot', icon: HiOutlineMap },
      { name: 'Commercial Plot', icon: HiOutlineBuildingOffice2 },
      { name: 'Agricultural Land', icon: HiOutlineBeaker },
      { name: 'Plot File', icon: HiOutlineDocumentText },
    ],
  },
  {
    key: 'commercial',
    label: 'Commercial',
    propertyType: 'Commercial',
    subtypes: [
      { name: 'Office', icon: HiOutlineBuildingOffice },
      { name: 'Shop', icon: HiOutlineShoppingBag },
      { name: 'Warehouse', icon: HiOutlineRectangleStack },
      { name: 'Building', icon: HiOutlineBuildingOffice2 },
    ],
  },
  {
    key: 'industrial',
    label: 'Industrial',
    propertyType: 'Industrial',
    subtypes: [
      { name: 'Factory', icon: HiOutlineWrenchScrewdriver },
      { name: 'Godown', icon: HiOutlineRectangleStack },
      { name: 'Industrial Plot', icon: HiOutlineMap },
      { name: 'Store', icon: HiOutlineBuildingLibrary },
    ],
  },
];

export const CITIES = [
  'Islamabad',
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Peshawar',
  'Faisalabad',
];

/** Tab that owns a given property_type, so editing never loses the value. */
export function categoryForType(type?: string): PurposeCategory {
  return PURPOSE_CATEGORIES.find((c) => c.propertyType === type)?.key ?? 'home';
}

export function firstSubtype(key: PurposeCategory): string {
  return PURPOSE_CATEGORIES.find((c) => c.key === key)?.subtypes[0].name ?? '';
}

const pillBase =
  'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm transition-all duration-150';
const pillOn = `${pillBase} border-2 border-brand-blue bg-white text-brand-blue font-semibold shadow-sm`;
const pillOff = `${pillBase} border border-transparent bg-slate-100 text-slate-700 font-medium hover:bg-slate-200`;

/** Dotted "map" canvas used as the location preview. */
const mapGridStyle = {
  backgroundColor: '#f3f4f6',
  backgroundImage:
    'radial-gradient(#e5e7eb 1.5px, transparent 1.5px), radial-gradient(#e5e7eb 1.5px, #f3f4f6 1.5px)',
  backgroundSize: '30px 30px',
  backgroundPosition: '0 0, 15px 15px',
} as const;

interface Props {
  purpose: PropertyPurpose;
  onPurpose: (v: PropertyPurpose) => void;
  category: PurposeCategory;
  onCategory: (key: PurposeCategory) => void;
  subtype: string;
  onSubtype: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  location: string;
  onLocation: (v: string) => void;
}

/** "Location and Purpose" — purpose pills, property-type tabs, city and location. */
export default function PropertyLocationPurpose({
  purpose,
  onPurpose,
  category,
  onCategory,
  subtype,
  onSubtype,
  city,
  onCity,
  location,
  onLocation,
}: Props) {
  const [picking, setPicking] = useState(false);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);

  const active = PURPOSE_CATEGORIES.find((c) => c.key === category) ?? PURPOSE_CATEGORIES[0];

  // Older records can carry a city that isn't in the list — keep it selectable.
  const cityOptions = city && !CITIES.includes(city) ? [city, ...CITIES] : CITIES;

  const dropPin = (e: MouseEvent<HTMLDivElement>) => {
    if (!picking) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setPin({
      x: Math.min(94, Math.max(6, x)),
      y: Math.min(88, Math.max(12, y)),
    });
  };

  return (
    <section className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-16">
      {/* Sidebar / section header */}
      <div className="flex shrink-0 flex-col items-start pt-2 md:w-48">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
          <HiOutlineMapPin className="h-7 w-7 text-brand-blue" />
        </div>
        <h3 className="text-base font-bold leading-snug text-slate-900">
          Location and
          <br />
          Purpose
        </h3>
      </div>

      {/* Form steps */}
      <div className="max-w-2xl flex-1 space-y-8">
        {/* 1 — Purpose */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineCheckCircle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className={STEP_LABEL_CLS}>Select Purpose</label>
            <div className="flex flex-wrap gap-3">
              {PURPOSES.map((p) => {
                const Icon = p.icon;
                const on = purpose === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => onPurpose(p.value)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-150 ${
                      on
                        ? 'border-2 border-brand-blue bg-white text-brand-blue font-semibold shadow-sm'
                        : 'border border-transparent bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${on ? 'text-brand-blue' : 'text-slate-500'}`} />
                    <span>{p.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2 — Property type + subtype */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineBuildingOffice2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className={STEP_LABEL_CLS}>Select Property Type</label>

            <div className="mb-4 flex gap-6 border-b border-slate-200 text-sm">
              {PURPOSE_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onCategory(c.key)}
                  className={`pb-2 transition-colors ${
                    c.key === category
                      ? 'border-b-2 border-brand-blue font-semibold text-brand-blue'
                      : 'font-medium text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {active.subtypes.map((s) => {
                const Icon = s.icon;
                const on = subtype === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => onSubtype(s.name)}
                    className={on ? pillOn : pillOff}
                  >
                    <Icon className={`h-4 w-4 ${on ? 'text-brand-blue' : 'text-slate-500'}`} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3 — City */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineMapPin className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pp-city">
              City
            </label>
            <div className="relative">
              <select
                id="pp-city"
                value={city}
                onChange={(e) => onCity(e.target.value)}
                className={`${FIELD_CLS} cursor-pointer ${city ? 'text-slate-800' : 'text-slate-400'}`}
              >
                <option value="">Select City</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className={CARET_CLS}>
                <HiOutlineChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 4 — Location + map preview */}
        <div className="flex items-start gap-4">
          <div className={STEP_ICON_CLS}>
            <HiOutlineMap className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="pp-location">
              Location
            </label>
            <div className="relative mb-4">
              <input
                id="pp-location"
                value={location}
                onChange={(e) => onLocation(e.target.value)}
                placeholder="Search Location"
                className="w-full rounded-lg border border-transparent bg-slate-100 px-4 py-3 pr-11 text-sm text-slate-700 shadow-sm transition-all placeholder-slate-400 outline-none focus:border-brand-blue focus:bg-white focus:text-slate-800"
              />
              <div className={CARET_CLS}>
                <HiOutlineChevronDown className="h-4 w-4" />
              </div>
            </div>

            <div
              onClick={dropPin}
              className={`relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 shadow-inner ${picking ? 'cursor-crosshair ring-2 ring-brand-blue/40' : ''}`}
              style={mapGridStyle}
            >
              {/* Road network hint */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M -50,50 Q 150,120 400,20" stroke="#d1d5db" strokeWidth="12" fill="none" />
                <path d="M 200,-20 Q 220,100 250,220" stroke="#d1d5db" strokeWidth="8" fill="none" />
                <path d="M 50,180 Q 250,130 500,160" stroke="#ffffff" strokeWidth="6" fill="none" />
              </svg>

              {picking ? (
                <span className="relative z-10 rounded-full bg-slate-900/85 px-3 py-1.5 text-[11px] font-semibold text-white">
                  Click the map to drop the pin
                </span>
              ) : pin ? (
                <span
                  className="absolute z-10 -translate-x-1/2 -translate-y-full text-brand-blue drop-shadow-md"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  <HiOutlineMapPin className="h-9 w-9" />
                </span>
              ) : (
                <HiOutlineMapPin className="relative z-10 h-9 w-9 text-brand-blue drop-shadow-md" />
              )}

              <div className="absolute bottom-3 left-3 z-10">
                <button
                  type="button"
                  onClick={() => setPicking((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition-colors ${
                    picking
                      ? 'border-brand-blue bg-brand-blue text-white'
                      : 'border-brand-blue/30 text-brand-blue hover:bg-blue-50'
                  }`}
                >
                  <HiOutlineMapPin
                    className={`h-3.5 w-3.5 ${picking ? 'text-white' : 'text-brand-blue'}`}
                  />
                  <span>{picking ? 'Cancel' : 'Set Location on Map'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}