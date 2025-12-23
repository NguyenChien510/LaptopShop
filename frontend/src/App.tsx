import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/index";
import Login from "./pages/login/index";
import Signup from "./pages/login/components/Signup";
import NotFound from "./pages/NotFound";
import Test from "./pages/testupload";
import ForgotPassword from "./components/ForgotPassword";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import AddProduct from "./pages/admin/AddProduct";
import ProductClient from "./pages/ProductClient";
import ProductDetailPage from "./components/ProductDetailPage";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import ProfilePage from "@/pages/profile";
import OrdersHistoryPage from "@/pages/orders/History";
import OrderDetailPage2 from "@/pages/orders/Detail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="bottom-right" richColors />
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset" element={<ForgotPassword />} />
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/products" element={<ProductClient />} />
              <Route path="/allproducts" element={<ProductClient />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersHistoryPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage2 />} />
              <Route path="/test" element={<Test />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
