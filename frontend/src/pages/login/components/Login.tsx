import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/pclogin.png";
import { Link, useNavigate } from "react-router";
import { useContext, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { UserContext } from "@/context/UserContext";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext); // ✅ lấy setUser từ context

  // cập nhật state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // xử lý submit login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        toast.success("Login successful!");
        // gọi lại check login để lấy user
        const checkRes = await axios.get("/auth/check");
        if (checkRes.data.loggedIn) {
          setUser(checkRes.data.user);
        }
        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Lỗi khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 max-w-3xl mx-auto w-full">
        <CardContent className="p-0 grid md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col p-6 md:p-8 gap-6"
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

            {/* Email */}
            <div className="grid gap-3">
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
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <Link
                to="/reset"
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Divider */}
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>

            {/* Google Sign-in Button */}
            <div className="flex justify-center w-full max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  const apiUrl =
                    import.meta.env.MODE === "development"
                      ? "http://localhost:5001/api/auth/google"
                      : "/api/auth/google";
                  window.location.href = apiUrl;
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-glow transition-shadow duration-200 cursor-pointer"
              >
                {/* Google Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>
            </div>

            {/* Switch to Sign Up */}
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 underline underline-offset-4 font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>

          {/* Right Side Image */}
          <div className="bg-muted relative hidden md:block">
            <img
              src={heroImage}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
