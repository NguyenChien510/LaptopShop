import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import AllProducts from "@/components/AllProducts";
import { useEffect } from "react";

const ProductClient = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AllProducts />
      <Footer />
    </div>
  );
};

export default ProductClient;
