"use client";

import { useState } from "react";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const [activeColor, setActiveColor] = useState(0);
  const image = product.colors[activeColor]?.imageUrl ?? product.imageUrl;

  return (
    <div className="iProduct--item">
      <div className="img" style={{ ["--bg" as string]: `url("${image}")` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.title} />
      </div>
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
      </div>
    </div>
  );
}
