import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import word from "@/assets/word.png";
import excel from "@/assets/excel.png";
import ppt from "@/assets/ppt.png";
import ps from "@/assets/ps.png";
import ai from "@/assets/ai.png";
import autocad from "@/assets/autocad.png";
import vsc from "@/assets/vsc.png";
import vs from "@/assets/vs.png";
import nb from "@/assets/nb.png";
import lol from "@/assets/lol.png";
import fo4 from "@/assets/fo4.png";
import gta from "@/assets/gtasa.jfif";

// Ảnh laptop tượng trưng cho từng mục
import officeLaptop from "@/assets/vanphong.webp";
import designLaptop from "@/assets/thietke.png";
import programmingLaptop from "@/assets/code.avif";
import gamingLaptop from "@/assets/laptop-gaming.jpg";

const LaptopCategories = () => {
  const navigate = useNavigate();

  // usageId mapping theo DB: 2 Office, 3 Design, 4 Development, 5 Gaming
  const categories = [
    {
      usageId: 2,
      title: "VĂN PHÒNG",
      description: "Hiệu năng ổn định cho làm việc và họp trực tuyến",
      images: [word, excel, ppt],
      laptopImage: officeLaptop,
      color: "from-cyan-500 to-sky-600",
    },
    {
      usageId: 3,
      title: "THIẾT KẾ",
      description: "GPU/CPU mạnh cho thiết kế đồ họa, dựng hình",
      images: [ps, ai, autocad],
      laptopImage: designLaptop,
      color: "from-purple-500 to-pink-500",
    },
    {
      usageId: 4,
      title: "PHÁT TRIỂN",
      description: "Máy mượt mà cho code, build và chạy môi trường ảo",
      images: [vsc, vs, nb],
      laptopImage: programmingLaptop,
      color: "from-green-500 to-emerald-500",
    },
    {
      usageId: 5,
      title: "GAMING",
      description:
        "Tản nhiệt tốt, GPU mạnh cho trải nghiệm game ổn định và mượt",
      images: [lol, fo4, gta],
      laptopImage: gamingLaptop,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
              Laptop theo nhu cầu
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tìm laptop phù hợp với nhu cầu sử dụng của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.usageId}
              className={`group hover:shadow-lg transition-all duration-300 border-0 hover:scale-105 cursor-pointer`}
              onClick={() =>
                navigate(`/allproducts?usageId=${category.usageId}`)
              }
            >
              <CardContent className="p-6 text-center">
                {/* Ảnh laptop tượng trưng */}
                <div className="mb-2">
                  <img
                    src={category.laptopImage}
                    alt={category.title}
                    className="w-142 h-70 mx-auto object-contain"
                  />
                </div>

                {/* 3 logo tròn */}
                <div className="flex justify-center gap-3 mb-6">
                  {category.images.map((image, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden`}
                    >
                      <img
                        src={image}
                        alt={`${category.title} ${index + 1}`}
                        className="h-12 w-12 rounded object-contain"
                      />
                    </div>
                  ))}
                </div>

                <h3 className="font-bold text-sm mb-2 text-foreground">
                  {category.title}
                </h3>

                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {category.description}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                  onClick={() =>
                    navigate(`/allproducts?usageId=${category.usageId}`)
                  }
                >
                  Xem sản phẩm
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LaptopCategories;
