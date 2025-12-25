import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddCoupon = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    expiresAt: "",
  });

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
      const res = await axios.post("/coupons/add", {
        code: formData.code.toUpperCase(),
        discount: discount,
        expiresAt: formData.expiresAt,
      });

      if (res.data.success) {
        toast.success("Tạo mã giảm giá thành công!");
        // Reset form
        setFormData({
          code: "",
          discount: "",
          expiresAt: "",
        });
        // Navigate back after 1 second
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error creating coupon:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tạo mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-primary">Tạo Mã Giảm Giá</h1>
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
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Tạo Mã Giảm Giá
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
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

export default AddCoupon;
