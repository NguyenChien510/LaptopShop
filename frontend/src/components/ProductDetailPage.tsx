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
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        // Handle both formats: direct data or {success, data}
        const productData = res.data.data ? res.data.data : res.data;

        setProduct({
          ...productData,
          images:
            typeof productData.images === "string"
              ? JSON.parse(productData.images)
              : productData.images ?? [],

          shortSpecs:
            typeof productData.shortSpecs === "string"
              ? JSON.parse(productData.shortSpecs)
              : productData.shortSpecs ?? [],

          detailSpecs:
            typeof productData.detailSpecs === "string"
              ? JSON.parse(productData.detailSpecs)
              : productData.detailSpecs ?? [],
        });
      } catch (error) {
        console.error("Lỗi fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews/product/${id}`);
        if (res.data.success) {
          setReviews(res.data.data || []);
        }
      } catch (error) {
        console.error("Lỗi fetch reviews:", error);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <ProductDetail product={product} reviews={reviews} />
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
