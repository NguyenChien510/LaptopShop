import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleRetryPayment = async () => {
    if (!orderId) {
      toast.error("Không tìm thấy mã đơn hàng để thanh toán lại");
      return;
    }

    const orderIdNumber = Number(orderId);
    if (Number.isNaN(orderIdNumber)) {
      toast.error("Mã đơn hàng không hợp lệ");
      return;
    }

    try {
      const res = await fetch("/api/payment/create-payment-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: orderIdNumber }),
      });

      const json = await res.json();
      if (json.success && json.data?.paymentUrl) {
        window.location.href = json.data.paymentUrl;
      } else {
        toast.error(json.message || "Không tạo được URL thanh toán");
      }
    } catch (err) {
      console.error("Retry payment error:", err);
      toast.error("Có lỗi khi tạo thanh toán lại");
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Gọi backend API callback để verify
        const response = await fetch(
          `/api/payment/callback?${searchParams.toString()}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setOrderId(data.data?.orderId);
        } else {
          setStatus("failed");
          setOrderId(data.data?.orderId);
        }
      } catch (err) {
        console.error("Payment callback error:", err);
        setStatus("failed");
      }
    };

    handleCallback();
  }, [searchParams]);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Đang xử lý thanh toán..."}
            {status === "success" && "Thanh toán thành công!"}
            {status === "failed" && "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-gray-600">
                Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ xử lý và
                giao hàng cho bạn sớm nhất.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={handleViewOrder}
                  className="w-full cursor-pointer"
                  variant="default"
                >
                  Xem chi tiết đơn hàng
                </Button>
                <Button
                  onClick={handleReturnHome}
                  className="w-full cursor-pointer"
                  variant="outline"
                >
                  Quay lại trang chủ
                </Button>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <p className="text-gray-600">
                Thanh toán không thành công. Vui lòng kiểm tra lại thông tin
                hoặc liên hệ hỗ trợ.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={handleRetryPayment}
                  className="w-full cursor-pointer"
                  variant="default"
                  disabled={!orderId}
                >
                  Thanh toán lại qua VNPAY
                </Button>
                <Button
                  onClick={handleReturnHome}
                  className="w-full cursor-pointer"
                  variant="outline"
                >
                  Quay lại trang chủ
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
