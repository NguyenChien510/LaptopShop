import { Shield, Truck, Headphones, Award } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Bảo hành chính hãng",
      description: "Bảo hành từ 12-36 tháng theo chính sách nhà sản xuất",
    },
    {
      icon: Truck,
      title: "Giao hàng nhanh",
      description: "Giao hàng miễn phí trong nội thành, nhanh chóng an toàn",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ kỹ thuật sẵn sàng hỗ trợ mọi lúc mọi nơi",
    },
    {
      icon: Award,
      title: "Chất lượng đảm bảo",
      description: "Sản phẩm chính hãng 100%, kiểm tra kỹ trước khi giao",
    },
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
