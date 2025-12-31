import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import axios from "@/lib/axios";
import type { DragEndEvent } from "@dnd-kit/core";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, GripVertical, Save, ImageIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useParams } from "react-router-dom";

interface ImageItem {
  id: string;
  file?: File;
  url: string;
}

interface ShortSpec {
  id: string;
  label: string;
  value: string;
}

interface DetailSpec {
  id: string;
  category: string;
  label: string;
  value: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Series {
  id: number;
  name: string;
}

interface UsageOption {
  id: number;
  name: string;
}

const SortableImage = ({
  image,
  onRemove,
}: {
  image: ImageItem;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-lg overflow-hidden border ${
        isDragging
          ? "ring-2 ring-primary scale-105 z-50"
          : "border-muted-foreground/25"
      } transition-transform duration-200`}
    >
      <img src={image.url} alt="Product" className="w-full h-32 object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex gap-2">
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-background/80 rounded hover:bg-background"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRemove(image.id)}
            className="p-2 bg-destructive/80 rounded hover:bg-destructive text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    brandId: "",
    seriesId: "",
    usageIds: [] as number[],
    thumbnail: "",
  });

  const [shortSpecs, setShortSpecs] = useState<ShortSpec[]>([
    { id: "cpu", label: "CPU", value: "" },
    { id: "ram", label: "RAM", value: "" },
    { id: "ssd", label: "SSD", value: "" },
    { id: "display", label: "Display", value: "" },
    { id: "vga", label: "VGA", value: "" },
  ]);

  const [detailSpecs, setDetailSpecs] = useState<DetailSpec[]>([
    { id: "cpu-detail", category: "Bộ xử lý", label: "Model CPU", value: "" },
    { id: "ram-detail", category: "Bộ nhớ", label: "RAM", value: "" },
    { id: "storage-detail", category: "Lưu trữ", label: "Ổ cứng", value: "" },
    {
      id: "display-detail",
      category: "Màn hình",
      label: "Kích thước màn hình",
      value: "",
    },
    {
      id: "graphics-detail",
      category: "Đồ họa",
      label: "Card đồ họa",
      value: "",
    },
  ]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [usages, setUsages] = useState<UsageOption[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load product data and options
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load brands, series, usages in parallel
        const [brandsRes, usagesRes, productRes] = await Promise.all([
          axios.get("/brands"),
          axios.get("/usages"),
          axios.get(`/products/${id}`),
        ]);

        // Handle brands - could be array or {success, data}
        if (Array.isArray(brandsRes.data)) {
          setBrands(brandsRes.data);
        } else if (brandsRes.data.success && brandsRes.data.data) {
          setBrands(brandsRes.data.data);
        }

        // Handle usages - could be array or {success, data}
        if (Array.isArray(usagesRes.data)) {
          setUsages(usagesRes.data);
        } else if (usagesRes.data.success && usagesRes.data.data) {
          setUsages(usagesRes.data.data);
        }

        // Load product data
        if (productRes.data.success) {
          const product = productRes.data.data;
          console.log("[LOAD PRODUCT] product data:", {
            id: product.id,
            name: product.name,
            price: product.price,
            priceType: typeof product.price,
            priceStr: product.price?.toString(),
          });
          setFormData({
            name: product.name,
            price: product.price.toString(),
            stock: product.stock.toString(),
            brandId: product.brandId?.toString() || "",
            seriesId: product.seriesId?.toString() || "",
            usageIds: product.Usages?.map((u: any) => u.id) || [],
            thumbnail: product.thumbnail,
          });

          // Parse short specs
          const parsedShortSpecs =
            typeof product.shortSpecs === "string"
              ? JSON.parse(product.shortSpecs)
              : product.shortSpecs || [];
          setShortSpecs(
            parsedShortSpecs.length > 0 ? parsedShortSpecs : shortSpecs
          );

          // Parse detail specs
          const parsedDetailSpecs =
            typeof product.detailSpecs === "string"
              ? JSON.parse(product.detailSpecs)
              : product.detailSpecs || [];
          setDetailSpecs(
            parsedDetailSpecs.length > 0 ? parsedDetailSpecs : detailSpecs
          );

          // Set images - parse JSON if needed, include thumbnail
          let parsedImages = [];

          // Add thumbnail as first image
          if (product.thumbnail && product.thumbnail.length > 0) {
            parsedImages.push(product.thumbnail);
          }

          // Add remaining images
          if (product.images) {
            if (typeof product.images === "string") {
              try {
                const imgArray = JSON.parse(product.images);
                if (Array.isArray(imgArray)) {
                  parsedImages = parsedImages.concat(imgArray);
                }
              } catch {
                // JSON parse failed
              }
            } else if (Array.isArray(product.images)) {
              parsedImages = parsedImages.concat(product.images);
            }
          }

          // Filter out empty strings and create image objects
          setImages(
            parsedImages
              .filter((img: string) => img && img.length > 0)
              .map((img: string, idx: number) => ({
                id: `img-${idx}`,
                url: img,
              }))
          );
        } else {
          toast.error("Không tìm thấy sản phẩm");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải thông tin sản phẩm");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, navigate]);

  // Load series when brand is selected or product loads
  useEffect(() => {
    if (formData.brandId) {
      loadSeries(formData.brandId);
    }
  }, [formData.brandId]);

  const updateShortSpec = (id: string, value: string) => {
    setShortSpecs((prev) =>
      prev.map((spec) => (spec.id === id ? { ...spec, value } : spec))
    );
  };

  const updateDetailSpec = (id: string, value: string) => {
    setDetailSpecs((prev) =>
      prev.map((spec) => (spec.id === id ? { ...spec, value } : spec))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random()}`,
            file,
            url: event.target?.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const loadSeries = async (brandId: string) => {
    if (!brandId) {
      setSeries([]);
      return;
    }
    try {
      const response = await axios.get(`/brands/${brandId}/series`);
      // Handle both array and {success, data} formats
      if (Array.isArray(response.data)) {
        setSeries(response.data);
      } else if (response.data.success && response.data.data) {
        setSeries(response.data.data);
      }
    } catch (error) {
      console.error("Error loading series:", error);
      setSeries([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất một ảnh");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock || "0");
      formDataToSend.append("brandId", formData.brandId);
      formDataToSend.append("seriesId", formData.seriesId);
      formDataToSend.append("shortSpecs", JSON.stringify(shortSpecs));
      formDataToSend.append("detailSpecs", JSON.stringify(detailSpecs));
      formDataToSend.append("usageIds", JSON.stringify(formData.usageIds));

      // Debug log
      console.log("[SUBMIT] FormData entries before images:");
      console.log("  name:", formData.name);
      console.log("  price:", formData.price);
      console.log("  stock:", formData.stock);
      console.log("  brandId:", formData.brandId);
      console.log("  seriesId:", formData.seriesId);

      // Handle images - first image is always thumbnail
      let newImages: File[] = [];
      let existingImages: string[] = [];
      let thumbnailUrl = "";

      images.forEach((img, idx) => {
        // First image is thumbnail
        if (idx === 0) {
          thumbnailUrl = img.url;
        } else {
          // Rest go to images array
          if (img.file) {
            newImages.push(img.file);
          } else {
            existingImages.push(img.url);
          }
        }
      });

      // If first image is a new file, add it separately
      if (images.length > 0 && images[0].file) {
        newImages.unshift(images[0].file);
        thumbnailUrl = "";
      }

      newImages.forEach((file) => {
        formDataToSend.append("images", file);
      });

      formDataToSend.append("existingImages", JSON.stringify(existingImages));
      formDataToSend.append("thumbnail", thumbnailUrl || images[0]?.url || "");

      const response = await axios.put(`/products/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Cập nhật sản phẩm thành công!");
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error message:", error.message);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi cập nhật sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Chỉnh Sửa Sản Phẩm</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2">Tên sản phẩm *</Label>
                <Input
                  placeholder="Nhập tên sản phẩm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Giá *</Label>
                  <Input
                    placeholder="Nhập giá"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2">Tồn kho</Label>
                  <Input
                    placeholder="Nhập tồn kho"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-2">Thương hiệu</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        brandId: value,
                        seriesId: "",
                      });
                      loadSeries(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2">Dòng sản phẩm</Label>
                  <Select
                    value={formData.seriesId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, seriesId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dòng sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2">Nhu cầu sử dụng</Label>
                  <div className="flex flex-wrap gap-2">
                    {usages.map((usage) => (
                      <Badge
                        key={usage.id}
                        variant={
                          formData.usageIds.includes(usage.id)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            usageIds: formData.usageIds.includes(usage.id)
                              ? formData.usageIds.filter(
                                  (id) => id !== usage.id
                                )
                              : [...formData.usageIds, usage.id],
                          })
                        }
                      >
                        {usage.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const files = e.dataTransfer.files;
                  if (files) {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    Object.defineProperty(input, "files", {
                      value: files,
                    });
                    handleImageUpload({
                      currentTarget: input,
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p>Kéo ảnh vào đây hoặc click để chọn</p>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-4">
                    Ảnh được chọn ({images.length})
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={images.map((img) => img.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image) => (
                          <SortableImage
                            key={image.id}
                            image={image}
                            onRemove={removeImage}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Short Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Thông số nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shortSpecs.map((spec) => (
                <div key={spec.id} className="flex gap-2 items-center">
                  <div className="w-32">
                    <Label className="text-sm font-medium">{spec.label}</Label>
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={`Nhập ${spec.label.toLowerCase()}`}
                      value={spec.value}
                      onChange={(e) => updateShortSpec(spec.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Detail Specs */}
          <Card>
            <CardHeader>
              <CardTitle>Thông số chi tiết</CardTitle>
              <p className="text-sm text-muted-foreground">
                Thông số kỹ thuật đầy đủ của sản phẩm
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailSpecs.map((spec) => (
                <div
                  key={spec.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
                >
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      {spec.category}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {spec.label}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      placeholder={`Nhập ${spec.label.toLowerCase()}`}
                      value={spec.value}
                      onChange={(e) =>
                        updateDetailSpec(spec.id, e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Separator />

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
              disabled={loading}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="lg"
              className="px-8 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Cập nhật sản phẩm
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
