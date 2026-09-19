"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { optimizedImage } from "@/lib/image";

export default function ProductCard({ product }: { product: Product }) {
  const [activeColor, setActiveColor] = useState(0);
  // Keyed by URL, not a single boolean: switching colorway has to show the skeleton
  // again for a shot the browser has not decoded yet, but never for one it already has.
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const image = product.colors[activeColor]?.image || product.imageUrl;
  // The card is ~290px wide; the lightbox is full screen but still has no use for
  // the untouched 8 MB original.
  const thumb = optimizedImage(image, 640);
  const full = optimizedImage(image, 1920);

  // Legacy behaviour (kaizen/archive-collections.php): the visible thumbnail opens a
  // Fancybox group holding every shot of the product — each colorway plus the extra
  // descriptive images — with the other entries kept as hidden anchors.
  const galleryId = `product-${product.id}`;
  const hiddenImages = [...product.colors.map((c) => c.image), ...product.gallery]
    .filter((url) => url && url !== image)
    .map((url) => optimizedImage(url, 1920));

  const markLoaded = (url: string) => setLoaded((prev) => (prev[url] ? prev : { ...prev, [url]: true }));

  // A cached image can finish decoding between the server HTML and hydration, so its
  // onLoad never reaches React and the skeleton would sit there forever. The ref runs
  // on attach, when .complete already tells us the answer.
  const checkOnAttach = (url: string) => (el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) markLoaded(url);
  };

  return (
    <div className="iProduct--item">
      <a
        className={`img${loaded[thumb] ? " is-loaded" : ""}`}
        style={{ ["--bg" as string]: `url("${thumb}")` }}
        data-fancybox={galleryId}
        href={full}
      >
        {/* Legacy CSS keeps this one transparent and paints the photo as the <a>'s
            background, so its load event is the only signal the shot is on screen. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={checkOnAttach(thumb)}
          src={thumb}
          alt={product.title}
          decoding="async"
          onLoad={() => markLoaded(thumb)}
          onError={() => markLoaded(thumb)}
        />
      </a>

      {/* Clicking a swatch rewrites --bg, and a CSS background is only fetched at that
          moment, so the card would go blank on every switch. These warm the cache — and
          their load events mean the skeleton is skipped entirely for a ready colorway.
          They wait for the visible thumbnail: with a dozen cards on screen the preloads
          otherwise open ~18 extra requests that compete with the shots being looked at. */}
      {loaded[thumb] &&
        product.colors.map((color) =>
          color.image && color.image !== image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`preload-${color.name}`}
              ref={checkOnAttach(optimizedImage(color.image, 640))}
              src={optimizedImage(color.image, 640)}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              onLoad={() => markLoaded(optimizedImage(color.image, 640))}
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            />
          ) : null,
        )}

      <div className="content">
        <div className="title">{product.title}</div>
        {product.colors.length > 0 && (
          <ul className="colors">
            {product.colors.map((color, i) => (
              <li
                key={color.name}
                className={i === activeColor ? "active" : ""}
                style={{ backgroundColor: color.code }}
                title={color.name}
                role="button"
                tabIndex={0}
                aria-label={`${product.title} — ${color.name}`}
                aria-pressed={i === activeColor}
                onClick={() => setActiveColor(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveColor(i);
                  }
                }}
              />
            ))}
          </ul>
        )}
        {hiddenImages.map((url) => (
          <a key={url} href={url} data-fancybox={galleryId} hidden />
        ))}
      </div>
    </div>
  );
}
