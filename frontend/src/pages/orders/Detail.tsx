import React, { useEffect, useState } from "react";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { useParams } from "react-router-dom";
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
            <CardHeader>
              <CardTitle>Đơn hàng #{order.id}</CardTitle>
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

              <h3 className="font-semibold mb-2">Sản phẩm</h3>
              <div className="space-y-2">
                {(order.OrderItems || []).map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.name} x{it.quantity}
                    </span>
                    <span>{formatPrice(it.price * it.quantity)}</span>
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
