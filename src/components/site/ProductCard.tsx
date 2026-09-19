"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { optimizedImage } from "@/lib/image";

export default function ProductCard({ product }: { product: Product }) {
  const [activeColor, setActiveColor] = useState(0);
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

  return (
    <div className="iProduct--item">
      <a
        className="img"
        style={{ ["--bg" as string]: `url("${thumb}")` }}
        data-fancybox={galleryId}
        href={full}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt={product.title} loading="lazy" decoding="async" />
      </a>
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
                onClick={() => setActiveColor(i)}
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
