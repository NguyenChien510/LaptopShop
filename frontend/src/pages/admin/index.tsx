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
import { Switch } from "@/components/ui/switch";
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
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
};

// Mock data for charts
const revenueData = [
  { month: "T1", revenue: 45000000, orders: 120 },
  { month: "T2", revenue: 52000000, orders: 145 },
  { month: "T3", revenue: 48000000, orders: 132 },
  { month: "T4", revenue: 61000000, orders: 167 },
  { month: "T5", revenue: 55000000, orders: 151 },
  { month: "T6", revenue: 67000000, orders: 189 },
  { month: "T7", revenue: 72000000, orders: 203 },
  { month: "T8", revenue: 69000000, orders: 194 },
  { month: "T9", revenue: 78000000, orders: 221 },
  { month: "T10", revenue: 85000000, orders: 245 },
  { month: "T11", revenue: 92000000, orders: 267 },
  { month: "T12", revenue: 105000000, orders: 312 },
];

const categoryData = [
  { name: "Laptop", value: 45, color: "#f43f5e" }, // Rose-500
  { name: "Desktop", value: 30, color: "#8b5cf6" }, // Violet-500
  { name: "Gaming", value: 25, color: "#0ea5e9" }, // Sky-500
];

const topProducts = [
  { name: "Gaming Laptop ROG Strix G15", sales: 156, revenue: 405440000 },
  { name: "PC Gaming RGB Warrior", sales: 98, revenue: 318500000 },
  { name: "MacBook Pro 14 M3", sales: 87, revenue: 408900000 },
  { name: "Dell XPS 15", sales: 76, revenue: 266000000 },
  { name: "Laptop Workstation", sales: 54, revenue: 242900000 },
];

