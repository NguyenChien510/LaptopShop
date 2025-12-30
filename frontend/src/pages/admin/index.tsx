import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Package,
  Ticket,
  DollarSign,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  ChevronLeft,
  Eye,
  Star,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
};

type ProductType = Product;

interface Coupon {
  id: number;
  code: string;
  discount: number;
  expiresAt: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productList, setProductList] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchCoupon, setSearchCoupon] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Product dialog state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    thumbnail: "",
  });

  // Coupon dialog state
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
    expiresAt: "",
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "product" | "coupon";
    id: number | null;
  }>({
    open: false,
    type: "product",
    id: null,
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    fetchCoupons();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get(`/products`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setProductList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProductList(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const response = await api.get(`/coupons`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setCoupons(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy mã giảm giá:", error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Filter products
  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  // Filter coupons
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchCoupon.toLowerCase())
  );

  // Stats
  const totalProducts = productList.length;
  const totalRevenue = productList.reduce(
    (sum, p) => sum + p.price * p.sold,
    0
  );
  const totalSold = productList.reduce((sum, p) => sum + p.sold, 0);

  // Product CRUD
  const handleOpenProductDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        thumbnail: product.thumbnail,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        price: "",
        stock: "",
        thumbnail: "",
      });
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const payload = {
        name: productForm.name,
        price: parseInt(productForm.price),
        stock: parseInt(productForm.stock) || 0,
        thumbnail: productForm.thumbnail,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success("Đã cập nhật sản phẩm thành công");
      } else {
        await api.post(`/products/add`, payload);
        toast.success("Đã thêm sản phẩm mới thành công");
      }
      setIsProductDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error("Lỗi lưu sản phẩm:", error);
      toast.error(error.response?.data?.message || "Không thể lưu sản phẩm");
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteDialog.id) {
      try {
        await api.delete(`/products/${deleteDialog.id}`);
        toast.success("Đã xóa sản phẩm");
        fetchProducts();
      } catch (error: any) {
        console.error("Lỗi xóa sản phẩm:", error);
        toast.error(error.response?.data?.message || "Không thể xóa sản phẩm");
      }
    }
    setDeleteDialog({ open: false, type: "product", id: null });
  };

  // Coupon CRUD
  const handleOpenCouponDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code,
        discount: coupon.discount.toString(),
        expiresAt: coupon.expiresAt.split("T")[0],
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: "",
        discount: "",
        expiresAt: "",
      });
    }
    setIsCouponDialogOpen(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code || !couponForm.discount || !couponForm.expiresAt) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const payload = {
        code: couponForm.code.toUpperCase(),
        discount: parseInt(couponForm.discount),
        expiresAt: couponForm.expiresAt,
      };

      if (editingCoupon) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === editingCoupon.id ? { ...c, ...payload } : c
          )
        );
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await api.post(`/coupons/add`, payload);
        toast.success("Đã tạo mã giảm giá mới");
        fetchCoupons();
      }
      setIsCouponDialogOpen(false);
    } catch (error: any) {
      console.error("Lỗi lưu mã giảm giá:", error);
      toast.error(error.response?.data?.message || "Không thể lưu mã giảm giá");
    }
  };

  const handleDeleteCoupon = () => {
    if (deleteDialog.id) {
      setCoupons((prev) => prev.filter((c) => c.id !== deleteDialog.id));
      toast.success("Đã xóa mã giảm giá");
    }
    setDeleteDialog({ open: false, type: "coupon", id: null });
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã copy mã giảm giá");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-600 border-green-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-lg grid-cols-3 p-1 bg-muted/50">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="h-4 w-4" />
              Sản phẩm
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Ticket className="h-4 w-4" />
              Mã giảm giá
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng doanh thu
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Đã bán
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalSold.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sản phẩm
                  </CardTitle>
                  <Package className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleOpenProductDialog()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Ảnh</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-right">Tồn kho</TableHead>
                      <TableHead className="text-right">Đã bán</TableHead>
                      <TableHead className="text-center">Đánh giá</TableHead>
                      <TableHead className="w-[100px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium line-clamp-1">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.stock}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.sold}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {product.rateCount > 0
                                ? (product.sumRate / product.rateCount).toFixed(
                                    1
                                  )
                                : "0"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({product.rateCount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/products/${product.id}`}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Xem chi tiết
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenProductDialog(product)}
                                className="gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "product",
                                    id: product.id,
                                  })
                                }
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm mã giảm giá..."
                  value={searchCoupon}
                  onChange={(e) => setSearchCoupon(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleOpenCouponDialog()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Tạo mã giảm giá
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          coupon.status === "0" ? "default" : "secondary"
                        }
                        className={
                          coupon.status === "0"
                            ? "bg-green-500/10 text-green-600 border-0"
                            : ""
                        }
                      >
                        {coupon.status === "0" ? "Hoạt động" : "Hết hạn"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenCouponDialog(coupon)}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: "coupon",
                                id: coupon.id,
                              })
                            }
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xl font-bold bg-muted px-3 py-1 rounded-lg">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyCouponCode(coupon.code)}
                      >
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá:</span>
                      <span className="font-semibold text-primary">
                        {coupon.discount}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Hết hạn:</span>
                      <span>
                        {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Cập nhật thông tin sản phẩm"
                : "Điền thông tin để tạo sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Giá bán *</Label>
              <Input
                id="price"
                type="number"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Tồn kho</Label>
              <Input
                id="stock"
                type="number"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">URL ảnh</Label>
              <Input
                id="thumbnail"
                value={productForm.thumbnail}
                onChange={(e) =>
                  setProductForm({ ...productForm, thumbnail: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? "Cập nhật" : "Thêm sản phẩm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Cập nhật thông tin mã giảm giá"
                : "Điền thông tin để tạo mã giảm giá mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <Input
                id="code"
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="VD: SALE20"
                className="uppercase"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Giảm giá (%) *</Label>
              <Input
                id="discount"
                type="number"
                value={couponForm.discount}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, discount: e.target.value })
                }
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Ngày hết hạn *</Label>
              <Input
                id="expiresAt"
                type="date"
                value={couponForm.expiresAt}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, expiresAt: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCouponDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveCoupon}>
              {editingCoupon ? "Cập nhật" : "Tạo mã"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              {deleteDialog.type === "product" ? "sản phẩm" : "mã giảm giá"}{" "}
              này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, type: "product", id: null })
              }
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={
                deleteDialog.type === "product"
                  ? handleDeleteProduct
                  : handleDeleteCoupon
              }
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
