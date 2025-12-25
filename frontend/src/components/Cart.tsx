import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  FileText,
  CheckCircle,
  Trash2,
  Plus,
  Minus,
  Tag,
} from "lucide-react";
import { CartContext } from "@/context/CartContext";
import { UserContext } from "@/context/UserContext";
import { toast } from "sonner";
import axios from "@/lib/axios";

const Cart = () => {
  const cartContext = useContext(CartContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  if (!cartContext) {
    throw new Error("Cart must be used within CartProvider");
  }

  const { cartItems, updateQuantity, removeFromCart, discount, setDiscount } =
    cartContext;
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " ₫";

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const total = subtotal - discount;

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const res = await axios.post("/coupons/validate", {
        code: discountCode,
      });

      if (res.data.success) {
        const discountAmount = (subtotal * res.data.discount) / 100;
        setDiscount(discountAmount);
        setDiscountPercent(res.data.discount);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      setDiscount(0);
      setDiscountPercent(0);
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const steps = [
    { icon: ShoppingCart, label: "Chọn sản phẩm", active: true },
    { icon: FileText, label: "Thông tin đặt hàng", active: false },
    { icon: CheckCircle, label: "Hoàn tất đặt hàng", active: false },
  ];

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.info("Đăng nhập để bạn có thể quản lí đơn hàng nhé");
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">
        Giỏ hàng của bạn
      </h1>

      {/* Steps */}
      <div className="flex justify-center items-center gap-4 md:gap-12 mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
                step.active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <step.icon className="w-6 h-6" />
            </div>
            <span
              className={`text-xs md:text-sm text-center ${
                step.active
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Cart Items */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                Giỏ hàng trống
              </p>
              <Link to="/products">
                <Button>Tiếp tục mua sắm</Button>
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id}>
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-medium text-sm md:text-base line-clamp-2">
                        {item.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 cursor-pointer"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-primary font-medium mt-1">
                      Giá: {formatPrice(item.price)}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        SL:
                      </span>
                      <div className="flex items-center bg-muted rounded-md border border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-7 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-primary font-bold mt-2">
                      Tổng: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {cartItems.length > 0 && (
        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="text-primary font-bold text-lg">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Discount Code */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="pl-10"
                  disabled={isApplyingDiscount}
                />
              </div>
              <Button
                onClick={applyDiscount}
                className="px-6 font-medium transition-all hover:shadow-md cursor-pointer"
                disabled={isApplyingDiscount}
              >
                {isApplyingDiscount ? "Đang kiểm tra..." : "Áp dụng"}
              </Button>
            </div>

            {discount > 0 && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Giảm giá ({discountPercent}%):
                  </span>
                  <span className="text-green-600 font-medium">
                    -{formatPrice(discount)}
                  </span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Tổng thanh toán:</span>
              <span className="text-primary font-bold text-xl">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex gap-3 mt-3">
              <Button
                onClick={handleProceedToCheckout}
                className="w-1/2 h-11 text-base font-semibold rounded-lg transition-all hover:shadow-lg border-2 border-primary cursor-pointer"
              >
                Tiến hành đặt hàng
              </Button>

              <Link to="/products" className="w-1/2">
                <Button
                  variant="outline"
                  className="w-full h-11 text-base font-medium rounded-lg transition-all hover:bg-muted/50 border-2 cursor-pointer"
                >
                  Chọn thêm sản phẩm
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Cart;
