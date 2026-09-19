"use client";

import { useEffect, useState } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import ProductCard from "@/components/site/ProductCard";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/types/product";

export default function ProductGrid({
  products,
  initialCategory = "all",
}: {
  products: Product[];
  initialCategory?: ProductCategory | "all";
}) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(initialCategory);
  const visible = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  // replaceState, not the router: a filter is not a new page, and pushing one would
  // make Back walk the tabs and could jump the scroll position.
  const selectCategory = (value: ProductCategory | "all") => {
    setActiveCategory(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("cate");
    else url.searchParams.set("cate", value);
    window.history.replaceState(null, "", url);
  };

  // One delegated binding for every card's [data-fancybox] group, the same way the
  // legacy theme let the Fancybox UMD bundle pick them up on load.
  useEffect(() => {
    Fancybox.bind("[data-fancybox]");
    return () => Fancybox.unbind("[data-fancybox]");
  }, []);

  const onTabKey = (e: React.KeyboardEvent, value: ProductCategory | "all") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectCategory(value);
    }
  };

  return (
    <section className="iProduct">
      <div className="iProduct--wrap">
        <div className="iProduct-header">
          <ul className="iProduct--cate">
            <li
              className={activeCategory === "all" ? "active" : ""}
              role="button"
              tabIndex={0}
              aria-pressed={activeCategory === "all"}
              onClick={() => selectCategory("all")}
              onKeyDown={(e) => onTabKey(e, "all")}
            >
              ALL
            </li>
            {PRODUCT_CATEGORIES.map((cat) => (
              <li
                key={cat.value}
                className={activeCategory === cat.value ? "active" : ""}
                role="button"
                tabIndex={0}
                aria-pressed={activeCategory === cat.value}
                onClick={() => selectCategory(cat.value)}
                onKeyDown={(e) => onTabKey(e, cat.value)}
              >
                {cat.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="iProduct--body">
          <div className="iProduct--list">
            {visible.length === 0 ? (
              <p className="iProduct--empty">Chưa có sản phẩm trong mục này.</p>
            ) : (
              visible.map((product) => <ProductCard product={product} key={product.id} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
