export type OrderStatus = "Thanh toán thất bại" | "Thanh toán thành công";
export type PaymentMethod = "COD" | "Online";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  recipientName: string;
  phone: string;
  city?: string;
  district?: string;
  street?: string;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  OrderItems?: OrderItem[];
}
