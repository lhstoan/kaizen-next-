"use client";

import { useEffect, useState } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import ProductCard from "@/components/site/ProductCard";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/types/product";

export default function ProductGrid({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const visible = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  // One delegated binding for every card's [data-fancybox] group, the same way the
  // legacy theme let the Fancybox UMD bundle pick them up on load.
  useEffect(() => {
    Fancybox.bind("[data-fancybox]");
    return () => Fancybox.unbind("[data-fancybox]");
  }, []);

  return (
    <section className="iProduct">
      <div className="iProduct--wrap">
        <div className="iProduct-header">
          <ul className="iProduct--cate">
            <li className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>
              ALL
            </li>
            {PRODUCT_CATEGORIES.map((cat) => (
              <li
                key={cat.value}
                className={activeCategory === cat.value ? "active" : ""}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="iProduct--body">
          <div className="iProduct--list">
            {visible.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
