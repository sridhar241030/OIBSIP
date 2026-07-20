import type { AppNotification, InventoryItem, Order, Product, User } from "./types";

const KEYS = {
  users: "pz_users",
  session: "pz_session",
  inventory: "pz_inventory",
  products: "pz_products",
  orders: "pz_orders",
  notifications: "pz_notifications",
  theme: "pz_theme",
  settings: "pz_settings",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

export const storage = {
  keys: KEYS,
  getUsers: () => read<User[]>(KEYS.users, []),
  setUsers: (u: User[]) => write(KEYS.users, u),
  getSession: () => read<{ userId: string; role: "user" | "admin" } | null>(KEYS.session, null),
  setSession: (s: { userId: string; role: "user" | "admin" } | null) => write(KEYS.session, s),
  getInventory: () => read<InventoryItem[]>(KEYS.inventory, []),
  setInventory: (i: InventoryItem[]) => write(KEYS.inventory, i),
  getProducts: () => read<Product[]>(KEYS.products, []),
  setProducts: (p: Product[]) => write(KEYS.products, p),
  getOrders: () => read<Order[]>(KEYS.orders, []),
  setOrders: (o: Order[]) => write(KEYS.orders, o),
  getNotifications: () => read<AppNotification[]>(KEYS.notifications, []),
  setNotifications: (n: AppNotification[]) => write(KEYS.notifications, n),
  getTheme: () => read<"light" | "dark">(KEYS.theme, "light"),
  setTheme: (t: "light" | "dark") => write(KEYS.theme, t),
  getSettings: () =>
    read<{ threshold: number; emailNotif: boolean; pushNotif: boolean }>(KEYS.settings, {
      threshold: 5,
      emailNotif: true,
      pushNotif: true,
    }),
  setSettings: (s: { threshold: number; emailNotif: boolean; pushNotif: boolean }) =>
    write(KEYS.settings, s),
};

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
