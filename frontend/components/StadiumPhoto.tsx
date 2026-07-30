"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getOfficialStadiumImage, getWikipediaStadiumTitle } from "@/lib/stadium-images";

const imageCache = new Map<string, string | null>();
const STORAGE_PREFIX = "wc-stadium-photo:";

function readPersistedCache(cacheKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + cacheKey);
  } catch {
    return null;
  }
}

function persistCache(cacheKey: string, url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) window.localStorage.setItem(STORAGE_PREFIX + cacheKey, url);
  } catch {
    // localStorage no disponible (modo privado, cuota, etc.) — se ignora
  }
}

export default function StadiumPhoto({
  year,
  stadiumName,
  city,
}: {
  year: number;
  stadiumName: string;
  city: string;
}) {
  const officialImage = getOfficialStadiumImage(year, stadiumName);
  const cacheKey = `${year}:${stadiumName}`;
  const [imageUrl, setImageUrl] = useState<string | null>(
    officialImage || imageCache.get(cacheKey) || readPersistedCache(cacheKey) || null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (officialImage || imageCache.has(cacheKey) || readPersistedCache(cacheKey)) return;

    let cancelled = false;
    const title = getWikipediaStadiumTitle(stadiumName);
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${title} ${city}`,
      gsrlimit: "1",
      prop: "pageimages",
      piprop: "thumbnail|original",
      pithumbsize: "900",
      format: "json",
      origin: "*",
    });
    const endpoint = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error(`Wikipedia ${response.status}`);
        return response.json();
      })
      .then((data: {
        query?: {
          pages?: Record<string, {
            thumbnail?: { source?: string };
            original?: { source?: string };
          }>;
        };
      }) => {
        const page = Object.values(data.query?.pages || {})[0];
        const source = page?.thumbnail?.source || page?.original?.source || null;
        imageCache.set(cacheKey, source);
        persistCache(cacheKey, source);
        if (!cancelled) setImageUrl(source);
      })
      .catch(() => {
        imageCache.set(cacheKey, null);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, city, officialImage, stadiumName]);

  if (!imageUrl || failed) return null;

  return (
    <Image
      src={imageUrl}
      alt={`Vista del ${stadiumName}`}
      fill
      sizes="(max-width: 768px) 100vw, 400px"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
