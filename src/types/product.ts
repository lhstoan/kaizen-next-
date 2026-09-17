export type ProductCategory = "shirt" | "shorts" | "cap" | "socks" | "accessory";

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "shirt", label: "Shirt" },
  { value: "shorts", label: "Shorts" },
  { value: "cap", label: "Cap" },
  { value: "socks", label: "Socks" },
  { value: "accessory", label: "Accessory" },
];

export type ProductColor = {
  name: string;
  code: string;
  imageUrl: string;
};

export type Product = {
  id: string;
  title: string;
  category: ProductCategory;
  sizes: string[];
  price: number;
  isNew: boolean;
  shortDescription: string;
  imageUrl: string;
  purchaseLink: string;
  colors: ProductColor[];
};
