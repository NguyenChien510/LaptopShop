import { useEffect, useState } from "react";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Calendar,
  CreditCard,
  Eye,
  RotateCcw,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "@/types/order";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Thanh toán thành công":
      return "bg-green-500/20 text-green-700 border-green-500/30";
    case "Thanh toán thất bại":
      return "bg-red-500/20 text-red-700 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const OrdersHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [repayingId, setRepayingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders/my", { credentials: "include" });
        const json = await res.json();
        if (json.success) setOrders(json.data);
      } catch {
        toast.error("Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openReview = async (order: Order) => {
    setReviewOrderId(order.id);
    const firstItem = (order.OrderItems || [])[0];
    const productId = firstItem ? firstItem.productId : null;
    setReviewProductId(productId);
    setReviewRating(0);
    setReviewText("");

    // Check if user already reviewed this product
    if (productId) {
      try {
        const res = await fetch(`/api/reviews/check/${productId}`, {
          credentials: "include",
        });
        const json = await res.json();
        setHasReviewed(json.reviewed);
      } catch (err) {
        console.error("Error checking review:", err);
      }
    }
  };

  const submitReview = async () => {
    if (
      !reviewOrderId ||
      !reviewProductId ||
      reviewRating === 0 ||
      !reviewText.trim()
    ) {
      toast.error("Vui lòng chọn sản phẩm, đánh giá sao và nhập nội dung");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: reviewProductId,
          rating: reviewRating,
          comment: reviewText,
        }),
        credentials: "include",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Đã gửi đánh giá");
        setReviewOrderId(null);
        setHasReviewed(true);
      } else {
        toast.error(json.message || "Lỗi khi gửi đánh giá");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepay = async (order: Order) => {
    if (order.paymentMethod !== "Online") {
      toast.error("Chỉ hỗ trợ thanh toán lại cho đơn online");
      return;
    }

    setRepayingId(order.id);
    try {
      const res = await fetch("/api/payment/create-payment-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: order.id }),
      });

      const json = await res.json();
      if (json.success && json.data?.paymentUrl) {
        window.location.href = json.data.paymentUrl;
      } else {
        toast.error(json.message || "Không tạo được URL thanh toán");
      }
    } catch (err) {
      console.error("Repay error:", err);
      toast.error("Có lỗi khi thanh toán lại");
    } finally {
      setRepayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Lịch sử đơn hàng
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các đơn hàng của bạn
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Đang tải…</div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground mb-4">
              Bắt đầu mua sắm để xem lịch sử đơn hàng của bạn
            </p>
            <Button asChild>
              <Link to="/products">Mua sắm ngay</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="bg-muted/30 py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        Đơn hàng #{order.id}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                        <span className="mx-2">•</span>
                        <CreditCard className="h-4 w-4" />
                        {order.paymentMethod}
                      </div>
                    </div>
                    <Badge
                      className={`${getStatusColor(order.status)} px-3 py-1`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {(order.OrderItems || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-lg">
                      Tổng tiền:{" "}
                      <span className="font-bold text-primary">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Link>
                      </Button>
                      {order.status === "Thanh toán thành công" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReview(order)}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Đánh giá
                        </Button>
                      )}
                      {order.status === "Thanh toán thất bại" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRepay(order)}
                          disabled={repayingId === order.id}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {repayingId === order.id
                            ? "Đang chuyển VNPAY..."
                            : "Mua lại"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>

                {reviewOrderId === order.id && (
                  <div className="px-4 pb-4">
                    <Separator className="my-4" />
                    {hasReviewed ? (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg text-center">
                        <p className="text-blue-700 dark:text-blue-400 font-medium">
                          ✓ Bạn đã đánh giá sản phẩm này rồi
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="font-semibold">
                          Viết đánh giá cho sản phẩm trong đơn
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">
                              Chọn sản phẩm
                            </label>
                            <select
                              className="mt-1 w-full border rounded p-2 bg-background"
                              value={reviewProductId ?? undefined}
                              onChange={(e) =>
                                setReviewProductId(Number(e.target.value))
                              }
                            >
                              {(order.OrderItems || []).map((item) => (
                                <option key={item.id} value={item.productId}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted-foreground">
                              Đánh giá sao
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  onClick={() => setReviewRating(i + 1)}
                                  className={`h-5 w-5 cursor-pointer ${
                                    i < reviewRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-muted-foreground">
                                {reviewRating} / 5
                              </span>
                            </div>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Chia sẻ trải nghiệm của bạn..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="min-h-[100px]"
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <Button onClick={submitReview} disabled={submitting}>
                            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setReviewOrderId(null)}
                            disabled={submitting}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersHistoryPage;
