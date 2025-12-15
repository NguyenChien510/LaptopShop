import { Button } from "@/components/ui/button";
import ProductCard from "../../../components/ProductCard";
import { Link } from "react-router";

const ProductGrid = () => {
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
