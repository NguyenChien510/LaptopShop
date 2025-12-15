import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import axios from "@/lib/axios";
import type { DragEndEvent } from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
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

interface ImageItem {
  id: string;
  file: File;
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

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragActive, setDragActive] = useState(false);

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
    {
      id: "weight-detail",
      category: "Thiết kế",
      label: "Trọng lượng",
      value: "",
    },
    {
      id: "battery-detail",
      category: "Pin",
      label: "Dung lượng pin",
      value: "",
    },
    {
      id: "ports-detail",
      category: "Kết nối",
      label: "Cổng kết nối",
      value: "",
    },
    { id: "webcam-detail", category: "Camera", label: "Webcam", value: "" },
  ]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [usageOptions, setUsageOptions] = useState<UsageOption[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    sale: "",
    brand: "",
    series: "",
    usage: [] as number[], // lưu id
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  useEffect(() => {
    if (loading) {
      // disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // restore scroll
      document.body.style.overflow = "";
    }

    // cleanup khi unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, usageRes] = await Promise.all([
          axios.get("/brands"),
          axios.get("/usages"),
        ]);
        setBrands(brandsRes.data);
        setUsageOptions(usageRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!formData.brand) {
      setSeries([]);
      return;
    }
    const fetchSeries = async () => {
      try {
        const res = await axios.get(`/brands/${formData.brand}/series`);
        setSeries(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSeries();
  }, [formData.brand]);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFiles = (files: File[]) => {
    if (images.length + files.length > 6) {
      toast.error("Chỉ được tải lên tối đa 6 ảnh");
      return;
    }
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) =>
        setImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url: e.target?.result as string,
          },
        ]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((img) => img.id !== id));
  const updateShortSpec = (id: string, value: string) =>
    setShortSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s))
    );
  const updateDetailSpec = (id: string, value: string) =>
    setDetailSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s))
    );

  const toggleUsage = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      usage: prev.usage.includes(id)
        ? prev.usage.filter((u) => u !== id)
        : [...prev.usage, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images.length) return toast.error("Vui lòng thêm ít nhất 1 ảnh");

    try {
      setLoading(true); // bật loading
      const formImage = new FormData();
      images.forEach((img) => formImage.append("images", img.file));
      const { data } = await axios.post("/uploads", formImage, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrls: string[] = data.urls;

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        sale: parseInt(formData.sale) || 0,
        thumbnail: uploadedUrls[0],
        images: uploadedUrls.slice(1),
        shortSpecs: shortSpecs.filter((s) => s.value),
        detailSpecs: detailSpecs.filter((d) => d.value),
        brandId: parseInt(formData.brand) || null,
        seriesId: parseInt(formData.series) || null,
        usage: formData.usage, // gửi list id
      };

      await axios.post("/products/add", productData);
      toast.success("Sản phẩm đã được lưu thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lưu sản phẩm thất bại");
    } finally {
      setLoading(false); // tắt loading
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Thêm sản phẩm mới
        </h1>
        <p className="text-muted-foreground">
          Điền thông tin chi tiết để tạo sản phẩm mới
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (VND) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="25000000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Thương hiệu *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      brand: value,
                      series: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="series">Series</Label>
                <Select
                  value={formData.series}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, series: value }))
                  }
                  disabled={!formData.brand}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn series" />
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
            </div>

            {/* Usage */}
            <div className="space-y-2">
              <Label htmlFor="usage">Mục đích sử dụng</Label>
              <div className="flex flex-wrap gap-2">
                {usageOptions.map((option, index) => {
                  const selected = formData.usage.includes(option.id);
                  return (
                    <Button
                      key={`${option.id}-${index}`}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      onClick={() => toggleUsage(option.id)}
                      className="rounded-full px-3 py-1 text-sm"
                    >
                      {option.name}
                    </Button>
                  );
                })}
              </div>
              {formData.usage.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.usage.map((id) => (
                    <Badge key={id} variant="secondary">
                      {usageOptions.find((u) => u.id === id)?.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Số lượng tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale">Giảm giá (%)</Label>
                <Input
                  id="sale"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sale}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sale: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Hình ảnh sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Kéo thả ảnh vào đây hoặc nhấn để chọn
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Tối đa 6 ảnh, định dạng JPG, PNG (10MB/ảnh)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="image-upload"
              />
              <Label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="cursor-pointer"
                >
                  <span>Chọn ảnh</span>
                </Button>
              </Label>
            </div>

            {images.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge variant="secondary">{images.length}/6</Badge> Ảnh đã
                  tải lên (kéo để sắp xếp)
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
            <CardTitle>Thông số nổi bật</CardTitle>
            <p className="text-sm text-muted-foreground">
              Những thông số quan trọng hiển thị trên thẻ sản phẩm
            </p>
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
                  <Label className="text-sm font-medium">{spec.category}</Label>
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                </div>
                <div className="md:col-span-2">
                  <Input
                    placeholder={`Nhập ${spec.label.toLowerCase()}`}
                    value={spec.value}
                    onChange={(e) => updateDetailSpec(spec.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8 cursor-pointer">
            <Save className="h-4 w-4 mr-2" /> Lưu sản phẩm
          </Button>
        </div>
      </form>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p className="mt-2 text-white font-medium">Đang thêm sản phẩm...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