interface Coupon {
  id: number;
  code: string;
  discount: number;
  expiresAt: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Order {
  id: number;
  userId: number;
  recipientName: string;
  phone: string;
  city?: string;
  district?: string;
  street?: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  OrderItems?: any[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productList, setProductList] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchOrder, setSearchOrder] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchCoupon, setSearchCoupon] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Statistics data
  const [statsData, setStatsData] = useState<any>({
    overview: {
      totalRevenue: 0,
      totalSold: 0,
      totalProducts: 0,
      totalOrders: 0,
    },
    revenueByMonth: revenueData,
    topProducts: topProducts,
    usageDistribution: [],
  });

  // Product dialog state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    thumbnail: "",
  });

  // Coupon dialog state
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [editingCoupon] = useState<Coupon | null>(null);
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
    fetchOrders();
    fetchStatistics();
  }, []);

  // Refetch when page gains focus (user returns from edit page)
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
      fetchStatistics();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get(`/statistics/dashboard`);
      if (response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      // Sử dụng dữ liệu mock nếu API lỗi
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/products`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setProductList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProductList(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await api.get(`/coupons`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setCoupons(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy mã giảm giá:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get(`/admin/orders`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    } finally {
      setLoadingOrders(false);
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

  // Filter orders
  const filteredOrders = orders.filter(
    (o) =>
      o.recipientName?.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.id?.toString().includes(searchOrder)
  );

  // Stats - sử dụng dữ liệu từ API hoặc tính từ productList
  const totalProducts = statsData.overview.totalProducts || productList.length;
  const totalRevenue =
    statsData.overview.totalRevenue ||
    productList.reduce((sum, p) => sum + p.price * (p.sold || 0), 0);
  const totalSold =
    statsData.overview.totalSold ||
    productList.reduce((sum, p) => sum + (p.sold || 0), 0);
  const totalOrders = statsData.overview.totalOrders || 0;

  // % thay đổi so với tháng trước
  const revenueChange = statsData.overview.revenueChange || 0;
  const ordersChange = statsData.overview.ordersChange || 0;
  const soldChange = statsData.overview.soldChange || 0;

  // Dữ liệu cho biểu đồ
  const chartRevenueData = statsData.revenueByMonth || revenueData;
  const chartTopProducts =
    statsData.topProducts.length > 0 ? statsData.topProducts : topProducts;
  const usageData =
    statsData.usageDistribution.length > 0
      ? statsData.usageDistribution
      : categoryData;

  // Thêm màu cho usageData
  const colors = [
    "#f43f5e", // Rose-500
    "#8b5cf6", // Violet-500
    "#0ea5e9", // Sky-500
    "#10b981", // Emerald-500
    "#f59e0b", // Amber-500
  ];
  const usageDataWithColors = usageData.map((item: any, index: number) => ({
    ...item,
    color: colors[index % colors.length],
  }));

  // Product CRUD

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
        await api.post(`/addproduct`, payload);
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

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      // Toggle status: "0" (active) -> "1" (inactive), or vice versa
      const newStatus = coupon.status === "0" ? "1" : "0";
      const response = await api.put(`/coupons/${coupon.id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        // Update local state
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, status: newStatus } : c
          )
        );
        toast.success(
          newStatus === "0"
            ? "Mã giảm giá đã được bật"
            : "Mã giảm giá đã bị tắt"
        );
      }
    } catch (error: any) {
      console.error("Lỗi thay đổi trạng thái:", error);
      toast.error("Không thể thay đổi trạng thái mã giảm giá");
    }
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
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
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
          <TabsList className="flex w-full overflow-x-auto pb-px border-b border-border bg-transparent h-auto p-0 rounded-none mb-8 gap-6 no-scrollbar">
            <TabsTrigger
              value="dashboard"
              className="relative flex items-center gap-2 px-1 py-4 !bg-transparent !shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              Thống kê
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="relative flex items-center gap-2 px-1 py-4 !bg-transparent !shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary font-medium"
            >
              <Package className="h-4 w-4" />
              Sản phẩm
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className="relative flex items-center gap-2 px-1 py-4 !bg-transparent !shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary font-medium"
            >
              <Ticket className="h-4 w-4" />
              Mã giảm giá
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="relative flex items-center gap-2 px-1 py-4 !bg-transparent !shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-none border-b-2 border-transparent data-[state=active]:border-primary font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              Đơn hàng
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng doanh thu
                  </CardTitle>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {formatPrice(totalRevenue)}
                  </div>
                  {revenueChange !== 0 && (
                    <p className="text-xs flex items-center mt-2 font-medium">
                      {revenueChange > 0 ? (
                        <span className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md mr-2">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          +{revenueChange}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md mr-2">
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          {revenueChange}%
                        </span>
                      )}
                      <span className="text-muted-foreground">so với tháng trước</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng đơn hàng
                  </CardTitle>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {totalOrders.toLocaleString()}
                  </div>
                  {ordersChange !== 0 && (
                    <p className="text-xs flex items-center mt-2 font-medium">
                      {ordersChange > 0 ? (
                        <span className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md mr-2">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          +{ordersChange}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md mr-2">
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          {ordersChange}%
                        </span>
                      )}
                      <span className="text-muted-foreground">so với tháng trước</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Đã bán
                  </CardTitle>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {totalSold.toLocaleString()}
                  </div>
                  {soldChange !== 0 && (
                    <p className="text-xs flex items-center mt-2 font-medium">
                      {soldChange > 0 ? (
                        <span className="flex items-center text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md mr-2">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          +{soldChange}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md mr-2">
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          {soldChange}%
                        </span>
                      )}
                      <span className="text-muted-foreground">so với tháng trước</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sản phẩm
                  </CardTitle>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Package className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {totalProducts}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Trong kho
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
                  <CardDescription>Biểu đồ doanh thu năm 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartRevenueData}>
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1" // indigo-500
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(0)}M`
                          }
                          className="text-xs"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-popover border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium">
                                    {payload[0].payload.month}
                                  </p>
                                  <p className="text-sm text-primary">
                                    {formatPrice(payload[0].value as number)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phân bố theo mục đích sử dụng</CardTitle>
                  <CardDescription>
                    Tỷ lệ sản phẩm theo nhu cầu sử dụng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={usageDataWithColors}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {usageDataWithColors.map(
                            (entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover border rounded-lg p-2 shadow-lg">
                                  <p className="text-sm font-medium">
                                    {payload[0].name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {data.value}% (
                                    {data.count || payload[0].value} sản phẩm)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {usageDataWithColors.map((item: any) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top sản phẩm bán chạy</CardTitle>
                <CardDescription>
                  5 sản phẩm có doanh số cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartTopProducts} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => `${value}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={200}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-sm">
                                  {payload[0].payload.name}
                                </p>
                                <p className="text-sm">
                                  Số lượng: {payload[0].payload.sales}
                                </p>
                                <p className="text-sm text-primary">
                                  {formatPrice(payload[0].payload.revenue)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="sales"
                        fill="#f43f5e"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
              <Link to="/addproduct">
                <Button className="gap-2 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Thêm sản phẩm
                </Button>
              </Link>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[80px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Ảnh</TableHead>
                      <TableHead className="h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Tên sản phẩm</TableHead>
                      <TableHead className="text-right h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Giá</TableHead>
                      <TableHead className="text-right w-[100px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Kho</TableHead>
                      <TableHead className="text-right w-[100px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Đã bán</TableHead>
                      <TableHead className="text-center w-[120px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Đánh giá</TableHead>
                      <TableHead className="w-[80px] text-right h-11 pr-4"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="p-3">
                          <div className="w-12 h-12 rounded-md border bg-muted/20 flex items-center justify-center overflow-hidden">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="line-clamp-2 leading-relaxed">
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.stock}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.sold}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-full w-fit mx-auto border border-yellow-100 dark:border-yellow-900/20">
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-500">
                              {product.rateCount > 0
                                ? (product.sumRate / product.rateCount).toFixed(1)
                                : "0.0"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                              >
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
                                onClick={() =>
                                  navigate(`/editproduct/${product.id}`)
                                }
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
              <Link to="/addcoupon">
                <Button className="gap-2 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Tạo mã giảm giá
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className="relative overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md hover:border-border">
                  <div className={`absolute top-0 left-0 w-1 h-full ${coupon.status === "0" ? "bg-green-500" : "bg-muted-foreground"}`} />
                  <CardHeader className="pb-3 pt-5 pl-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-3">
                        <Badge
                          variant="outline"
                          className={
                            coupon.status === "0"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : "text-muted-foreground"
                          }
                        >
                          {coupon.status === "0" ? "Đang hoạt động" : "Đã vô hiệu"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-bold tracking-wider text-primary">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => copyCouponCode(coupon.code)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </Button>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="-mt-1 -mr-1 h-8 w-8 cursor-pointer text-muted-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleCouponStatus(coupon)}
                            className="gap-2 cursor-pointer"
                          >
                            <Switch checked={coupon.status === "0"} className="scale-75 origin-left" />
                            {coupon.status === "0" ? "Vô hiệu hóa" : "Kích hoạt"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/editcoupon/${coupon.id}`)}
                            className="gap-2 cursor-pointer"
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
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pl-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.42-4.42a2 2 0 0 1 2.83 0L22 15.28a2 2 0 0 1 0 2.83l-4 4a2 2 0 0 1-2.83 0L2.46 9.4A2 2 0 0 1 2 8V7Z"/><path d="M7.5 7.5h.01"/></svg>
                        Phần trăm giảm:
                      </span>
                      <span className="font-semibold text-foreground">
                        {coupon.discount}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Hạn sử dụng:
                      </span>
                      <span className="font-medium text-foreground">
                        {new Date(coupon.expiresAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quản lý Đơn Hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-3" />
                  <Input
                    placeholder="Tìm theo tên khách hàng hoặc ID đơn hàng..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có đơn hàng nào
                  </div>
                ) : (
                  <div className="border border-border/50 rounded-lg overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[100px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Mã ĐH</TableHead>
                          <TableHead className="h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Khách Hàng</TableHead>
                          <TableHead className="w-[140px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">SĐT</TableHead>
                          <TableHead className="w-[140px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Tổng Tiền</TableHead>
                          <TableHead className="w-[160px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Trạng Thái</TableHead>
                          <TableHead className="w-[140px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Phương Thức</TableHead>
                          <TableHead className="w-[120px] h-11 text-xs uppercase text-muted-foreground tracking-wider font-semibold">Ngày Đặt</TableHead>
                          <TableHead className="w-[80px] text-right h-11 pr-4"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="group">
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              #{order.id.toString().padStart(6, '0')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {order.recipientName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {order.phone}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {formatPrice(order.total)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  order.status === "Thanh toán thành công"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                    : order.status === "Thanh toán thất bại"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                }
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                {order.paymentMethod === "COD" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                                )}
                                <span className="text-sm">{order.paymentMethod}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
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
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button onClick={handleSaveProduct} className="cursor-pointer">
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
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button onClick={handleSaveCoupon} className="cursor-pointer">
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
              className="cursor-pointer"
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
              className="cursor-pointer"
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
