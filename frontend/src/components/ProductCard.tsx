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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
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

  return (
    <Card className="group relative overflow-hidden border-0 transition-all duration-500 bg-gradient-card cursor-pointer h-full flex flex-col">
      {/* Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full object-cover transition-all duration-400 group-hover:scale-110"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badge sale */}
        <div className="absolute top-4 left-4 flex flex-col">
          {discountPercentage && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-500 text-white border-0 shadow-lg font-bold text-sm px-3 py-1 rounded-md">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-1 flex flex-col flex-grow">
        {/* Title + Rating */}
        <div>
          <h3 className="font-bold text-xl line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 transition-all ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400 scale-110"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              ({product.rateCount} đánh giá)
            </span>
          </div>
        </div>

        {/* Specs */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-1">
          <div className="text-sm font-semibold text-foreground mb-1">
            Cấu hình nổi bật:
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Cpu className="h-4 w-4 text-primary" />
              {getSpec("cpu")}
            </div>
            <div className="flex items-center gap-1">
              <MemoryStick className="h-4 w-4 text-blue-500" />
              {getSpec("ram")}
            </div>
            <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
              <HardDrive className="h-4 w-4 text-purple-500" />
              {getSpec("ssd")}
            </div>
            {getSpec("vga") && (
              <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <Monitor className="h-4 w-4 text-green-500" />
                {getSpec("vga")}
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </div>
            )}
          </div>
          {discountPercentage && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Tiết kiệm</div>
              <div className="text-sm font-bold text-green-600">
                {formatPrice(originalPrice! - product.price)}
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <Button className="w-full h-12 mt-auto bg-gradient-primary text-white hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-bold cursor-pointer">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Thêm vào giỏ hàng
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
