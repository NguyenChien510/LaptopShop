import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "../../../components/ProductCard";
import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import axios from "@/lib/axios";

const ProductGrid = () => {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/products");
        const sorted = Array.isArray(res.data)
          ? [...res.data].sort((a, b) => (b?.sold || 0) - (a?.sold || 0))
          : [];
        setTopProducts(sorted.slice(0, 4));
      } catch (err) {
        console.error("Fetch top products error:", err);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, []);
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

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && (
            <div className="col-span-full text-center text-muted-foreground">
              Đang tải sản phẩm nổi bật...
            </div>
          )}
          {!loading && topProducts.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
              Chưa có sản phẩm nổi bật
            </div>
          )}
          {!loading &&
            topProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <ProductCard product={product} />
              </Link>
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
