export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  avatar?: string;
  addresses?: Address[];
  favourites?: string[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  zip: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "base" | "sauce" | "cheese" | "veggie";
  stock: number;
  threshold: number;
  price: number;
  low_stock_email_sent: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  featured?: boolean;
}

export interface CustomPizza {
  base: string;
  sauce: string;
  cheese: string;
  veggies: string[];
  quantity: number;
  price: number;
}

export type OrderStatus = "received" | "preparing" | "kitchen" | "ready" | "out" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  custom?: CustomPizza;
  productId?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  address?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  order_id: string;
  rating: number;
  review: string;
  created_at: string;
}
