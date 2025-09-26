import { useState, useEffect, useContext } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Kiểm tra trạng thái login khi component mount
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get("/auth/check");
        console.log("📥 Toàn bộ res.data:", res.data);
        if (res.data.loggedIn) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
        console.error(err);
      }
    };

    checkLogin();
  }, [setUser]);

  // Đóng dropdown khi user thay đổi (login/logout)
  useEffect(() => {
    if (dropdownOpen) setDropdownOpen(false);
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between py-4 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">TechStore</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-primary">
            Sản phẩm
          </a>
          <a href="#" className="hover:text-primary">
            Laptop
          </a>
          <a href="#" className="hover:text-primary">
            Máy tính
          </a>
          <a href="#" className="hover:text-primary">
            Linh kiện
          </a>
          <a href="#" className="hover:text-primary">
            Xây dựng cấu hình
          </a>
        </nav>

        {/* Search + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 relative">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm"
              className="pl-10 rounded-full bg-transparent border border-muted-foreground/40 focus:border-primary"
            />
          </div>

          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ShoppingCart className="h-8 w-8" />
          </Button>

          {/* User Icon + Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={toggleDropdown}
            >
              <User className="h-5 w-5" />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/orders"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Lịch sử đơn hàng
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
