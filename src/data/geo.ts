/**
 * Location lookup for the property map.
 *
 * Order of preference:
 *  1. A curated dictionary of well known Pakistan localities — instant, works
 *     with no network, and covers the areas agents actually type (DHA phases,
 *     Bahria Town, Gulberg, Blue Area, ...).
 *  2. OpenStreetMap / Nominatim for anything else.
 */

export interface LatLng {
  lat: number;
  lng: number;
  label: string;
}

/** [area, city, lat, lng] — several localities share a name (Saddar, Cantt...),
 *  so they are kept as rows and indexed by name at load time. */
const AREA_ROWS: [string, string, number, number][] = [
  // ---- Lahore ----
  ['DHA Phase 1', 'Lahore', 31.4719, 74.3579],
  ['DHA Phase 2', 'Lahore', 31.4703, 74.3631],
  ['DHA Phase 3', 'Lahore', 31.4699, 74.3666],
  ['DHA Phase 4', 'Lahore', 31.4696, 74.3707],
  ['DHA Phase 5', 'Lahore', 31.4707, 74.3663],
  ['DHA Phase 6', 'Lahore', 31.4795, 74.3735],
  ['DHA Phase 7', 'Lahore', 31.4718, 74.3772],
  ['DHA Phase 8', 'Lahore', 31.4733, 74.3834],
  ['DHA Phase 9', 'Lahore', 31.4787, 74.3887],
  ['Gulberg', 'Lahore', 31.5107, 74.3459],
  ['Gulberg III', 'Lahore', 31.5103, 74.3531],
  ['Gulberg IV', 'Lahore', 31.5126, 74.3622],
  ['Bahria Town', 'Lahore', 31.4719, 74.2041],
  ['Bahria Town Sector C', 'Lahore', 31.4681, 74.2158],
  ['Johar Town', 'Lahore', 31.4698, 74.2539],
  ['Model Town', 'Lahore', 31.4815, 74.3216],
  ['Town Hall', 'Lahore', 31.4696, 74.3163],
  ['Cantt', 'Lahore', 31.5497, 74.3436],
  ['Faisal Town', 'Lahore', 31.4295, 74.1308],
  ['Garden Town', 'Lahore', 31.5154, 74.3062],
  ['FBR Area', 'Lahore', 31.4699, 74.3229],
  ['Saddar', 'Lahore', 31.5479, 74.3556],
  ['Wagah', 'Lahore', 31.6047, 74.5733],
  ['Paragon City', 'Lahore', 31.4757, 74.3683],
  ['Askari', 'Lahore', 31.4779, 74.3539],
  ['Nishat', 'Lahore', 31.4742, 74.3601],
  ['WAPDA Town', 'Lahore', 31.5229, 74.3342],
  ['Shadman', 'Lahore', 31.5103, 74.3354],
  ['Orange', 'Lahore', 31.4797, 74.2646],
  ['Raiwind Road', 'Lahore', 31.4392, 74.2625],
  ['Kharar', 'Lahore', 31.4779, 74.2906],
  ['Mehmood Abdullah', 'Lahore', 31.4618, 74.2917],

  // ---- Islamabad ----
  ['F-10', 'Islamabad', 33.6959, 73.0136],
  ['F-11', 'Islamabad', 33.7007, 73.0219],
  ['F-7', 'Islamabad', 33.7203, 73.0565],
  ['F-6', 'Islamabad', 33.7306, 73.0717],
  ['F-8', 'Islamabad', 33.6914, 73.0139],
  ['F-5', 'Islamabad', 33.7437, 73.0789],
  ['F-9', 'Islamabad', 33.7001, 72.9997],
  ['F-12', 'Islamabad', 33.6975, 72.9856],
  ['G-9', 'Islamabad', 33.6911, 73.0281],
  ['G-10', 'Islamabad', 33.6903, 73.0414],
  ['G-11', 'Islamabad', 33.6846, 73.0497],
  ['G-12', 'Islamabad', 33.6841, 73.0669],
  ['G-13', 'Islamabad', 33.6831, 73.0844],
  ['I-8', 'Islamabad', 33.6857, 72.9936],
  ['I-9', 'Islamabad', 33.6829, 72.9869],
  ['I-10', 'Islamabad', 33.6822, 72.9707],
  ['E-7', 'Islamabad', 33.7192, 73.0209],
  ['Blue Area', 'Islamabad', 33.7106, 73.0568],
  ['Daman-e-Koh', 'Islamabad', 33.7353, 73.0538],
  ['Saidpur', 'Islamabad', 33.7114, 73.1498],
  ['Pir Wadhah', 'Islamabad', 33.7028, 73.0786],
  ['DHA Phase 1', 'Islamabad', 33.5231, 73.1253],
  ['DHA Phase 2', 'Islamabad', 33.5238, 73.1329],

  // ---- Karachi ----
  ['Clifton', 'Karachi', 24.8138, 67.0302],
  ['Defence', 'Karachi', 24.8009, 67.0289],
  ['DHA', 'Karachi', 24.8007, 67.0603],
  ['Peoples Colony', 'Karachi', 24.9352, 67.2246],
  ['Gulshan-e-Jamal', 'Karachi', 24.9311, 67.2417],
  ['North Nazimabad', 'Karachi', 24.9109, 67.0402],
  ['Nazimabad', 'Karachi', 24.9065, 67.0384],
  ['Fedoral', 'Karachi', 24.9284, 66.9879],
  ['Korangi', 'Karachi', 24.8346, 67.1603],
  ['Gulistan-e-Jauhar', 'Karachi', 24.8899, 67.1418],
  ['Shalimar', 'Karachi', 24.8896, 67.0745],
  ['Tariq Road', 'Karachi', 24.8727, 67.0619],
  ['Saddar', 'Karachi', 24.8607, 67.0104],
  ['Jamshoro Road', 'Karachi', 24.9414, 67.1478],
  ['Banaras Road', 'Karachi', 24.9376, 67.0676],
  ['Cantt', 'Karachi', 24.8536, 67.0136],
  ['Malir', 'Karachi', 24.8903, 67.1943],
  ['Shah Faisal Colony', 'Karachi', 24.8642, 67.1683],
  ['Scheme 33', 'Karachi', 24.8396, 67.0362],

  // ---- Rawalpindi ----
  ['Bahria Town', 'Rawalpindi', 33.5203, 73.0601],
  ['Satellite Town', 'Rawalpindi', 33.5387, 73.0912],
  ['Gulzar-e-Quaid', 'Rawalpindi', 33.5365, 73.0763],
  ['Punjab Market', 'Rawalpindi', 33.5969, 73.0524],
  ['Commercial Market', 'Rawalpindi', 33.6009, 73.0639],
  ['Raja Bazaar', 'Rawalpindi', 33.5972, 73.0462],
  ['Chakri', 'Rawalpindi', 33.5271, 73.1196],
  ['Tariq Road', 'Rawalpindi', 33.5226, 73.0637],
  ['DHA Phase 2', 'Rawalpindi', 33.5106, 73.0706],

  // ---- Faisalabad ----
  ['D Ground', 'Faisalabad', 31.4184, 73.0791],
  ['Madina Colony', 'Faisalabad', 31.4297, 73.1012],
  ['Peoples Colony', 'Faisalabad', 31.4402, 73.0805],
  ['Sargodha Road', 'Faisalabad', 31.4512, 73.1301],
  ['Kot Lakhpat', 'Faisalabad', 31.4203, 73.0571],
  ['Rail Bazaar', 'Faisalabad', 31.4245, 73.0791],
  ['Cantt', 'Faisalabad', 31.4302, 73.0674],
  ['Madina Town', 'Faisalabad', 31.4469, 73.0898],

  // ---- Peshawar ----
  ['Hayatabad', 'Peshawar', 33.9882, 71.4403],
  ['Saddar', 'Peshawar', 34.0089, 71.5787],
  ['Canal Road', 'Peshawar', 34.0043, 71.4758],
  ['University Road', 'Peshawar', 34.0009, 71.4877],
  ['Gulshan Colony', 'Peshawar', 34.0051, 71.5054],
  ['Warsak Road', 'Peshawar', 34.0154, 71.4398],
];

