import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Filter } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCPU, setSelectedCPU] = useState<string[]>([]);
  const [selectedRAM, setSelectedRAM] = useState<string[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<string[]>([]);
  const [selectedSSD, setSelectedSSD] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  const itemsPerPage = 12;
  const maxPrice = 100000000;

  // Dummy products (sau này thay API vào đây)
  const products: any[] = [];

  // Filtering logic (tạm để trống, sau này nối API sẽ apply filter ở đây)
  const filteredProducts = useMemo(() => {
    return products;
  }, [
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
          </Button>

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
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Bộ lọc</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="cursor-pointer"
                >
                  Xóa tất cả
                </Button>
              </div>

              {/* Price (luôn hiển thị) */}
              <div className="mb-6 p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Khoảng giá</h4>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                  max={maxPrice}
                  step={1000000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>

              {/* Accordion cho các bộ lọc khác */}
              <Accordion type="multiple" className="space-y-3">
                {/* Brand */}
                <AccordionItem
                  value="brand"
                  className="rounded-lg bg-muted/50 px-3"
                >
                  <AccordionTrigger className="font-medium cursor-pointer">
                    Thương hiệu
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {brands.map((brand) => (
                        <div
                          key={brand}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={(checked) =>
                              setSelectedBrands(
                                checked
                                  ? [...selectedBrands, brand]
                                  : selectedBrands.filter((b) => b !== brand)
                              )
                            }
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`brand-${brand}`}
                            className="text-sm cursor-pointer"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* CPU */}
                <AccordionItem
                  value="cpu"
                  className="rounded-lg bg-muted/50 px-3"
                >
                  <AccordionTrigger className="font-medium cursor-pointer">
                    CPU
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {cpuOptions.map((cpu) => (
                        <div key={cpu} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cpu-${cpu}`}
                            checked={selectedCPU.includes(cpu)}
                            onCheckedChange={(checked) =>
                              setSelectedCPU(
                                checked
                                  ? [...selectedCPU, cpu]
                                  : selectedCPU.filter((c) => c !== cpu)
                              )
                            }
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`cpu-${cpu}`}
                            className="text-sm cursor-pointer"
                          >
                            {cpu}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* RAM */}
                <AccordionItem
                  value="ram"
                  className="rounded-lg bg-muted/50 px-3"
                >
                  <AccordionTrigger className="font-medium cursor-pointer">
                    RAM
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {ramOptions.map((ram) => (
                        <div key={ram} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ram-${ram}`}
                            checked={selectedRAM.includes(ram)}
                            onCheckedChange={(checked) =>
                              setSelectedRAM(
                                checked
                                  ? [...selectedRAM, ram]
                                  : selectedRAM.filter((r) => r !== ram)
                              )
                            }
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`ram-${ram}`}
                            className="text-sm cursor-pointer"
                          >
                            {ram}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Display */}
                <AccordionItem
                  value="display"
                  className="rounded-lg bg-muted/50 px-3"
                >
                  <AccordionTrigger className="font-medium cursor-pointer">
                    Màn hình
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {displayOptions.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={`display-${size}`}
                            checked={selectedDisplay.includes(size)}
                            onCheckedChange={(checked) =>
                              setSelectedDisplay(
                                checked
                                  ? [...selectedDisplay, size]
                                  : selectedDisplay.filter((s) => s !== size)
                              )
                            }
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`display-${size}`}
                            className="text-sm cursor-pointer"
                          >
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* SSD */}
                <AccordionItem
                  value="ssd"
                  className="rounded-lg bg-muted/50 px-3"
                >
                  <AccordionTrigger className="font-medium cursor-pointer">
                    Ổ cứng SSD
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {ssdOptions.map((ssd) => (
                        <div key={ssd} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ssd-${ssd}`}
                            checked={selectedSSD.includes(ssd)}
                            onCheckedChange={(checked) =>
                              setSelectedSSD(
                                checked
                                  ? [...selectedSSD, ssd]
                                  : selectedSSD.filter((s) => s !== ssd)
                              )
                            }
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`ssd-${ssd}`}
                            className="text-sm cursor-pointer"
                          >
                            {ssd}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

          {/* Placeholder Products */}
          <div className="text-center py-12 border rounded-md">
            <p className="text-muted-foreground text-lg">
              Chưa có dữ liệu sản phẩm. Kết nối API để hiển thị.
            </p>
          </div>

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
