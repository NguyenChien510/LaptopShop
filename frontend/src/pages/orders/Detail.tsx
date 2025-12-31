import React, { useEffect, useState } from "react";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types/order";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setOrder(json.data);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {!order ? (
          <div className="text-center text-muted-foreground">Đang tải…</div>
        ) : (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Đơn hàng #{order.id}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="cursor-pointer"
              >
                <Link to="/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
                  <p>{order.recipientName}</p>
                  <p>{order.phone}</p>
                  <p>
                    {[order.street, order.district, order.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Thanh toán</h3>
                  <p>Phương thức: {order.paymentMethod}</p>
                  <p>Tổng: {formatPrice(order.total)}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="font-semibold mb-4">Sản phẩm</h3>
              <div className="space-y-4">
                {(order.OrderItems || []).map((it) => (
                  <div key={it.id} className="flex gap-4 p-4 border rounded-lg">
                    {/* Product Image */}
                    {it.thumbnail && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={it.thumbnail}
                          alt={it.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{it.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {it.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Giá: {formatPrice(it.price)}/cái
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(it.price * it.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
