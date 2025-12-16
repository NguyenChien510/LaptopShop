import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import Checkout from "@/components/Checkout";

const CheckoutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Checkout />
      <Footer />
    </div>
  );
};

export default CheckoutPage;
