import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Zap, Shield, Headphones } from "lucide-react";
import heroImage from "@/assets/hero-tech-modern.jpg";

interface HeroProps {
  onExplore: () => void;
}

const Hero = ({ onExplore }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute bottom-32 left-32 w-12 h-12 bg-blue-500/20 rounded-full blur-lg animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-blue-400 text-blue-400"
                  />
                ))}
              </div>
              <span className="text-sm text-blue-200">
                Đánh giá 5 sao từ 2000+ khách hàng
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight animate-slide-up">
              <span className="block text-white">Công Nghệ</span>
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-200 bg-clip-text">
                Tương Lai
              </span>
            </h1>

            <p
              className="text-xl text-blue-100 leading-relaxed animate-fade-in max-w-lg"
              style={{ animationDelay: "0.2s" }}
            >
              Khám phá thế giới công nghệ với những sản phẩm laptop Chất lượng
              cao - Giá cả hợp lý.
            </p>

            {/* Feature Icons */}
            <div
              className="flex gap-6 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center gap-2 text-blue-200">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Hiệu năng cao</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm">Bảo hành 3 năm</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Headphones className="h-5 w-5 text-purple-400" />
                <span className="text-sm">Hỗ trợ 24/7</span>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row gap-4 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Button
                size="lg"
                onClick={onExplore}
                className="background-image: var(--gradient-primary) text-white hover:shadow-glow text-lg px-8 py-6 border-0 cursor-pointer"
              >
                Khám phá ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm text-lg px-8 py-6 cursor-pointer"
              >
                Xem sản phẩm
              </Button>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="hidden lg:block">
            <div
              className="grid grid-cols-2 gap-6 animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">5000+</div>
                <div className="text-blue-200 text-sm">Sản phẩm</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-blue-200 text-sm">Khách hàng</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">99%</div>
                <div className="text-blue-200 text-sm">Hài lòng</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
