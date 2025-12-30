import { createContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/types/product";

interface ComparisonContextType {
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  clearComparison: () => void;
  isInComparison: (productId: number) => boolean;
  maxComparisons: number;
}

export const ComparisonContext = createContext<
  ComparisonContextType | undefined
>(undefined);

const STORAGE_KEY = "comparison_products";
const MAX_COMPARISONS = 4;

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [compareProducts, setCompareProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareProducts));
  }, [compareProducts]);

  const addToCompare = (product: Product) => {
    setCompareProducts((prev) => {
      // Nếu đã có trong danh sách thì không thêm
      if (prev.some((p) => p.id === product.id)) {
        return prev;
      }

      // Nếu đủ 4 sản phẩm thì xóa cái đầu tiên
      if (prev.length >= MAX_COMPARISONS) {
        return [...prev.slice(1), product];
      }

      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: number) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setCompareProducts([]);
  };

  const isInComparison = (productId: number) => {
    return compareProducts.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isInComparison,
        maxComparisons: MAX_COMPARISONS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};
