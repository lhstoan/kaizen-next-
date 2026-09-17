import SectionHeading from "@/components/site/SectionHeading";
import ProductGrid from "@/components/site/ProductGrid";
import { placeholderProducts } from "@/lib/placeholder-products";

export const metadata = {
  title: "COLLECTION | KAIZEN BADMINTON",
};

export default function ProductsPage() {
  return (
    <main>
      <div className="pageHeader">
        <SectionHeading en="Collection" jp="コレクション" />
      </div>
      <ProductGrid products={placeholderProducts} />
    </main>
  );
}
