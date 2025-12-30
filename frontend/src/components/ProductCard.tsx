import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ShoppingCart,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Scale3d,
} from "lucide-react";
import type { Product, ShortSpec } from "@/types/product";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { ComparisonContext } from "@/context/ComparisonContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const cartContext = useContext(CartContext);
  const comparisonContext = useContext(ComparisonContext);

  if (!cartContext) {
    throw new Error("ProductCard must be used within CartProvider");
  }

  if (!comparisonContext) {
    throw new Error("ProductCard must be used within ComparisonProvider");
  }

  const { addToCart } = cartContext;
  const { addToCompare, removeFromCompare, isInComparison } = comparisonContext;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Rating = sumRate / rateCount
  const rating =
    product.rateCount > 0 ? product.sumRate / product.rateCount : 0;

  // Giảm giá từ field "sale" (%)
  const discountPercentage = product.sale > 0 ? product.sale : null;
  const originalPrice = discountPercentage
    ? Math.round((product.price * 100) / (100 - discountPercentage))
    : null;

  // Tạo object từ shortSpecs để dễ lấy
  const getSpec = (id: string) => {
    const specs: ShortSpec[] = Array.isArray(product.shortSpecs)
      ? product.shortSpecs
      : JSON.parse(product.shortSpecs || "[]");
    return specs.find((s) => s.id === id)?.value || "";
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnail: product.thumbnail,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInComparison(product.id)) {
      removeFromCompare(product.id);
      toast.info("Đã xóa khỏi danh sách so sánh");
    } else {
      addToCompare(product);
      toast.success("Đã thêm vào danh sách so sánh!");
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 transition-all duration-500 bg-gradient-card cursor-pointer h-full flex flex-col">
      {/* Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      {/* Image - Fixed height for consistency */}
      <div className="relative overflow-hidden h-48 sm:h-56 md:h-64 w-full">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-400 group-hover:scale-110"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badge sale */}
        <div className="absolute top-3 left-3 flex flex-col">
          {discountPercentage && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-500 text-white border-0 shadow-lg font-bold text-xs px-2 py-1 rounded-md">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Compare Icon */}
        <button
          onClick={handleCompare}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
            isInComparison(product.id)
              ? "bg-blue-500 text-white shadow-lg scale-110"
              : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:scale-110"
          }`}
          title={isInComparison(product.id) ? "Bỏ so sánh" : "Thêm vào so sánh"}
        >
          <Scale3d className="h-4 w-4" />
        </button>
      </div>

      <CardContent className="p-4 space-y-2 flex flex-col flex-grow">
        {/* Title + Rating */}
        <div>
          <h3 className="font-bold text-base line-clamp-2 min-h-[2rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 transition-all ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400 scale-110"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              ({product.rateCount})
            </span>
          </div>
        </div>

        {/* Specs */}
        <div className="bg-muted/30 rounded-lg p-2.5 space-y-1">
          <div className="text-xs font-semibold text-foreground mb-1">
            Cấu hình:
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 truncate">
              <Cpu className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{getSpec("cpu")}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <MemoryStick className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate">{getSpec("ram")}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <HardDrive className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
              <span className="truncate">{getSpec("ssd")}</span>
            </div>
            {getSpec("vga") && (
              <div className="flex items-center gap-1 truncate">
                <Monitor className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span className="truncate">{getSpec("vga")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="pt-1">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-extrabold text-[#1a73e8] leading-tight">
                {formatPrice(product.price)}
              </div>
              {originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </div>
              )}
            </div>

            {discountPercentage && originalPrice && (
              <div className="text-sm text-green-600 font-semibold text-right leading-snug">
                <div>Tiết kiệm</div>
                <div>{formatPrice(originalPrice - product.price)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          className="w-full h-10 mt-auto bg-gradient-primary text-white hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-bold cursor-pointer text-sm"
        >
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
