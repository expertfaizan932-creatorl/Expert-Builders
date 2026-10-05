import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

/** A property image with its bytes resolved into a src-able value. */
export interface LoadedImage {
  id: number;
  name: string;
  /** Data URI for uploaded images, or the original remote URL for Image Bank picks. */
  src: string;
}

/* The bytes never change for a given image, so cache them per property id. */
const cache = new Map<number, LoadedImage[]>();

/** True when a pending image still holds a remote URL instead of base64 data. */
export function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/**
 * Turn a remote Image Bank URL into a base64 data URI so the backend accepts it.
 * `create_property_image` only stores data URIs, so a bare URL would be rejected.
 */
export async function toDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch image (${res.status})`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Every image of a property: metadata from the list endpoint, then the bytes for
 * each one. The list endpoint deliberately omits `data`, so this is N+1 by design.
 */
export async function loadPropertyImages(
  propertyId: number,
  options: { force?: boolean } = {},
): Promise<LoadedImage[]> {
  if (!options.force && cache.has(propertyId)) return cache.get(propertyId)!;

  const list = await api.listPropertyImages(propertyId);
  const images = await Promise.all(
    (list.data ?? []).map(async (meta): Promise<LoadedImage | null> => {
      try {
        const res = await api.getPropertyImage(propertyId, meta.id);
        return { id: meta.id, name: meta.name, src: res.data };
      } catch {
        return null;
      }
    }),
  );

  const out = images.filter((i): i is LoadedImage => i !== null);
  cache.set(propertyId, out);
  return out;
}

export function forgetPropertyImages(propertyId: number): void {
  cache.delete(propertyId);
}

/** Loads a property's images, falling back to an empty list when the API has none. */
export function usePropertyImages(propertyId: number | null): {
  images: LoadedImage[];
  loading: boolean;
  reload: () => void;
} {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!propertyId) {
      setImages([]);
      return;
    }
    let alive = true;
    setLoading(true);
    loadPropertyImages(propertyId)
      .then((next) => {
        if (alive) setImages(next);
      })
      .catch(() => {
        if (alive) setImages([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [propertyId, nonce]);

  const reload = useCallback(() => {
    if (propertyId) forgetPropertyImages(propertyId);
    setNonce((n) => n + 1);
  }, [propertyId]);

  return { images, loading, reload };
}