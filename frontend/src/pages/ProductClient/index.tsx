import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import AllProducts from "@/components/AllProducts";

const ProductClient = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AllProducts />
      <Footer />
    </div>
  );
};

export default ProductClient;
