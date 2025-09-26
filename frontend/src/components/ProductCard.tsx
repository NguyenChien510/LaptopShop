import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ShoppingCart,
  Zap,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
} from "lucide-react";
import type { Product } from "@/types/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  return (
    <Card className="group relative overflow-hidden border-0 transition-all duration-500 bg-gradient-card cursor-pointer h-full flex flex-col">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      {/* Image sát top */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full object-cover transition-all duration-400 group-hover:scale-110"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Mới
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
              🔥 Bán chạy
            </Badge>
          )}
          {discountPercentage && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg font-bold">
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
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400 scale-110"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              ({product.reviews} đánh giá)
            </span>
          </div>
        </div>

        {/* Specs Section */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-1">
          <div className="text-sm font-semibold text-foreground mb-1">
            Cấu hình nổi bật:
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            {/* CPU */}
            <div className="flex items-center gap-1">
              <Cpu className="h-4 w-4 text-primary" />
              {product.specs.processor}
            </div>
            {/* RAM */}
            <div className="flex items-center gap-1">
              <MemoryStick className="h-4 w-4 text-blue-500" />
              {product.specs.ram}
            </div>
            {/* Storage */}
            <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
              <HardDrive className="h-4 w-4 text-purple-500" />
              {product.specs.storage}
            </div>
            {/* VGA */}
            {product.specs.graphics && (
              <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <Monitor className="h-4 w-4 text-green-500" />
                {product.specs.graphics}
              </div>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>
          {discountPercentage && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Tiết kiệm</div>
              <div className="text-sm font-bold text-green-600">
                {formatPrice(product.originalPrice! - product.price)}
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button className="w-full h-12 mt-auto bg-gradient-primary text-white hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-bold cursor-pointer">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Thêm vào giỏ hàng
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
