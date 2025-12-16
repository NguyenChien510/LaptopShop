import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import Cart from "@/components/Cart";

const CartPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Cart />
      <Footer />
    </div>
  );
};

export default CartPage;
