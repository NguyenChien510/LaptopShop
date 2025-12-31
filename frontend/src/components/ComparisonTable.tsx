import { useContext } from "react";
import { ComparisonContext } from "@/context/ComparisonContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { DetailSpec } from "@/types/product";

interface ComparisonTableProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComparisonTable = ({ isOpen, onOpenChange }: ComparisonTableProps) => {
  const comparisonContext = useContext(ComparisonContext);

  if (!comparisonContext) {
    throw new Error("ComparisonTable must be used within ComparisonProvider");
  }

  const { compareProducts, removeFromCompare, clearComparison } =
    comparisonContext;

  // Lấy tất cả danh mục spec duy nhất từ tất cả sản phẩm
  const getAllSpecCategories = () => {
    const categories = new Set<string>();
    compareProducts.forEach((product) => {
      const specs: DetailSpec[] = Array.isArray(product.detailSpecs)
        ? product.detailSpecs
        : JSON.parse(product.detailSpecs || "[]");
      specs.forEach((spec) => {
        categories.add(spec.category);
      });
    });
    return Array.from(categories).sort();
  };

  // Lấy specs theo category cho một sản phẩm
  const getSpecsByCategory = (productId: number, category: string) => {
    const product = compareProducts.find((p) => p.id === productId);
    if (!product) return [];

    const specs: DetailSpec[] = Array.isArray(product.detailSpecs)
      ? product.detailSpecs
      : JSON.parse(product.detailSpecs || "[]");

    return specs
      .filter((spec) => spec.category === category)
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const categories = getAllSpecCategories();

  if (compareProducts.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              So sánh sản phẩm
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-slate-400 text-lg">
              Chưa có sản phẩm nào để so sánh
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Vui lòng thêm sản phẩm từ danh sách để bắt đầu so sánh
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-gradient-to-br from-slate-950 to-slate-900 border-slate-700 flex flex-col rounded-none">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700 flex-shrink-0">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            So sánh sản phẩm
          </DialogTitle>
          <DialogDescription className="text-slate-400 mt-1">
            So sánh chi tiết thông số kỹ thuật giữa {compareProducts.length} sản
            phẩm
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full overflow-hidden">
          <div className="p-6 w-full">
            {/* Product Cards Header */}
            <div
              className="grid gap-4 mb-8"
              style={{
                gridTemplateColumns: `repeat(${compareProducts.length}, minmax(250px, 1fr))`,
              }}
            >
              {compareProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors cursor-pointer"
                      title="Xóa khỏi danh sách so sánh"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-slate-200 text-sm line-clamp-2 h-10">
                      {product.name}
                    </h3>
                    <div className="text-lg font-bold text-blue-400">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Specs Comparison */}
            {categories.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>Không có thông số chi tiết để so sánh</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => {
                  const allLabelsInCategory = new Set<string>();
                  compareProducts.forEach((product) => {
                    getSpecsByCategory(product.id, category).forEach((spec) => {
                      allLabelsInCategory.add(spec.label);
                    });
                  });

                  return (
                    <div
                      key={category}
                      className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden"
                    >
                      {/* Category Header */}
                      <div className="bg-slate-800/60 px-4 py-3 border-b border-slate-700">
                        <h3 className="font-semibold text-slate-200 text-base">
                          {category}
                        </h3>
                      </div>

                      {/* Specs Grid */}
                      <div className="divide-y divide-slate-700">
                        {Array.from(allLabelsInCategory)
                          .sort()
                          .map((label) => (
                            <div
                              key={`${category}-${label}`}
                              className="p-4 hover:bg-slate-800/20 transition-colors"
                            >
                              <div className="mb-3">
                                <p className="text-sm font-medium text-slate-300">
                                  {label}
                                </p>
                              </div>
                              <div
                                className="grid gap-4"
                                style={{
                                  gridTemplateColumns: `repeat(${compareProducts.length}, minmax(200px, 1fr))`,
                                }}
                              >
                                {compareProducts.map((product) => {
                                  const spec = getSpecsByCategory(
                                    product.id,
                                    category
                                  ).find((s) => s.label === label);

                                  return (
                                    <div
                                      key={`${product.id}-${label}`}
                                      className="bg-slate-700/30 rounded px-3 py-2 text-sm"
                                    >
                                      {spec ? (
                                        <span className="text-slate-200 font-medium">
                                          {spec.value || "-"}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 italic">
                                          Không có
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-slate-700 flex justify-between bg-slate-900/50 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              clearComparison();
              onOpenChange(false);
            }}
            className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
          >
            Xóa tất cả
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonTable;
