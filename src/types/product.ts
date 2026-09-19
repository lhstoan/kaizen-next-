export type ProductCategory = "shirt" | "shorts" | "cap" | "socks" | "other";

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "shirt", label: "T-Shirt" },
  { value: "shorts", label: "Shorts" },
  { value: "cap", label: "Cap" },
  { value: "socks", label: "Socks" },
  { value: "other", label: "Other" },
];

export const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL", "FREE"] as const;

// The four fixed colorways, order and hex copied from the legacy ACF colorMap
// in kaizen/archive-collections.php (color_1..color_4) so ported markup matches.
export const PRODUCT_COLORS = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Navy", code: "#1B2951" },
  { name: "Red", code: "#C00000" },
] as const;

export type ProductColor = {
  name: string;
  code: string;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  category: ProductCategory;
  sizes: string[];
  isNew: boolean;
  imageUrl: string;
  colors: ProductColor[];
  // Extra shots that describe the product but aren't a colorway of their own.
  gallery: string[];
};
