import { Mail, Phone, MapPin } from "lucide-react";
import youtube from "@/assets/youtube.png";
import fb from "@/assets/fb.png";
import ins from "@/assets/instagram.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                LaptopStore
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              Cung cấp máy tính, laptop chất lượng cao với giá cả cạnh tranh
              nhất thị trường.
            </p>
            <div className="flex gap-2">
              <img
                src={fb}
                alt=""
                className="object-cover w-10 h-10 cursor-pointer"
              />
              <img
                src={youtube}
                alt=""
                className="object-cover w-10 h-10 cursor-pointer"
              />
              <img
                src={ins}
                alt=""
                className="object-cover w-10 h-10 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Sản phẩm
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Laptop Gaming
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Laptop Văn phòng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Laptop Đồ họa
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Hỗ trợ
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Đổi trả
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Liên hệ
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@LaptopStore.vn</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">
            © 2025 LaptopStore. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Điều khoản sử dụng
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
