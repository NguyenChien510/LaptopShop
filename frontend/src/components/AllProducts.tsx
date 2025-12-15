import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
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

const brands = ["Lenovo", "Dell", "Asus", "HP", "Apple", "MSI", "Acer"];
const cpuOptions = [
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "AMD Ryzen 9",
  "Apple M1",
  "Apple M2",
  "Apple M3",
];
const ramOptions = ["8GB", "16GB", "32GB"];
const displayOptions = ["13 inch", "14 inch", "15 inch", "16 inch"];
const ssdOptions = ["256GB", "512GB", "1TB"];

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCPU, setSelectedCPU] = useState<string[]>([]);
  const [selectedRAM, setSelectedRAM] = useState<string[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<string[]>([]);
  const [selectedSSD, setSelectedSSD] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  const itemsPerPage = 12;
  const maxPrice = 100000000;

  // Fetch products từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products"); // 👉 đổi URL API thật vào đây
        setProducts(res.data);
      } catch (error) {
        console.error("Lỗi fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        selectedBrands.includes(
          p.shortSpecs.find((s) => s.id === "brand")?.value || ""
        )
      );
    }

    // CPU filter
    if (selectedCPU.length > 0) {
      result = result.filter((p) =>
        selectedCPU.includes(
          p.shortSpecs.find((s) => s.id === "cpu")?.value || ""
        )
      );
    }

    // RAM filter
    if (selectedRAM.length > 0) {
      result = result.filter((p) =>
        selectedRAM.includes(
          p.shortSpecs.find((s) => s.id === "ram")?.value || ""
        )
      );
    }

    // SSD filter
    if (selectedSSD.length > 0) {
      result = result.filter((p) =>
        selectedSSD.includes(
          p.shortSpecs.find((s) => s.id === "ssd")?.value || ""
        )
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    products,
    searchTerm,
    priceRange,
    selectedBrands,
    selectedCPU,
    selectedRAM,
    selectedDisplay,
    selectedSSD,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, maxPrice]);
    setSelectedBrands([]);
    setSelectedCPU([]);
    setSelectedRAM([]);
    setSelectedDisplay([]);
    setSelectedSSD([]);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  return (
    <div className="container py-8">
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
            className="pl-10"
          />
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
              <Accordion type="multiple" defaultValue={brands}>
                <AccordionItem value="brand">
                  <AccordionTrigger>Thương hiệu</AccordionTrigger>
                  <AccordionContent className="space-y-1 mt-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => {
                            setSelectedBrands((prev) =>
                              checked
                                ? [...prev, brand]
                                : prev.filter((b) => b !== brand)
                            );
                          }}
                        />
                        <span className="text-sm">{brand}</span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* CPU Filter */}
                <AccordionItem value="cpu">
                  <AccordionTrigger>CPU</AccordionTrigger>
                  <AccordionContent className="space-y-1 mt-2">
                    {cpuOptions.map((cpu) => (
                      <div key={cpu} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedCPU.includes(cpu)}
                          onCheckedChange={(checked) => {
                            setSelectedCPU((prev) =>
                              checked
                                ? [...prev, cpu]
                                : prev.filter((c) => c !== cpu)
                            );
                          }}
                        />
                        <span className="text-sm">{cpu}</span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* RAM Filter */}
                <AccordionItem value="ram">
                  <AccordionTrigger>RAM</AccordionTrigger>
                  <AccordionContent className="space-y-1 mt-2">
                    {ramOptions.map((ram) => (
                      <div key={ram} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedRAM.includes(ram)}
                          onCheckedChange={(checked) => {
                            setSelectedRAM((prev) =>
                              checked
                                ? [...prev, ram]
                                : prev.filter((r) => r !== ram)
                            );
                          }}
                        />
                        <span className="text-sm">{ram}</span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Display Filter */}
                <AccordionItem value="display">
                  <AccordionTrigger>Màn hình</AccordionTrigger>
                  <AccordionContent className="space-y-1 mt-2">
                    {displayOptions.map((disp) => (
                      <div key={disp} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedDisplay.includes(disp)}
                          onCheckedChange={(checked) => {
                            setSelectedDisplay((prev) =>
                              checked
                                ? [...prev, disp]
                                : prev.filter((d) => d !== disp)
                            );
                          }}
                        />
                        <span className="text-sm">{disp}</span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* SSD Filter */}
                <AccordionItem value="ssd">
                  <AccordionTrigger>SSD</AccordionTrigger>
                  <AccordionContent className="space-y-1 mt-2">
                    {ssdOptions.map((ssd) => (
                      <div key={ssd} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedSSD.includes(ssd)}
                          onCheckedChange={(checked) => {
                            setSelectedSSD((prev) =>
                              checked
                                ? [...prev, ssd]
                                : prev.filter((s) => s !== ssd)
                            );
                          }}
                        />
                        <span className="text-sm">{ssd}</span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full mt-4"
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
          </div>

          {/* Products */}
          {loading ? (
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
