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
import { CartContext } from "@/context/CartContext";
import { useRef } from "react";

type SuggestProduct = {
  id: number;
  name: string;
  price: number;
  thumbnail?: string;
};

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("Header must be used within CartProvider");
  }

  const { totalItems } = cartContext;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Gợi ý tìm kiếm sản phẩm theo tên
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/products/search?q=${encodeURIComponent(searchTerm)}&limit=5`,
          { signal: controller.signal }
        );
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Lỗi gợi ý tìm kiếm:", err);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " ₫";

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
          <Link to="/allproducts" className="hover:text-primary">
            Laptop
          </Link>
          <Link to="/allproducts?usageId=2" className="hover:text-primary">
            Laptop văn phòng
          </Link>
          <Link to="/allproducts?usageId=5" className="hover:text-primary">
            Laptop gaming
          </Link>
          <Link to="/allproducts?usageId=3" className="hover:text-primary">
            Laptop đồ họa
          </Link>
        </nav>

        {/* Search + Actions */}
        <div className="flex items-center gap-3 flex-shrink-0 relative">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="pl-10 rounded-full bg-transparent border border-muted-foreground/40 focus:border-primary"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 w-80 bg-background border rounded-md shadow-lg max-h-80 overflow-auto">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-muted/70 transition-colors"
                    onClick={() => {
                      setSearchTerm(item.name);
                      setShowSuggestions(false);
                    }}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium line-clamp-1">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer relative"
            >
              <ShoppingCart className="h-8 w-8" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

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
