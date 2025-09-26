export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "laptop" | "desktop" | "gaming";
  specs: {
    processor: string;
    ram: string;
    storage: string;
    graphics?: string;
  };
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

import laptopGaming from "@/assets/laptop-gaming.jpg";
import pcGaming from "@/assets/pc-gaming.jpg";
import laptopBusiness from "@/assets/laptop-business.jpg";

export const products: Product[] = [
  {
    id: 1,
    name: "Gaming Laptop ROG Strix G15",
    price: 25990000,
    originalPrice: 29990000,
    image: laptopGaming,
    category: "laptop",
    specs: {
      processor: "AMD Ryzen 7 5800H",
      ram: "16GB DDR4",
      storage: "512GB SSD",
      graphics: "RTX 3060 6GB",
    },
    rating: 4.8,
    reviews: 234,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "PC Gaming RGB Warrior",
    price: 32500000,
    originalPrice: 35000000,
    image: pcGaming,
    category: "desktop",
    specs: {
      processor: "Intel Core i7-12700K",
      ram: "32GB DDR4",
      storage: "1TB SSD + 2TB HDD",
      graphics: "RTX 4070 12GB",
    },
    rating: 4.9,
    reviews: 156,
    isBestSeller: true,
  },
  {
    id: 3,
    name: "Business Laptop ThinkPad X1",
    price: 18500000,
    image: laptopBusiness,
    category: "laptop",
    specs: {
      processor: "Intel Core i5-12500H",
      ram: "16GB DDR4",
      storage: "512GB SSD",
    },
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 4,
    name: "Gaming Laptop Acer Predator",
    price: 28900000,
    originalPrice: 31900000,
    image: laptopGaming,
    category: "gaming",
    specs: {
      processor: "Intel Core i7-12700H",
      ram: "16GB DDR4",
      storage: "1TB SSD",
      graphics: "RTX 3070 8GB",
    },
    rating: 4.6,
    reviews: 178,
    isNew: true,
  },
  {
    id: 5,
    name: "PC Workstation Pro",
    price: 45000000,
    image: pcGaming,
    category: "desktop",
    specs: {
      processor: "AMD Ryzen 9 5950X",
      ram: "64GB DDR4",
      storage: "2TB SSD",
      graphics: "RTX 4080 16GB",
    },
    rating: 4.9,
    reviews: 67,
  },
  {
    id: 6,
    name: "Ultrabook Dell XPS 13",
    price: 22900000,
    image: laptopBusiness,
    category: "laptop",
    specs: {
      processor: "Intel Core i7-1260P",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
    },
    rating: 4.5,
    reviews: 145,
  },
];