import type { Property, PropertyImage, PropertyFilters } from '../api';

/**
 * Offline fallback store for the property module.
 *
 * When the configured API has no `properties` resource (e.g. local dev proxied
 * to a host where api/index.php predates this module), every request 404s and
 * the module appears completely broken. This store keeps the module usable in
 * the browser so a saved property shows up on the All Properties page.
 *
 * The real API always wins: these helpers only run after a network call fails.
 */

const PROPS_KEY = 'eb.properties.local.v2';
const IMAGES_KEY = 'eb.property_images.local.v1';

type Row = Record<string, unknown>;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded … drop every stored image and retry once, images are the
    // only part that can realistically blow the ~5 MB localStorage budget.
    if (key === IMAGES_KEY) {
      try {
        localStorage.setItem(key, '{}');
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}


function blank(id: number): Property {
  return {
    id,
    name: '',
    code: '',
    property_type: 'Residential',
    subtype: '',
    purpose: 'Sell',
    floor: '',
    block: '',
    registration_no: '',
    current_status: 'UnSold',
    status: 'Active',
    sale_price: 0,
    currency: 'PKR',
    installment_available: 0,
    advance_amount: 0,
    installment_count: 0,
    monthly_installment: 0,
    balloon_payment_available: 0,
    balloting_fee_available: 0,
    balloting_fee: 0,
    possession_fee_available: 0,
    possession_fee: 0,
    development_fee_available: 0,
    development_fee: 0,
    ready_for_possession: 0,
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    video_url: '',
    contact_email: '',
    contact_mobile: '',
    contact_landline: '',
    original_price: 0,
    discount: 0,
    payment_plan: '',
    customer: '',
    agent: '',
    sale_date: null,
    booking_date: null,
    transfer_status: 'Not Initiated',
    transfer_date: null,
    transfer_from: '',
    transfer_to: '',
    address: '',
    city: '',
    area: '',
    size: '',
    unit: '',
    latitude: null,
    longitude: null,
    description: null,
    created_at: new Date().toISOString(),
  };
}


function load(): Property[] {
  return read<Property[]>(PROPS_KEY, []);
}

function save(rows: Property[]): void {
  write(PROPS_KEY, rows);
}

function matches(p: Property, f: PropertyFilters): boolean {
  if (f.property_type && p.property_type !== f.property_type) return false;
  if (f.current_status && p.current_status !== f.current_status) return false;
  if (f.status && p.status !== f.status) return false;
  if (f.floor && p.floor !== f.floor) return false;
  if (f.block && p.block !== f.block) return false;
  if (f.search) {
    const term = f.search.toLowerCase();
    const hay = [p.name, p.code, p.registration_no, p.floor, p.block, p.city, p.area]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!hay.includes(term)) return false;
  }
  return true;
}

export function localListProperties(filters: PropertyFilters = {}) {
  const data = load().filter((p) => matches(p, filters));
  return Promise.resolve({ data, count: data.length });
}

export function localGetProperty(id: number) {
  const row = load().find((p) => p.id === id);
  if (!row) return Promise.reject(new Error('Property not found'));
  return Promise.resolve({ data: row });
}

export function localCreateProperty(input: Row) {
  const rows = load();
  const id = rows.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const row: Property = { ...blank(id), ...(input as Partial<Property>), id };
  rows.push(row);
  save(rows);
  return Promise.resolve({ data: row, message: 'Property created' });
}

export function localUpdateProperty(id: number, input: Row) {
  const rows = load();
  const index = rows.findIndex((p) => p.id === id);
  if (index === -1) return Promise.reject(new Error('Property not found'));
  const row: Property = { ...rows[index], ...(input as Partial<Property>), id };
  rows[index] = row;
  save(rows);
  return Promise.resolve({ data: row, message: 'Property updated' });
}

export function localDeleteProperty(id: number) {
  const rows = load().filter((p) => p.id !== id);
  save(rows);
  return Promise.resolve({ message: 'Property deleted' });
}

/** ---------- images ---------- */

type ImageBucket = Record<string, { id: number; name: string; mime: string; data: string }[]>;

function loadImages(): ImageBucket {
  return read<ImageBucket>(IMAGES_KEY, {});
}

/** Shrink to ≤1280px JPEG so several images fit inside the localStorage quota. */
function shrink(data: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      } catch {
        resolve(data);
      }
    };
    img.onerror = () => resolve(data);
    img.src = data;
  });
}

export async function localCreatePropertyImage(propertyId: number, input: { data: string; name: string }) {
  const buckets = loadImages();
  const list = buckets[String(propertyId)] ?? [];
  const data = await shrink(input.data);
  const image = {
    id: Date.now() + list.length,
    name: input.name,
    mime: /^data:image\/([a-z+]+)/i.exec(data)?.[1] ?? 'jpeg',
    data,
  };
  buckets[String(propertyId)] = [...list, image];
  const stored = write(IMAGES_KEY, buckets);
  return {
    data: { id: image.id },
    message: stored ? 'Image uploaded' : 'Image uploaded (preview only, storage full)',
  };
}

export function localListPropertyImages(propertyId: number) {
  const list = loadImages()[String(propertyId)] ?? [];
  const data: PropertyImage[] = list.map((img) => ({
    id: img.id,
    property_id: propertyId,
    name: img.name,
    size: Math.round((img.data.length * 3) / 4),
    mime: img.mime,
    created_at: null,
  }));
  return Promise.resolve({ data, count: data.length });
}

export function localGetPropertyImage(propertyId: number, imageId: number) {
  const img = (loadImages()[String(propertyId)] ?? []).find((i) => i.id === imageId);
  if (!img) return Promise.reject(new Error('Image not found'));
  return Promise.resolve({ data: img.data, mime: img.mime, name: img.name });
}

export function localDeletePropertyImage(propertyId: number, imageId: number) {
  const buckets = loadImages();
  const key = String(propertyId);
  buckets[key] = (buckets[key] ?? []).filter((i) => i.id !== imageId);
  write(IMAGES_KEY, buckets);
  return Promise.resolve({ message: 'Image deleted' });
}