interface AreaHit {
  city: string;
  lat: number;
  lng: number;
}

/** name -> every locality with that name (a name can exist in several cities). */
const AREAS = new Map<string, AreaHit[]>();
AREA_ROWS.forEach(([area, city, lat, lng]) => {
  const key = normalise(area);
  const list = AREAS.get(key) ?? [];
  list.push({ city, lat, lng });
  AREAS.set(key, list);
});

/** City centres, used when no area is picked yet. */
const CITY_CENTRES: Record<string, LatLng> = {
  islamabad: { lat: 33.6844, lng: 73.0479, label: 'Islamabad' },
  rawalpindi: { lat: 33.5651, lng: 73.0169, label: 'Rawalpindi' },
  lahore: { lat: 31.5204, lng: 74.3587, label: 'Lahore' },
  karachi: { lat: 24.8607, lng: 67.0011, label: 'Karachi' },
  peshawar: { lat: 34.0151, lng: 71.5249, label: 'Peshawar' },
  faisalabad: { lat: 31.4504, lng: 73.135, label: 'Faisalabad' },
  quetta: { lat: 30.1798, lng: 66.975, label: 'Quetta' },
  multan: { lat: 30.1575, lng: 71.5249, label: 'Multan' },
  gujranwala: { lat: 32.1877, lng: 74.1945, label: 'Gujranwala' },
  hyderabad: { lat: 25.396, lng: 68.3578, label: 'Hyderabad' },
  sukkur: { lat: 27.7052, lng: 68.8574, label: 'Sukkur' },
  sialkot: { lat: 32.4945, lng: 74.5229, label: 'Sialkot' },
  abbottabad: { lat: 34.1688, lng: 73.2215, label: 'Abbottabad' },
  gujrat: { lat: 32.5742, lng: 74.0759, label: 'Gujrat' },
  bahawalpur: { lat: 29.3956, lng: 71.6836, label: 'Bahawalpur' },
  sahiwal: { lat: 31.3667, lng: 73.3833, label: 'Sahiwal' },
};

