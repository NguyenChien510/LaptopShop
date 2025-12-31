import React, { useState, useEffect } from "react";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";

const cities = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
];

const districts: Record<string, string[]> = {
  "Hà Nội": [
    "Ba Đình",
    "Hoàn Kiếm",
    "Hai Bà Trưng",
    "Đống Đa",
    "Cầu Giấy",
    "Thanh Xuân",
    "Hoàng Mai",
  ],
  "TP. Hồ Chí Minh": [
    "Quận 1",
    "Quận 3",
    "Quận 5",
    "Quận 7",
    "Quận 10",
    "Bình Thạnh",
    "Phú Nhuận",
  ],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"],
  "Hải Phòng": ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn"],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát"],
  "Đồng Nai": ["Biên Hòa", "Long Khánh", "Long Thành", "Nhơn Trạch"],
};

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
  createdAt: string;
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editForm, setEditForm] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/users/profile");
      setProfile(response.data);
      setEditForm(response.data);
    } catch (error) {
      toast.error("Không thể tải thông tin cá nhân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      const response = await axios.put("/users/profile", {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        city: editForm.city,
        district: editForm.district,
        street: editForm.street,
      });

      setProfile(response.data);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật thông tin");
      console.error(error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("images", file);

      const uploadResponse = await axios.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = uploadResponse.data.urls[0];

      // Update profile with new image
      const response = await axios.put("/users/profile", {
        image: imageUrl,
      });

      setProfile(response.data);
      setEditForm(response.data);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      toast.error("Không thể upload ảnh");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile || !editForm) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Không thể tải thông tin</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Trang cá nhân</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>

          {/* Profile Card */}
          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile.image || ""} alt={profile.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Edit2 className="h-6 w-6 text-white" />
                      </label>
                      {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6 space-y-6">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Họ và tên
                    </Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      readOnly
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* Address Section */}
                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Địa chỉ nhận hàng</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Thành phố</Label>
                        <Select
                          value={editForm.city || ""}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              city: value,
                              district: "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thành phố" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quận/Huyện</Label>
                        <Select
                          value={editForm.district || ""}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, district: value })
                          }
                          disabled={!editForm.city}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quận/huyện" />
                          </SelectTrigger>
                          <SelectContent>
                            {(editForm.city
                              ? districts[editForm.city] || []
                              : []
                            ).map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">
                        Địa chỉ cụ thể (Số nhà, đường)
                      </Label>
                      <Input
                        id="street"
                        placeholder="VD: 123 Nguyễn Văn A, Phường 5"
                        value={editForm.street || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, street: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 cursor-pointer"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="cursor-pointer"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Họ và tên</p>
                      <p className="font-medium">{profile.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Số điện thoại
                      </p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Ngày tạo tài khoản
                      </p>
                      <p className="font-medium">
                        {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>

                  {profile.city && profile.district && profile.street && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            Địa chỉ nhận hàng
                          </p>
                          <p className="font-medium">
                            {profile.street}, {profile.district}, {profile.city}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full mt-4 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Chỉnh sửa thông tin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
