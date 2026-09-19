import { createClient } from "@/lib/supabase/server";
import type { Product, ProductCategory, ProductColor } from "@/types/product";

type ProductRow = {
  id: string;
  title: string;
  category: ProductCategory;
  sizes: string[];
  is_new: boolean;
  image_url: string;
  colors: ProductColor[];
  gallery: string[];
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    sizes: row.sizes,
    isNew: row.is_new,
    imageUrl: row.image_url,
    colors: row.colors,
    gallery: row.gallery ?? [],
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, title, category, sizes, is_new, image_url, colors, gallery")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as ProductRow[]).map(toProduct);
}
