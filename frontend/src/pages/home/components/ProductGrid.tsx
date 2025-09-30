import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "../../../components/ProductCard";
import { products } from "@/types/products";
import { Link } from "react-router";

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "Tất cả", count: products.length },
    {
      id: "laptop",
      name: "Laptop",
      count: products.filter((p) => p.category === "laptop").length,
    },
    {
      id: "desktop",
      name: "PC Desktop",
      count: products.filter((p) => p.category === "desktop").length,
    },
    {
      id: "gaming",
      name: "Gaming",
      count: products.filter((p) => p.category === "gaming").length,
    },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 animate-slide-up leading-[1.25]">
            <span className="inline-block text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text ">
              SẢN PHẨM NỔI BẬT
            </span>
          </h2>
          <p
            className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            🚀 Khám phá bộ sưu tập laptop chất lượng cao với
            <span className="text-primary font-semibold">
              công nghệ tiên tiến nhất
            </span>
            , mang đến trải nghiệm tuyệt vời cho mọi nhu cầu
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={
                selectedCategory === category.id
                  ? "bg-gradient-primary text-white cursor-pointer"
                  : "cursor-pointer"
              }
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="cursor-pointer">
            <Link to="/allproducts">Xem thêm sản phẩm</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
