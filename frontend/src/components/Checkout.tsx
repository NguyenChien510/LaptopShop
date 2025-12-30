import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  FileText,
  CheckCircle,
  CreditCard,
  Truck,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { CartContext } from "@/context/CartContext";

const cities = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
];

const districts: Record<string, string[]> = {
  "Hà Nội": [
    "Ba Đình",
    "Hoàn Kiếm",
    "Hai Bà Trưng",
    "Đống Đa",
    "Cầu Giấy",
    "Thanh Xuân",
    "Hoàng Mai",
  ],
  "TP. Hồ Chí Minh": [
    "Quận 1",
    "Quận 3",
    "Quận 5",
    "Quận 7",
    "Quận 10",
    "Bình Thạnh",
    "Phú Nhuận",
  ],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"],
  "Hải Phòng": ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn"],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát"],
  "Đồng Nai": ["Biên Hòa", "Long Khánh", "Long Thành", "Nhơn Trạch"],
};

const Checkout = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("Checkout must be used within CartProvider");
  }

  const { totalPrice, clearCart, cartItems, discount, addToCart } = cartContext;

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    street: "",
  });

  // Handle repurchase items from localStorage
  useEffect(() => {
    const repurchaseItems = localStorage.getItem("repurchaseItems");
    if (repurchaseItems) {
      try {
        const items = JSON.parse(repurchaseItems);
        items.forEach((item: any) => {
          if (addToCart) {
            addToCart({
              id: item.id,
              name: item.name,
              price: item.price,
              thumbnail: item.thumbnail,
              quantity: item.quantity || 1,
            });
          }
        });
        // Clear localStorage after adding
        localStorage.removeItem("repurchaseItems");
      } catch (err) {
        console.error("Error parsing repurchaseItems:", err);
      }
    }
  }, [addToCart]);

  // Prefill from user profile stored in DB
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/profile", {
          credentials: "include",
        });
        if (!res.ok) return; // silently ignore if not logged in
        const user = await res.json();
        setFormData((prev) => ({
          ...prev,
          name: user.name ?? prev.name,
          phone: user.phone ?? prev.phone,
          city: user.city ?? prev.city,
          district: user.district ?? prev.district,
          street: user.street ?? prev.street,
        }));
      } catch (err) {
        // No toast to avoid noise on checkout load
        console.error("Fetch profile error", err);
      }
    })();
  }, []);

  // Calculate subtotal before discount
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const steps = [
    {
      icon: ShoppingCart,
      label: "Chọn sản phẩm",
      active: false,
      completed: true,
    },
    { icon: FileText, label: "Thông tin đặt hàng", active: true },
    { icon: CheckCircle, label: "Hoàn tất đặt hàng", active: false },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " ₫";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      navigate("/cart");
      return;
    }

    if (
      !formData.name ||
      !formData.phone ||
      !formData.city ||
      !formData.district ||
      !formData.street
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const payload = {
        items: cartItems.map((c) => ({
          productId: c.id,
          quantity: c.quantity,
        })),
        paymentMethod: paymentMethod === "cod" ? "COD" : "Online",
        recipientName: formData.name,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        street: formData.street,
        shippingFee: 0,
        discount: discount,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Tạo đơn hàng thất bại");
      }

      const orderId = json.data.id;

      // Nếu là thanh toán online, redirect đến VNPAY
      if (paymentMethod === "online") {
        try {
          const paymentRes = await fetch("/api/payment/create-payment-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ orderId }),
          });

          const paymentJson = await paymentRes.json();
          if (paymentJson.success) {
            // Xóa giỏ hàng và redirect đến VNPAY
            clearCart();
            window.location.href = paymentJson.data.paymentUrl;
          } else {
            throw new Error(paymentJson.message || "Lỗi tạo thanh toán");
          }
        } catch (err: any) {
          toast.error(err.message || "Lỗi tạo URL thanh toán");
        }
      } else {
        // COD - thành công ngay
        toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        clearCart();
        navigate(`/orders/${orderId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Có lỗi khi tạo đơn hàng");
    }
  };

  const availableDistricts = formData.city
    ? districts[formData.city] || []
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">
        Thông tin đặt hàng
      </h1>

      {/* Steps */}
      <div className="flex justify-center items-center gap-4 md:gap-12 mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
                step.active
                  ? "bg-primary text-primary-foreground"
                  : step.completed
                  ? "bg-green-500 text-white"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" />
              Địa chỉ nhận hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thành phố *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) =>
                    setFormData({ ...formData, city: value, district: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quận/Huyện *</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) =>
                    setFormData({ ...formData, district: value })
                  }
                  disabled={!formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quận/huyện" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Địa chỉ cụ thể (Số nhà, đường) *</Label>
              <Input
                id="street"
                placeholder="VD: 123 Nguyễn Văn A, Phường 5"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              Phương thức thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <label
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="cod" id="cod" />
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <Label htmlFor="cod" className="font-medium cursor-pointer">
                    Thanh toán khi nhận hàng (COD)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Thanh toán bằng tiền mặt khi nhận hàng
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "online"
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="online" id="online" />
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Label
                    htmlFor="online"
                    className="font-medium cursor-pointer"
                  >
                    Thanh toán Online
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Chuyển khoản ngân hàng hoặc ví điện tử
                  </p>
                </div>
              </label>
            </RadioGroup>

            {/* Removed manual bank transfer info for online payment */}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4 md:p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tổng tiền hàng:</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span className="text-muted-foreground">Giảm giá:</span>
                <span className="font-semibold">-{formatPrice(discount)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Tổng thanh toán:</span>
              <span className="text-primary font-bold text-2xl">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
            >
              Xác nhận đặt hàng
            </Button>

            <Link to="/cart">
              <Button variant="outline" className="w-full h-12 text-base">
                Quay lại giỏ hàng
              </Button>
            </Link>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Checkout;
