import { useState, useEffect, useContext } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  User,
  LogIn,
  UserPlus,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { useRef } from "react";

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between py-4 gap-6">
        {/* Logo */}
        <Link to="/">
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              LaptopStore
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-primary">
            Laptop
          </a>
          <a href="#" className="hover:text-primary">
            Laptop văn phòng
          </a>
          <a href="#" className="hover:text-primary">
            Laptop gaming
          </a>
          <a href="#" className="hover:text-primary">
            Laptop đồ họa
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
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={toggleDropdown}
            >
              <User className="h-5 w-5" />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-all duration-200 group"
                    >
                      <LogIn className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-all duration-200 group"
                    >
                      <UserPlus className="w-4 h-4 text-gray-500 group-hover:text-green-500 transition-colors" />
                      <span>Đăng ký</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-all duration-200 group"
                    >
                      <User className="w-4 h-4 text-gray-500 group-hover:text-indigo-500 transition-colors" />
                      <span>Thông tin cá nhân</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-all duration-200 group"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
                      <span>Lịch sử đơn hàng</span>
                    </Link>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 transition-all duration-200 group cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                      <span>Đăng xuất</span>
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
