import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export default function Signup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  // Cập nhật state khi nhập input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Dùng axios instance thay fetch
      const res = await axios.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (res.data.success) {
        toast.success("Registration successful!");
        navigate("/");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Lỗi khi đăng kí");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="overflow-hidden p-0 max-w-md mx-auto w-screen">
          <CardContent className="p-0 grid items-center">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col p-8 gap-6 max-w-xl mx-auto w-full"
            >
              {/* Logo + Brand */}
              <div className="flex justify-center items-center gap-2 flex-shrink-0 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  LaptopStore
                </span>
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="0123456789"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>

              {/* Switch to Login */}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 underline underline-offset-4 font-medium"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
