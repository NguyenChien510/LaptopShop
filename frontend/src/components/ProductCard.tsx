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
} from "lucide-react";
import type { Product, ShortSpec } from "@/types/product";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("ProductCard must be used within CartProvider");
  }

  const { addToCart } = cartContext;
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
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {originalPrice && (
            <div className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </div>
          )}
          {discountPercentage && (
            <div className="text-xs text-green-600 font-semibold">
              Tiết kiệm: {formatPrice(originalPrice! - product.price)}
            </div>
          )}
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
