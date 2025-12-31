import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "../components/ProductCard";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Scale3d } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Product } from "@/types/product";
import axios from "@/lib/axios";

const cpuOptions = [
  { id: "i3", value: "Intel Core i3" },
  { id: "i5", value: "Intel Core i5" },
  { id: "i7", value: "Intel Core i7" },
  { id: "i9", value: "Intel Core i9" },
  { id: "r5", value: "AMD Ryzen 5" },
  { id: "r7", value: "AMD Ryzen 7" },
  { id: "r9", value: "AMD Ryzen 9" },
  { id: "m1", value: "Apple M1" },
  { id: "m2", value: "Apple M2" },
  { id: "m3", value: "Apple M3" },
];
const ramOptions = [
  { id: "8", value: "8GB" },
  { id: "16", value: "16GB" },
  { id: "32", value: "32GB" },
];
const displayOptions = [
  { id: "13", value: "13 inch" },
  { id: "14", value: "14 inch" },
  { id: "15", value: "15 inch" },
  { id: "16", value: "16 inch" },
];
const ssdOptions = [
  { id: "256", value: "256GB" },
  { id: "512", value: "512GB" },
  { id: "1024", value: "1TB" },
];

const AllProducts = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [series, setSeries] = useState<{ id: number; name: string }[]>([]);
  const [usages, setUsages] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [selectedUsage, setSelectedUsage] = useState<string>("");
  const [selectedCPU, setSelectedCPU] = useState<string>("");
  const [selectedRAM, setSelectedRAM] = useState<string>("");
  const [selectedDisplay, setSelectedDisplay] = useState<string>("");
  const [selectedSSD, setSelectedSSD] = useState<string>("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);

  const itemsPerPage = 12;
  const maxPrice = 100000000;

  // Fetch products từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();

        if (selectedBrand) {
          const brand = brands.find((b) => b.name === selectedBrand);
          if (brand) {
            params.append("brandId", brand.id.toString());
          }
        }

        if (selectedSeries) {
          const seriesObj = series.find((s) => s.name === selectedSeries);
          if (seriesObj) {
            params.append("seriesId", seriesObj.id.toString());
          }
        }

        if (selectedUsage) {
          const usage = usages.find((u) => u.name === selectedUsage);
          if (usage) {
            params.append("usageId", usage.id.toString());
          }
        }

        // Add specs filters
        if (selectedCPU) {
          params.append("cpuId", selectedCPU);
        }

        if (selectedRAM) {
          params.append("ramId", selectedRAM);
        }

        if (selectedSSD) {
          params.append("ssdId", selectedSSD);
        }

        if (selectedDisplay) {
          params.append("displayId", selectedDisplay);
        }

        const url = params.toString()
          ? `/products?${params.toString()}`
          : "/products";

        const res = await axios.get(url);
        setProducts(res.data);
        setError("");
      } catch (error: any) {
        console.error("Lỗi fetch products:", error);
        setError(error?.message || "Lỗi tải sản phẩm");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [
    selectedBrand,
    selectedSeries,
    selectedUsage,
    selectedCPU,
    selectedRAM,
    selectedSSD,
    selectedDisplay,
    brands,
    series,
    usages,
  ]);

  // Fetch brands từ API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("/brands");
        setBrands(res.data);
      } catch (error) {
        console.error("Lỗi fetch brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch usages từ API
  useEffect(() => {
    const fetchUsages = async () => {
      try {
        const res = await axios.get("/usages");
        setUsages(res.data);
      } catch (error) {
        console.error("Lỗi fetch usages:", error);
      }
    };
    fetchUsages();
  }, []);

  // Đồng bộ usage từ query string (usageId)
  useEffect(() => {
    if (usages.length === 0) return;
    const params = new URLSearchParams(location.search);
    const usageId = params.get("usageId");
    if (usageId) {
      const found = usages.find((u) => u.id.toString() === usageId);
      if (found) {
        setSelectedUsage(found.name);
        setCurrentPage(1);
      }
    }
  }, [location.search, usages]);

  // Fetch series khi brand được chọn
  useEffect(() => {
    if (!selectedBrand) {
      setSeries([]);
      setSelectedSeries("");
      return;
    }

    const fetchSeries = async () => {
      try {
        const brand = brands.find((b) => b.name === selectedBrand);
        if (brand) {
          const res = await axios.get(`/brands/${brand.id}/series`);
          setSeries(res.data);
        }
      } catch (error) {
        console.error("Lỗi fetch series:", error);
      }
    };
    fetchSeries();
  }, [selectedBrand, brands]);

  // Gợi ý tìm kiếm theo tên sản phẩm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/products/search?q=${encodeURIComponent(searchTerm)}&limit=5`,
          { signal: controller.signal }
        );
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Lỗi gợi ý tìm kiếm:", error);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  // Lọc & sắp xếp
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchTerm, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, maxPrice]);
    setSelectedBrand("");
    setSelectedSeries("");
    setSelectedUsage("");
    setSelectedCPU("");
    setSelectedRAM("");
    setSelectedDisplay("");
    setSelectedSSD("");
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
            TẤT CẢ SẢN PHẨM
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Khám phá toàn bộ bộ sưu tập laptop công nghệ hàng đầu
        </p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="pl-10"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-background border rounded-md shadow-lg max-h-64 overflow-auto">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-muted/70 transition-colors"
                  onClick={() => {
                    setSearchTerm(item.name);
                    setShowSuggestions(false);
                  }}
                >
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Sắp xếp giá tăng dần</SelectItem>
              <SelectItem value="price-desc">Sắp xếp giá giảm dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <Card className="w-60">
            <CardContent className="space-y-4">
              {/* Price Range */}
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Khoảng giá</div>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={maxPrice}
                  step={1000000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
              {/* Brand Filter */}
              <Accordion type="multiple" defaultValue={["brand"]}>
                <AccordionItem value="brand">
                  <AccordionTrigger className="cursor-pointer">
                    Thương hiệu
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedBrand(
                            selectedBrand === brand.name ? "" : brand.name
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedBrand === brand.name
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedBrand === brand.name && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium cursor-pointer">
                          {brand.name}
                        </span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Series Filter - Only show when brand is selected */}
                {selectedBrand && series.length > 0 && (
                  <AccordionItem value="series">
                    <AccordionTrigger className="cursor-pointer">
                      Series
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 mt-2">
                      {series.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                          onClick={() => {
                            setSelectedSeries(
                              selectedSeries === s.name ? "" : s.name
                            );
                            setCurrentPage(1);
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedSeries === s.name
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selectedSeries === s.name && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium cursor-pointer">
                            {s.name}
                          </span>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Usage Filter */}
                <AccordionItem value="usage">
                  <AccordionTrigger className="cursor-pointer">
                    Nhu cầu sử dụng
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    {usages.map((usage) => (
                      <div
                        key={usage.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedUsage(
                            selectedUsage === usage.name ? "" : usage.name
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedUsage === usage.name
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedUsage === usage.name && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium cursor-pointer">
                          {usage.name}
                        </span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* CPU Filter */}
                <AccordionItem value="cpu">
                  <AccordionTrigger className="cursor-pointer">
                    CPU
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    {cpuOptions.map((cpu) => (
                      <div
                        key={cpu.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedCPU(selectedCPU === cpu.id ? "" : cpu.id);
                          setCurrentPage(1);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedCPU === cpu.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedCPU === cpu.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium cursor-pointer">
                          {cpu.value}
                        </span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* RAM Filter */}
                <AccordionItem value="ram">
                  <AccordionTrigger className="cursor-pointer">
                    RAM
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    {ramOptions.map((ram) => (
                      <div
                        key={ram.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedRAM(selectedRAM === ram.id ? "" : ram.id);
                          setCurrentPage(1);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedRAM === ram.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedRAM === ram.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium cursor-pointer">
                          {ram.value}
                        </span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Display Filter */}
                <AccordionItem value="display">
                  <AccordionTrigger className="cursor-pointer">
                    Màn hình
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    {displayOptions.map((disp) => (
                      <div
                        key={disp.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedDisplay(
                            selectedDisplay === disp.id ? "" : disp.id
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedDisplay === disp.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedDisplay === disp.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium cursor-pointer">
                          {disp.value}
                        </span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* SSD Filter */}
                <AccordionItem value="ssd">
                  <AccordionTrigger className="cursor-pointer">
                    SSD
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 mt-2">
                    {ssdOptions.map((ssd) => (
                      <div
                        key={ssd.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedSSD(selectedSSD === ssd.id ? "" : ssd.id);
                          setCurrentPage(1);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedSSD === ssd.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedSSD === ssd.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium cursor-pointer">
                          {ssd.value}
                        </span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full mt-4 cursor-pointer"
              >
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Hiển thị {paginatedProducts.length} trong{" "}
              {filteredProducts.length} sản phẩm
            </p>
            <Link to="/comparison">
              <Button className="gap-2 cursor-pointer" variant="default">
                <Scale3d className="h-4 w-4" />
                Xem danh sách so sánh
              </Button>
            </Link>
          </div>

          {/* Products */}
          {error ? (
            <div className="text-center py-12 border rounded-md bg-red-50 border-red-200">
              <p className="text-red-600 text-lg font-semibold">⚠️ {error}</p>
              <p className="text-red-500 text-sm mt-2">
                Vui lòng kiểm tra kết nối và thử lại
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">Đang tải sản phẩm...</div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
