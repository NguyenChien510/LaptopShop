import React, { useState, useContext } from "react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  RotateCcw,
  Cpu,
  HardDrive,
  Monitor,
  MemoryStick,
  Battery,
  Package,
} from "lucide-react";
import { CartContext } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProductDetailProps {
  product: Product;
  reviews?: any[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  reviews = [],
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [ratingInput, setRatingInput] = useState(0);
  const [newComment, setNewComment] = useState("");
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  if (!cartContext) {
    throw new Error("ProductDetail must be used within CartProvider");
  }

  const { addToCart, updateQuantity, cartItems } = cartContext;

  const images = product.images?.length ? product.images : [product.thumbnail];

  const rating =
    product.rateCount > 0
      ? (product.sumRate / product.rateCount).toFixed(1)
      : "0";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Tính giá gốc, phần trăm giảm và số tiền tiết kiệm (nếu có)
  const hasSale = !!product.sale && product.sale > 0;
  const providedOriginalPrice = (product as any)?.originalPrice as
    | number
    | undefined;
  const originalPrice =
    providedOriginalPrice ??
    (hasSale
      ? Math.round(product.price / (1 - (product.sale as number) / 100))
      : undefined);
  const discountPercentage =
    originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : hasSale
      ? (product.sale as number)
      : 0;
  const savings =
    originalPrice && originalPrice > product.price
      ? originalPrice - product.price
      : 0;

  // Hàm để lấy icon phù hợp cho từng spec
  const getSpecIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("cpu") || lowerLabel.includes("processor")) {
      return <Cpu className="h-4 w-4" />;
    }
    if (lowerLabel.includes("ram") || lowerLabel.includes("memory")) {
      return <MemoryStick className="h-4 w-4" />;
    }
    if (
      lowerLabel.includes("ổ cứng") ||
      lowerLabel.includes("hard drive") ||
      lowerLabel.includes("ssd") ||
      lowerLabel.includes("hdd")
    ) {
      return <HardDrive className="h-4 w-4" />;
    }
    if (
      lowerLabel.includes("màn hình") ||
      lowerLabel.includes("screen") ||
      lowerLabel.includes("display")
    ) {
      return <Monitor className="h-4 w-4" />;
    }
    if (lowerLabel.includes("pin") || lowerLabel.includes("battery")) {
      return <Battery className="h-4 w-4" />;
    }
    return <Package className="h-4 w-4" />;
  };

  // Hiển thị nhãn thân thiện cho từng thông số
  const getSpecLabel = (spec: { id?: string; label: string }) => {
    const key = (spec.id || spec.label).toLowerCase();
    if (key.includes("cpu") || key.includes("processor")) return "Bộ xử lý";
    if (key.includes("ram")) return "RAM";
    if (
      key.includes("ssd") ||
      key.includes("hdd") ||
      key.includes("storage") ||
      key.includes("ổ cứng") ||
      key.includes("lưu trữ")
    )
      return "Lưu trữ";
    if (
      key.includes("gpu") ||
      key.includes("vga") ||
      key.includes("graphics") ||
      key.includes("card")
    )
      return "Card đồ họa";
    if (
      key.includes("screen") ||
      key.includes("display") ||
      key.includes("màn hình")
    )
      return "Màn hình";
    return spec.label;
  };

  const syncCartWithQuantity = () => {
    const existing = cartItems.find((i) => i.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + quantity);
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
      });
      if (quantity > 1) {
        updateQuantity(product.id, quantity);
      }
    }
  };

  const handleAddToCart = () => {
    syncCartWithQuantity();
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    syncCartWithQuantity();
    navigate("/checkout");
  };

  return (
    <div className="container mx-auto px-60 py-10 space-y-12">
      {/* ================= PRODUCT INFO ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery và Features */}
        <div className="space-y-8">
          {/* Gallery */}
          <div className="space-y-4">
            <AspectRatio ratio={4 / 3}>
              <img
                src={images[selectedImage]}
                className="rounded-xl object-cover w-full h-full"
                alt={product.name}
              />
            </AspectRatio>

            <div className="grid grid-cols-4 gap-2">
              {Array.isArray(images) &&
                images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                      selectedImage === i
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <AspectRatio ratio={1}>
                      <img
                        src={img}
                        className="object-cover w-full h-full"
                        alt={`${product.name} - ảnh ${i + 1}`}
                      />
                    </AspectRatio>
                  </button>
                ))}
            </div>
          </div>

          {/* Features - Moved to left side */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="text-center bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-500 border-0 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-bold text-white">
                Miễn phí vận chuyển
              </p>
            </Card>
            <Card className="text-center bg-gradient-to-br from-green-400 to-emerald-400 dark:from-green-500 dark:to-emerald-500 border-0 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-bold text-white">Bảo hành 2 năm</p>
            </Card>
            <Card className="text-center bg-gradient-to-br from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 border-0 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-bold text-white">Đổi trả 7 ngày</p>
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(Number(rating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.rateCount} đánh giá)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
              {originalPrice && originalPrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  {discountPercentage > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 animate-pulse">
                      -{discountPercentage}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold flex items-center gap-1">
                🎉 Tiết kiệm {formatPrice(savings)}
              </p>
            )}
          </div>

          <Separator />

          {/* Short Specs với icon */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Cấu hình nổi bật</h3>
            <ul className="space-y-3">
              {product.shortSpecs.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start gap-3 text-sm p-2 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    {getSpecIcon(s.label)}
                  </div>
                  <div>
                    <strong className="font-medium">{getSpecLabel(s)}:</strong>{" "}
                    <span className="text-foreground">{s.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Quantity - Đã sửa hover kín */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Số lượng:</span>
            <div className="flex border rounded overflow-hidden hover:border-primary transition-colors">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 h-10 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                -
              </Button>
              <span className="px-4 py-2 min-w-[60px] text-center flex items-center justify-center border-x border-gray-200 dark:border-gray-700">
                {quantity}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 h-10 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                +
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Còn {product.stock} sản phẩm
            </span>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 cursor-pointer h-14 w-14"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Thêm vào giỏ
            </Button>
            <Button
              className="h-14 w-14 flex-1 bg-white text-black hover:bg-gray-100 border border-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:border-gray-400 cursor-pointer"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Mua ngay
            </Button>
          </div>

          {/* Additional Info */}
          <Card>
            <CardContent>
              <h4 className="font-semibold mb-2">Thông tin bổ sung</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Miễn phí vận chuyển toàn quốc</li>
                <li>• Bảo hành chính hãng 24 tháng</li>
                <li>• Hỗ trợ kỹ thuật 24/7</li>
                <li>• Đổi trả trong vòng 7 ngày</li>
                <li>• Thanh toán an toàn, bảo mật</li>
                <li>• Hỗ trợ trả góp 0%</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= DETAIL SPECS ================= */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">Thông số kỹ thuật chi tiết</h2>
          {product.detailSpecs.map((d) => (
            <div
              key={d.id}
              className="flex justify-between text-sm border-b pb-2 hover:bg-muted/30 px-2 rounded transition-colors"
            >
              <span className="font-medium">{d.label}</span>
              <span className="text-foreground">{d.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= REVIEWS ================= */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Đánh giá từ khách hàng</h2>
            <Badge variant="secondary" className="text-sm">
              {reviews.length} đánh giá
            </Badge>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Chưa có đánh giá nào cho sản phẩm này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {review.User?.image ? (
                        <img
                          src={review.User.image}
                          alt={review.User.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {review.User?.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {review.User?.name || "Người dùng"}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Đã xoá phần đánh giá; đánh giá chuyển sang trang lịch sử đơn */}
    </div>
  );
};

export default ProductDetail;
