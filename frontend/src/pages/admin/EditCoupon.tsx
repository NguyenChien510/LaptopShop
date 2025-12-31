import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EditCoupon = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    expiresAt: "",
  });

  // Load coupon data on mount
  useEffect(() => {
    if (id) {
      fetchCoupon(id);
    }
  }, [id]);

  const fetchCoupon = async (couponId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/coupons/${couponId}`);
      if (response.data.success) {
        const coupon = response.data.data;
        setFormData({
          code: coupon.code,
          discount: coupon.discount.toString(),
          expiresAt: coupon.expiresAt.split("T")[0], // Format date for input
        });
      } else {
        toast.error("Không tìm thấy mã giảm giá");
        navigate("/admin");
      }
    } catch (error: any) {
      console.error("Error fetching coupon:", error);
      toast.error("Không thể tải thông tin mã giảm giá");
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.code.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (!formData.discount) {
      toast.error("Vui lòng nhập phần trăm giảm");
      return;
    }

    const discount = parseFloat(formData.discount);
    if (discount < 0 || discount > 100) {
      toast.error("Phần trăm giảm phải từ 0 đến 100");
      return;
    }

    if (!formData.expiresAt) {
      toast.error("Vui lòng chọn ngày hết hạn");
      return;
    }

    // Check if expiry date is in the future
    if (new Date(formData.expiresAt) <= new Date()) {
      toast.error("Ngày hết hạn phải lớn hơn ngày hiện tại");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`/coupons/${id}`, {
        code: formData.code.toUpperCase(),
        discount: discount,
        expiresAt: formData.expiresAt,
      });

      if (res.data.success) {
        toast.success("Cập nhật mã giảm giá thành công!");
        // Navigate back to admin after 1 second
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error updating coupon:", err);
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật mã giảm giá"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            Chỉnh Sửa Mã Giảm Giá
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Mã Giảm Giá</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="font-medium">
                  Mã Giảm Giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="VD: SUMMER10, WINTER20"
                  value={formData.code}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Mã sẽ tự động chuyển thành chữ hoa
                </p>
              </div>

              <Separator />

              {/* Discount */}
              <div className="space-y-2">
                <Label htmlFor="discount" className="font-medium">
                  Phần Trăm Giảm Giá (%) <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    placeholder="VD: 10, 25, 50"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discount}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="text-base"
                  />
                  <span className="text-lg font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Giá trị từ 0 đến 100
                </p>
              </div>

              <Separator />

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiresAt" className="font-medium">
                  Ngày Hết Hạn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Chọn ngày và giờ khi mã này không còn sử dụng được
                </p>
              </div>

              <Separator />

              {/* Preview */}
              {formData.code && formData.discount && formData.expiresAt && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-medium text-sm mb-2 text-primary">
                    Xem Trước:
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Mã:</span>{" "}
                      <span className="font-semibold">
                        {formData.code.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Giảm:</span>{" "}
                      <span className="font-semibold text-green-600">
                        {formData.discount}%
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Hết hạn:</span>{" "}
                      <span className="font-semibold">
                        {new Date(formData.expiresAt).toLocaleString("vi-VN")}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cập Nhật Mã Giảm Giá
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  disabled={loading}
                  className="flex-1 h-10 cursor-pointer"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCoupon;
