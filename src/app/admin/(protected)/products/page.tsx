import { createClient } from "@/lib/supabase/server";
import ProductsManager from "@/components/admin/products-manager";
import type { AdminProduct } from "@/components/admin/products-manager";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, category, sizes, is_new, image_url, colors, gallery, sort_order, active")
    .order("sort_order", { ascending: true });

  return <ProductsManager initialProducts={(data ?? []) as AdminProduct[]} />;
}