const PAKISTAN: LatLng = { lat: 30.3753, lng: 69.3451, label: 'Pakistan' };

export function cityCentre(city: string): LatLng | null {
  if (!city) return null;
  return CITY_CENTRES[city.trim().toLowerCase()] ?? null;
}

function normalise(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(phase|sector|block|street|road|house|apartment|flat|block)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Dictionary lookup: exact match first, then the longest name contained in the text. */
function lookupArea(area: string, city: string): LatLng | null {
  const clean = normalise(area);
  if (!clean) return null;
  const cityKey = city.trim().toLowerCase();

  const pick = (hits: AreaHit[]): AreaHit | null => {
    if (hits.length === 0) return null;
    if (cityKey) {
      const scoped = hits.filter((h) => h.city.toLowerCase() === cityKey);
      if (scoped.length > 0) return scoped[0];
    }
    // Only trust an unscoped hit when the name is unambiguous.
    return hits.length === 1 ? hits[0] : null;
  };

  const exact = pick(AREAS.get(clean) ?? []);
  if (exact) return { lat: exact.lat, lng: exact.lng, label: area };

  let bestKey = '';
  let bestHit: LatLng | null = null;
  for (const [key, hits] of AREAS) {
    if (key.length < 4 || !clean.includes(key)) continue;
    if (key.length <= bestKey.length) continue;
    const hit = pick(hits);
    if (!hit) continue;
    bestKey = key;
    bestHit = { lat: hit.lat, lng: hit.lng, label: area };
  }
  return bestHit;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
}

async function nominatim(query: string): Promise<LatLng | null> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pk&addressdetails=0&q=' +
    encodeURIComponent(query);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const places = (await res.json()) as NominatimPlace[];
    if (!Array.isArray(places) || places.length === 0) return null;
    const hit = places[0];
    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, label: hit.display_name };
  } catch {
    return null;
  }
}

/** City first (so it centres), then the area, then OpenStreetMap as a last resort. */
export async function geocode(area: string, city: string): Promise<LatLng | null> {
  const areaName = area.trim();

  if (areaName) {
    const hit = lookupArea(areaName, city);
    if (hit) return hit;

    const remote = await nominatim(city ? `${areaName}, ${city}, Pakistan` : `${areaName}, Pakistan`);
    if (remote) return remote;
  }

  return cityCentre(city) ?? PAKISTAN;
}

export const PAKISTAN_CENTRE = PAKISTAN;