import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { ComparisonContext } from "@/context/ComparisonContext";
import { CartContext } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  X,
  Scale,
  Trash2,
  Star,
  Check,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetailSpec, Product } from "@/types/product";
import axios from "@/lib/axios";
import { toast } from "sonner";

const ComparisonPage = () => {
  const navigate = useNavigate();
  const comparisonContext = useContext(ComparisonContext);
  const cartContext = useContext(CartContext);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const maxCompare = 4;

  if (!comparisonContext) {
    return (
      <div>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p>Error: Comparison context not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { compareProducts, addToCompare, removeFromCompare, clearComparison } =
    comparisonContext;

  const { addToCart } = cartContext || {};

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products");
        setAllProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddProduct = (productId: string) => {
    const id = Number(productId);
    const product = allProducts.find((p) => p.id === id);
    if (product && compareProducts.length < maxCompare) {
      addToCompare(product);
      toast.success("Đã thêm sản phẩm vào so sánh!");
    }
  };

  const handleRemoveProduct = (productId: number) => {
    removeFromCompare(productId);
    toast.info("Đã xóa sản phẩm khỏi so sánh");
  };

  const handleClearAll = () => {
    clearComparison();
    toast.info("Đã xóa tất cả sản phẩm");
  };

  const handleAddToCart = (product: Product) => {
    if (addToCart) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
      });
      toast.success("Đã thêm vào giỏ hàng!");
    }
  };

  const availableProducts = allProducts.filter(
    (p) => !compareProducts.some((cp) => cp.id === p.id)
  );
  const filteredProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAllSpecCategories = () => {
    const categories = new Set<string>();
    compareProducts.forEach((product) => {
      const specs: DetailSpec[] = Array.isArray(product.detailSpecs)
        ? product.detailSpecs
        : JSON.parse(product.detailSpecs || "[]");
      specs.forEach((spec) => {
        categories.add(spec.category);
      });
    });
    return Array.from(categories).sort();
  };

  const getSpecsByCategory = (productId: number, category: string) => {
    const product = compareProducts.find((p) => p.id === productId);
    if (!product) return [];

    const specs: DetailSpec[] = Array.isArray(product.detailSpecs)
      ? product.detailSpecs
      : JSON.parse(product.detailSpecs || "[]");

    return specs
      .filter((spec) => spec.category === category)
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const categories = getAllSpecCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full mb-4">
            <Scale className="w-5 h-5" />
            <span className="font-medium">So sánh sản phẩm</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            So sánh các sản phẩm
          </h1>
          <p className="text-lg max-w-2xl mx-auto font-bold">
            Chọn tối đa {maxCompare} sản phẩm để so sánh chi tiết các thông số
            kỹ thuật
          </p>
        </div>

        {/* Product Selection */}
        <Card className="mb-8 border-dashed border-2 border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px] space-y-3">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm để thêm vào so sánh"
                  className="bg-slate-800 border-slate-700"
                />
                {searchTerm.trim().length > 0 && (
                  <div className="bg-white border border-gray-300 rounded-lg max-h-56 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="text-sm text-gray-600 px-3 py-2">
                        Không tìm thấy sản phẩm
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProduct(String(product.id))}
                          className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                          disabled={compareProducts.length >= maxCompare}
                        >
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-sm text-black line-clamp-1">
                            {product.name}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {compareProducts.length}/{maxCompare} sản phẩm
                </Badge>
                {compareProducts.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Content */}
        {compareProducts.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Scale className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-slate-400 text-center max-w-md mb-4 font-bold">
                Hãy chọn ít nhất 2 sản phẩm từ danh sách bên trên để bắt đầu so
                sánh
              </p>
              <Button onClick={() => navigate("/products")} variant="default">
                Xem danh sách sản phẩm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Fixed 4 slots row */}
              <div
                className="grid gap-6 mb-8"
                style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
              >
                {Array.from({ length: maxCompare }).map((_, idx) => {
                  const product = compareProducts[idx];
                  return product ? (
                    <Card
                      key={product.id}
                      className="relative group overflow-hidden bg-white border-0 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-center line-clamp-2 mb-3 text-sm min-h-[2.5rem] flex-grow">
                          {product.name}
                        </h3>
                        <p className="text-xl font-bold text-blue-600 text-center mb-4">
                          {formatPrice(product.price)}
                        </p>
                        <Button
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Thêm vào giỏ hàng
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      key={`placeholder-${idx}`}
                      className="border-2 border-dashed border-gray-300 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="flex flex-col items-center justify-center h-full min-h-[380px] gap-4 text-gray-400">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                          Thêm sản phẩm
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Specs Comparison Table */}
              {compareProducts.length >= 2 && (
                <Card className="bg-white border-gray-300 p-0">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left p-4 font-semibold text-black border-b border-gray-300">
                              Thông số kỹ thuật
                            </th>
                            {compareProducts.map((product) => (
                              <th
                                key={product.id}
                                className="text-center p-4 font-semibold text-black border-b border-l border-gray-300"
                              >
                                <span className="line-clamp-1">
                                  {product.name
                                    .split(" ")
                                    .slice(0, 3)
                                    .join(" ")}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Image Row */}
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-black border-b border-gray-300">
                              Hình ảnh
                            </td>
                            {compareProducts.map((product) => (
                              <td
                                key={`img-${product.id}`}
                                className="text-center p-4 border-b border-l border-gray-300"
                              >
                                <div className="w-28 h-28 mx-auto rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={product.thumbnail}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>

                          {/* Name Row */}
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-black border-b border-gray-300">
                              Tên sản phẩm
                            </td>
                            {compareProducts.map((product) => (
                              <td
                                key={`name-${product.id}`}
                                className="text-center p-4 border-b border-l border-gray-300"
                              >
                                <span className="font-semibold text-black line-clamp-2 inline-block max-w-[180px]">
                                  {product.name}
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Price Row */}
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-black border-b border-gray-300">
                              Giá bán
                            </td>
                            {compareProducts.map((product) => (
                              <td
                                key={product.id}
                                className="text-center p-4 border-b border-l border-gray-300"
                              >
                                <span className="font-bold text-blue-600">
                                  {formatPrice(product.price)}
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Rating Row */}
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-black border-b border-gray-300">
                              Đánh giá
                            </td>
                            {compareProducts.map((product) => {
                              const rating =
                                product.rateCount > 0
                                  ? product.sumRate / product.rateCount
                                  : 0;
                              return (
                                <td
                                  key={product.id}
                                  className="text-center p-4 border-b border-l border-gray-300"
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-medium text-black">
                                      {rating.toFixed(1)}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                      ({product.rateCount} đánh giá)
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {/* Specs Rows */}
                          {categories.map((category) => {
                            const allLabelsInCategory = new Set<string>();
                            compareProducts.forEach((product) => {
                              getSpecsByCategory(product.id, category).forEach(
                                (spec) => {
                                  allLabelsInCategory.add(spec.label);
                                }
                              );
                            });

                            return Array.from(allLabelsInCategory)
                              .sort()
                              .map((label, idx) => (
                                <tr
                                  key={`${category}-${label}`}
                                  className={cn(
                                    "hover:bg-gray-50 transition-colors",
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  )}
                                >
                                  <td className="p-4 font-medium text-black border-b border-gray-300">
                                    {label}
                                  </td>
                                  {compareProducts.map((product) => {
                                    const spec = getSpecsByCategory(
                                      product.id,
                                      category
                                    ).find((s) => s.label === label);

                                    return (
                                      <td
                                        key={`${product.id}-${label}`}
                                        className="text-center p-4 border-b border-l border-gray-300"
                                      >
                                        {spec && spec.value ? (
                                          <div className="flex items-center justify-center gap-2">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-black">
                                              {spec.value}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-center gap-2 text-gray-500">
                                            <Minus className="w-4 h-4" />
                                            <span className="text-sm">-</span>
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {compareProducts.length === 1 && (
                <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
                  <CardContent className="flex items-center justify-center py-10">
                    <p className="text-amber-400 font-medium">
                      Vui lòng chọn thêm ít nhất 1 sản phẩm nữa để so sánh
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ComparisonPage;
