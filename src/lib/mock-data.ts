import type { InventoryItem, Product, User } from "./types";
import { storage, uid } from "./storage";

export const BASES = ["Thin Crust", "Cheese Burst", "Stuffed Crust", "Pan Base", "Whole Wheat"];
export const SAUCES = ["Tomato", "BBQ", "Pesto", "Alfredo", "Garlic"];
export const CHEESES = ["Mozzarella", "Cheddar", "Parmesan", "Blue Cheese", "Vegan Cheese"];
export const VEGGIES = [
  "Onion",
  "Tomato",
  "Capsicum",
  "Mushroom",
  "Jalapeno",
  "Corn",
  "Olive",
  "Paneer",
  "Spinach",
  "Broccoli",
];

export const BASE_PRICE = 149;
export const SAUCE_PRICE = 20;
export const CHEESE_PRICE = 40;
export const VEGGIE_PRICE = 15;
export const GST_RATE = 0.05;
export const DELIVERY_FEE = 40;

const PIZZA_IMG = (seed: string) =>
  `https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&sig=${encodeURIComponent(seed)}`;

const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Margherita Classic",
    description: "Fresh basil, mozzarella, tangy tomato sauce.",
    price: 249,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80",
    category: "Classic",
    featured: true,
    popular: true,
  },
  {
    id: "p2",
    name: "Pepperoni Supreme",
    description: "Loaded pepperoni with molten cheese.",
    price: 349,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
    category: "Non-Veg",
    popular: true,
  },
  {
    id: "p3",
    name: "BBQ Chicken",
    description: "Smoky BBQ sauce, grilled chicken, red onions.",
    price: 379,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    category: "Non-Veg",
    featured: true,
  },
  {
    id: "p4",
    name: "Veggie Delight",
    description: "A garden of fresh vegetables on crispy crust.",
    price: 279,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80",
    category: "Veg",
    popular: true,
  },
  {
    id: "p5",
    name: "Four Cheese",
    description: "Mozzarella, cheddar, parmesan, blue cheese.",
    price: 399,
    image: "https://images.unsplash.com/photo-1548369937-47519962c11a?w=800&q=80",
    category: "Cheese",
    featured: true,
  },
  {
    id: "p6",
    name: "Paneer Tikka",
    description: "Spicy paneer tikka on a tandoori base.",
    price: 329,
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=80",
    category: "Veg",
  },
  {
    id: "p7",
    name: "Mushroom Truffle",
    description: "Wild mushrooms with truffle oil finish.",
    price: 429,
    image: "https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?w=800&q=80",
    category: "Gourmet",
  },
  {
    id: "p8",
    name: "Spicy Jalapeno",
    description: "For heat lovers — jalapenos & chili flakes.",
    price: 299,
    image: PIZZA_IMG("jalapeno"),
    category: "Spicy",
  },
];

const seedInventory: InventoryItem[] = [
  ...BASES.map((n, i) => ({
    id: `b${i}`,
    name: n,
    category: "base" as const,
    stock: 25,
    threshold: 5,
    price: BASE_PRICE,
    low_stock_email_sent: false,
  })),
  ...SAUCES.map((n, i) => ({
    id: `s${i}`,
    name: n,
    category: "sauce" as const,
    stock: 30,
    threshold: 6,
    price: SAUCE_PRICE,
    low_stock_email_sent: false,
  })),
  ...CHEESES.map((n, i) => ({
    id: `c${i}`,
    name: n,
    category: "cheese" as const,
    stock: 20,
    threshold: 5,
    price: CHEESE_PRICE,
    low_stock_email_sent: false,
  })),
  ...VEGGIES.map((n, i) => ({
    id: `v${i}`,
    name: n,
    category: "veggie" as const,
    stock: 40,
    threshold: 8,
    price: VEGGIE_PRICE,
    low_stock_email_sent: false,
  })),
];

const seedAdmin: User = {
  id: "admin",
  name: "Admin",
  email: "admin@pizza.com",
  phone: "0000000000",
  password: "admin123",
  role: "admin",
};

export function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (storage.getProducts().length === 0) storage.setProducts(seedProducts);
  if (storage.getInventory().length === 0) storage.setInventory(seedInventory);
  const users = storage.getUsers();
  if (!users.find((u) => u.email === seedAdmin.email)) {
    storage.setUsers([...users, seedAdmin]);
  }
  // seed a demo user for convenience
  if (!users.find((u) => u.email === "demo@pizza.com")) {
    storage.setUsers([
      ...storage.getUsers(),
      {
        id: uid("u"),
        name: "Demo User",
        email: "demo@pizza.com",
        phone: "9999999999",
        password: "demo1234",
        role: "user",
        addresses: [
          {
            id: uid("a"),
            label: "Home",
            line1: "221B Baker Street",
            city: "London",
            zip: "NW16XE",
          },
        ],
        favourites: ["p1", "p4"],
      },
    ]);
  }
}

export const CATEGORIES = [
  { name: "Classic", icon: "🍕" },
  { name: "Veg", icon: "🥦" },
  { name: "Non-Veg", icon: "🍗" },
  { name: "Cheese", icon: "🧀" },
  { name: "Spicy", icon: "🌶️" },
  { name: "Gourmet", icon: "✨" },
];

export const OFFERS = [
  {
    title: "50% OFF",
    subtitle: "On your first order",
    code: "WELCOME50",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Buy 1 Get 1",
    subtitle: "Every Tuesday special",
    code: "TUESBOGO",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Free Delivery",
    subtitle: "Orders above ₹499",
    code: "FREESHIP",
    color: "from-emerald-500 to-teal-500",
  },
];


export const FAQS = [
  { q: "How long does delivery take?", a: "Most orders arrive in 25–35 minutes." },
  {
    q: "Can I customize my pizza?",
    a: "Absolutely — use our Pizza Builder to design your perfect pie.",
  },
  { q: "Do you offer vegan options?", a: "Yes! We have vegan cheese and plenty of veggies." },
  { q: "How do I track my order?", a: "After placing, visit Orders → view the live timeline." },
  {
    q: "What payment methods work?",
    a: "This demo simulates payment — a real gateway can plug in later.",
  },
];

export const STATUS_FLOW: { key: import("./types").OrderStatus; label: string }[] = [
  { key: "received", label: "Order Received" },
  { key: "preparing", label: "Preparing" },
  { key: "kitchen", label: "In Kitchen" },
  { key: "ready", label: "Ready" },
  { key: "out", label: "Out For Delivery" },
  { key: "delivered", label: "Delivered" },
];
