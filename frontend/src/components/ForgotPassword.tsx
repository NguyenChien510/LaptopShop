import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, Shield, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
// Schemas
const emailSchema = z.object({ email: z.email("Email không hợp lệ") });
const otpSchema = z.object({
  otp: z.string().min(6, "Mã OTP phải có 6 chữ số"),
});
const passwordSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// Types
type EmailForm = z.infer<typeof emailSchema>;
type OTPForm = z.infer<typeof otpSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const ForgotPasswordFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // countdown timer

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<OTPForm>({ resolver: zodResolver(otpSchema) });
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // --- Countdown effect ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => setTimer(60); // Bắt đầu countdown 60s

  // --- Backend API calls ---
  const sendResetOTP = async (email: string) => {
    try {
      const res = await api.post("/auth/resetpassword", { email });
      if (res.data.success) {
        toast.success("OTP đã được gửi đến email của bạn!");
        return true;
      } else {
        toast.error(res.data.message || "Gửi OTP thất bại");
        return false;
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Lỗi khi gửi OTP");
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      if (res.data.success) {
        toast.success("Xác minh OTP thành công!");
        return true;
      } else {
        toast.error(res.data.message || "OTP không hợp lệ");
        return false;
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Lỗi xác minh OTP");
      return false;
    }
  };

  const resetPassword = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/reset-password", { email, password });
      if (res.data.success) {
        toast.success("Đặt lại mật khẩu thành công!");
        return true;
      } else {
        toast.error(res.data.message || "Đặt lại mật khẩu thất bại");
        return false;
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Lỗi đặt lại mật khẩu");
      return false;
    }
  };

  // --- Handlers ---
  const onEmailSubmit = async (data: EmailForm) => {
    setLoading(true); // Bắt đầu loading
    const success = await sendResetOTP(data.email);
    setLoading(false); // Kết thúc loading
    if (success) {
      setEmail(data.email);
      setStep(2);
      startTimer(); // bắt đầu countdown khi bước 2
    }
  };

  const onOTPSubmit = async (data: OTPForm) => {
    const success = await verifyOTP(email, data.otp);
    if (success) setStep(3);
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    const success = await resetPassword(email, data.password);
    if (success) {
      navigate("/login"); // <-- chuyển tới login
    }
  };

  // --- Render Steps ---
  const renderStep1 = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Quên mật khẩu?</CardTitle>
        <CardDescription>
          Nhập email của bạn để nhận mã xác minh
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Nhập email của bạn"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              disabled={timer > 0}
              type="submit"
              loading={loading} // <- đây sẽ show spinner tự động
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "blue.600",
                color: "white",
                fontWeight: "600",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "blue.700",
                },
                "&:active": {
                  backgroundColor: "blue.800",
                },
                textTransform: "none",
              }}
            >
              {timer > 0 ? `Gửi lại sau ${timer}s` : "Gửi mã xác minh"}
            </LoadingButton>
            <Link
              to="/login"
              className="cursor-pointer mt-2 w-full inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Nhập mã OTP</CardTitle>
        <CardDescription>
          Chúng tôi đã gửi mã 6 chữ số đến {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onOTPSubmit)}
            className="space-y-6"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Mã OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3">
              <Button type="submit" className="w-full cursor-pointer">
                Xác minh mã
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full cursor-pointer"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center mt-4">
          <Button
            variant="link"
            className="text-sm cursor-pointer"
            disabled={timer > 0}
            onClick={async () => await sendResetOTP(email)}
          >
            {timer > 0 ? `Gửi lại sau ${timer}s` : "Gửi lại mã"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Đặt mật khẩu mới</CardTitle>
        <CardDescription>
          Tạo mật khẩu mới cho tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3">
              <Button type="submit" className="w-full cursor-pointer">
                Đặt lại mật khẩu
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full cursor-pointer"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16 pointer-events-none" />
      <div className="relative z-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ForgotPasswordFlow;
