"use client";

import { useEffect, useState } from "react";
import { getOfficialStadiumImage, getWikipediaStadiumTitle } from "@/lib/stadium-images";

const imageCache = new Map<string, string | null>();

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
    officialImage || imageCache.get(cacheKey) || null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (officialImage || imageCache.has(cacheKey)) return;

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
    // Se usa img porque las fuentes son externas y pueden variar por estadio.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`Vista del ${stadiumName}`}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
