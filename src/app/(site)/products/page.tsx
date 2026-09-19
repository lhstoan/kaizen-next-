import SectionHeading from "@/components/site/SectionHeading";
import ProductGrid from "@/components/site/ProductGrid";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "COLLECTION | KAIZEN BADMINTON",
};

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <main>
      <div className="pageHeader">
        <SectionHeading en="Collection" jp="コレクション" />
      </div>
      <ProductGrid products={products} />
    </main>
  );
}
