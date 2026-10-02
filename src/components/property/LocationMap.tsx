import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PAKISTAN_CENTRE, type LatLng } from '../../data/geo';

const PIN_HTML = `
  <svg width="34" height="44" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
      fill="#0A58A3"/>
    <circle cx="12" cy="12" r="4.6" fill="#fff"/>
  </svg>`;

const pinIcon = L.divIcon({
  html: PIN_HTML,
  className: '',
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

interface Props {
  /** Selected coordinates — the map flies here whenever this changes. */
  focus: LatLng | null;
  /** When false the user can pan/zoom but cannot move the pin. */
  picking: boolean;
  onPick: (point: { lat: number; lng: number }) => void;
}

/** Real slippy map for the Location step — auto-centres on the chosen place. */
export default function LocationMap({ focus, picking, onPick }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pickRef = useRef(picking);
  const onPickRef = useRef(onPick);

  pickRef.current = picking;
  onPickRef.current = onPick;

  // Create once.
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;

    const map = L.map(hostRef.current, {
      center: [PAKISTAN_CENTRE.lat, PAKISTAN_CENTRE.lng],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    mapRef.current = map;

    const place = (e: L.LeafletMouseEvent) => {
      if (!pickRef.current) return;
      onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on('click', place);

    // The container is hidden/shown by the page layout, so keep Leaflet's
    // internal size in sync once the tiles have settled.
    const settle = () => map.invalidateSize();
    const t = window.setTimeout(settle, 120);
    map.whenReady(settle);

    return () => {
      window.clearTimeout(t);
      map.off('click', place);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Fly to whatever was selected.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!focus) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const point: L.LatLngExpression = [focus.lat, focus.lng];
    if (markerRef.current) {
      markerRef.current.setLatLng(point);
    } else {
      markerRef.current = L.marker(point, { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current.bindPopup(focus.label || 'Selected location');
      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = (e.target as L.Marker).getLatLng();
        onPickRef.current({ lat, lng });
      });
    }
    markerRef.current.setPopupContent(focus.label || 'Selected location');

    map.flyTo(point, Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [focus]);

  // While picking, let the wheel zoom the map instead of the page behind it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (picking) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [picking]);

  return (
    <div className="relative">
      <div
        ref={hostRef}
        className={`h-56 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner ${
          picking ? 'cursor-crosshair ring-2 ring-brand-blue/40' : ''
        }`}
      />
      {picking && (
        <span className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-full bg-slate-900/85 px-3 py-1.5 text-[11px] font-semibold text-white">
          Tap the map to place the pin
        </span>
      )}
    </div>
  );
}