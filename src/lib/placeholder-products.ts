import type { Product } from "@/types/product";

export const placeholderProducts: Product[] = [
  {
    id: "1",
    title: "Áo Kaizen ABC",
    category: "shirt",
    sizes: ["S", "M", "L", "XL"],
    price: 350000,
    isNew: true,
    shortDescription: "Áo thi đấu Kaizen Badminton, vải thoáng khí.",
    imageUrl: "/images/products/pro1.jpg",
    purchaseLink: "",
    colors: [
      { name: "White", code: "#ffffff", imageUrl: "/images/products/white.png" },
      { name: "Navy", code: "#262865", imageUrl: "/images/products/navy.png" },
      { name: "Red", code: "#ff0000", imageUrl: "/images/products/red.png" },
      { name: "Black", code: "#000000", imageUrl: "/images/products/đen.png" },
    ],
  },
  {
    id: "2",
    title: "Quần Flexion",
    category: "shorts",
    sizes: ["S", "M", "L", "XL", "2XL"],
    price: 250000,
    isNew: false,
    shortDescription: "Quần short Flexion co giãn 4 chiều.",
    imageUrl: "/images/products/Quần Flexion Trắng.jpg",
    purchaseLink: "",
    colors: [
      { name: "White", code: "#ffffff", imageUrl: "/images/products/Quần Flexion Trắng.jpg" },
      { name: "Black", code: "#000000", imageUrl: "/images/products/Quần Flexion Đen.jpg" },
    ],
  },
];
