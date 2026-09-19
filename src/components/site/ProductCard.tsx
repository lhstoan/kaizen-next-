"use client";

import { useState } from "react";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const [activeColor, setActiveColor] = useState(0);
  const image = product.colors[activeColor]?.image || product.imageUrl;

  // Legacy behaviour (kaizen/archive-collections.php): the visible thumbnail opens a
  // Fancybox group holding every shot of the product — each colorway plus the extra
  // descriptive images — with the other entries kept as hidden anchors.
  const galleryId = `product-${product.id}`;
  const hiddenImages = [...product.colors.map((c) => c.image), ...product.gallery].filter(
    (url) => url && url !== image,
  );

  return (
    <div className="iProduct--item">
      <a
        className="img"
        style={{ ["--bg" as string]: `url("${image}")` }}
        data-fancybox={galleryId}
        href={image}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.title} />
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
