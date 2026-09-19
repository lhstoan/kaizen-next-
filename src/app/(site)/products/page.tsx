import SectionHeading from "@/components/site/SectionHeading";
import ProductGrid from "@/components/site/ProductGrid";
import { getProducts } from "@/lib/products";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product";

export const metadata = {
  title: "COLLECTION | KAIZEN BADMINTON",
};

// ?cate= is resolved here rather than in the client grid so a shared or reloaded link
// renders the right tab on the server — no flash of the full list, no hydration gap.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cate?: string }>;
}) {
  const [products, { cate }] = await Promise.all([getProducts(), searchParams]);
  const initialCategory = PRODUCT_CATEGORIES.some((c) => c.value === cate)
    ? (cate as ProductCategory)
    : "all";
  return (
    <main>
      <div className="pageHeader">
        <SectionHeading en="Collection" jp="コレクション" />
      </div>
      <ProductGrid products={products} initialCategory={initialCategory} />
    </main>
  );
}
