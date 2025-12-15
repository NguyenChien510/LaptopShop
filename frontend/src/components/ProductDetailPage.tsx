import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetail from "@/components/ProductDetail";
import type { Product } from "@/types/product";
import axios from "@/lib/axios";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(`/products/${id}`);
        const data = res.data;

        setProduct({
          ...data,
          images:
            typeof data.images === "string"
              ? JSON.parse(data.images)
              : data.images ?? [],

          shortSpecs:
            typeof data.shortSpecs === "string"
              ? JSON.parse(data.shortSpecs)
              : data.shortSpecs ?? [],

          detailSpecs:
            typeof data.detailSpecs === "string"
              ? JSON.parse(data.detailSpecs)
              : data.detailSpecs ?? [],
        });
      } catch (error) {
        console.error("Lỗi fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <ProductDetail product={product} />
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
