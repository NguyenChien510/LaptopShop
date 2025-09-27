import Header from "@/components/layouts/Header";
import Hero from "@/pages/home/components/Hero";
import ProductGrid from "@/pages/home/components/ProductGrid";
import Features from "@/pages/home/components/Features";
import Footer from "@/components/layouts/Footer";
import { useRef } from "react";
import UsageFilter from "./components/UsageFilter";

const Index = () => {
  const productRef = useRef<HTMLDivElement | null>(null);
  const handleExplore = () => {
    productRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero onExplore={handleExplore} />
      <div ref={productRef}>
        <UsageFilter />
      </div>
      <ProductGrid />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
