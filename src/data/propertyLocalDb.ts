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

const PROPS_KEY = 'eb.properties.local.v1';
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
    // Quota exceeded — drop every stored image and retry once, images are the
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

/** Mirrors the 24 starter rows the PHP backend seeds on first run. */
const SEED: [string, string, string, string, string, string, string][] = [
  ['islamabad', 'PROP-001', 'Commercial', '9th Floor', '', '79098989898', 'UnSold'],
  ['SS-001', 'PROP-002', 'Commercial', '', 'SBS TOWER', '88776655', 'UnSold'],
  ['BB-001', 'PROP-003', 'Commercial', '', 'SBS TOWER', '99880022778', 'UnSold'],
  ['ALmugni10', 'PROP-004', 'Commercial', '1st Floor', '', '', 'UnSold'],
  ['MM-01', 'PROP-005', 'Commercial', '1st Floor', '', '6655333', 'UnSold'],
  ['LGC 123', 'PROP-006', 'Residential', '', 'A Block', '', 'Sold'],
  ['12334', 'PROP-007', 'Residential', 'Ground Floor', '', '12334', 'UnSold'],
  ['DHA-201', 'PROP-008', 'Residential', '2nd Floor', 'B Block', 'DHA-20144', 'UnSold'],
  ['CMA-118', 'PROP-009', 'Commercial', '3rd Floor', 'CMA Tower', 'CMA11899', 'Sold'],
  ['FFC-042', 'PROP-010', 'Plot', '', 'Sector C', 'FFC042771', 'UnSold'],
  ['BNB-777', 'PROP-011', 'Residential', '5th Floor', 'B Block', 'BNB77712', 'Inactive'],
  ['RCH-310', 'PROP-012', 'Commercial', 'Ground Floor', 'Rachna Plaza', 'RCH31099', 'Sold'],
  ['IDP-055', 'PROP-013', 'Industrial', 'Ground Floor', 'IDP Warehouse', 'IDP05512', 'UnSold'],
  ['MIR-902', 'PROP-014', 'Residential', '7th Floor', 'Mir Heights', '', 'UnSold'],
  ['ZAM-141', 'PROP-015', 'Residential', '4th Floor', 'Zamzama Flats', 'ZAM14166', 'Sold'],
  ['NTH-620', 'PROP-016', 'Commercial', '8th Floor', 'North Tower', 'NTH62008', 'UnSold'],
  ['GRN-033', 'PROP-017', 'Residential', '1st Floor', 'Garden Block', 'GRN03345', 'UnSold'],
  ['PKW-288', 'PROP-018', 'Plot', '', 'Block D', 'PKW28891', 'Inactive'],
  ['SKY-450', 'PROP-019', 'Residential', '10th Floor', 'Skyline', 'SKY45000', 'Sold'],
  ['HRB-111', 'PROP-020', 'Industrial', '2nd Floor', 'Harbour Complex', 'HRB11122', 'UnSold'],
  ['LNE-007', 'PROP-021', 'Commercial', '6th Floor', 'Lane Complex', 'LNE00733', 'UnSold'],
  ['ORB-360', 'PROP-022', 'Residential', '3rd Floor', 'Orbit Homes', 'ORB36077', 'Sold'],
  ['VLT-029', 'PROP-023', 'Commercial', 'Basement', 'Vault Tower', 'VLT02918', 'UnSold'],
  ['EMR-815', 'PROP-024', 'Residential', '11th Floor', 'Emerald Court', 'EMR81564', 'UnSold'],
];

const INACTIVE = new Set(['PROP-011', 'PROP-018']);
const PRICES: Record<string, number> = {
  'PROP-001': 5500000000, 'PROP-002': 5000000, 'PROP-003': 5000000, 'PROP-004': 3000000,
  'PROP-005': 1000000, 'PROP-006': 900000, 'PROP-007': 14840000, 'PROP-008': 12500000,
  'PROP-009': 7800000, 'PROP-010': 32000000, 'PROP-011': 21000000, 'PROP-012': 45000000,
  'PROP-013': 9800000, 'PROP-014': 17500000, 'PROP-015': 22500000, 'PROP-016': 6400000,
  'PROP-017': 8700000, 'PROP-018': 54000000, 'PROP-019': 39000000, 'PROP-020': 15500000,
  'PROP-021': 11200000, 'PROP-022': 26500000, 'PROP-023': 7300000, 'PROP-024': 43000000,
};

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
    description: null,
    created_at: new Date().toISOString(),
  };
}

function seed(): Property[] {
  return SEED.map(([name, code, type, floor, block, reg, saleStatus], i) => {
    const price = PRICES[code] ?? 0;
    return {
      ...blank(i + 1),
      name,
      code,
      property_type: type as Property['property_type'],
      floor,
      block,
      registration_no: reg,
      current_status: saleStatus as Property['current_status'],
      status: INACTIVE.has(code) ? 'Inactive' : 'Active',
      sale_price: price,
      original_price: price,
      address: block || name,
      area: block || name,
    };
  });
}

function load(): Property[] {
  const rows = read<Property[]>(PROPS_KEY, []);
  if (rows.length === 0) {
    const seeded = seed();
    write(PROPS_KEY, seeded);
    return seeded;
  }
  return rows;
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