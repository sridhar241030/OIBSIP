import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { storage, uid } from "@/lib/storage";
import { seedIfNeeded } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type {
  AppNotification,
  InventoryItem,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  User,
  Review,
} from "@/lib/types";

interface Ctx {
  ready: boolean;
  user: User | null;
  isAdmin: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  users: User[];
  products: Product[];
  inventory: InventoryItem[];
  orders: Order[];
  reviews: Review[];
  notifications: AppNotification[];
  cart: OrderItem[];
  login: (email: string, password: string, adminOnly?: boolean) => Promise<User | null>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  addToCart: (item: OrderItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  placeOrder: (address?: string) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addInventory: (i: Omit<InventoryItem, "id">) => Promise<void>;
  updateInventory: (i: InventoryItem) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  toggleFavourite: (productId: string) => void;
  submitReview: (orderId: string, rating: number, reviewText: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markNotificationsRead: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [supaUser, setSupaUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Fetch the user row from public.users and set state
  async function loadDbUser(authId: string): Promise<User | null> {
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authId)
      .single();
    if (error || !dbUser) return null;
    const u: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      password: "",
      role: dbUser.role,
      avatar: dbUser.avatar ?? undefined,
      addresses: [],
      favourites: [],
    };
    return u;
  }

  useEffect(() => {
    async function loadOrders() {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersData) {
        setOrders(
          ordersData.map((o) => ({
            id: o.id,
            userId: o.user_id,
            userName: o.user_name,
            items: [],
            subtotal: o.subtotal,
            gst: o.gst,
            delivery: o.delivery,
            total: o.total,
            status: o.status,
            createdAt: o.created_at,
            address: o.address,
          })),
        );
      }
    }

    async function loadReviews() {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setReviews(data);
    }

    async function loadInitialData() {
      seedIfNeeded();

      const { data: usersData } = await supabase.from("users").select("*");
      if (usersData) {
        setUsers(
          usersData.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            password: "",
            role: u.role,
            avatar: u.avatar ?? undefined,
            addresses: [],
            favourites: [],
          })),
        );
      }

      const { data: pizzas } = await supabase.from("pizzas").select("*");
      if (pizzas) {
        setProducts(pizzas as Product[]);
      }

      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*");
      if (inventoryError) {
        console.error(inventoryError);
      } else {
        setInventory(inventoryData as InventoryItem[]);
      }

      await loadOrders();
      await loadReviews();
      setNotifications(storage.getNotifications());

      const t = storage.getTheme();
      setTheme(t);
      document.documentElement.classList.toggle("dark", t === "dark");

      // Restore Supabase session — role comes from public.users
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const u = await loadDbUser(sessionData.session.user.id);
        if (u) {
          setSupaUser(u);
          setUsers((prev) => {
            const exists = prev.some((x) => x.id === u.id);
            return exists ? prev.map((x) => (x.id === u.id ? u : x)) : [...prev, u];
          });
        }
      }

      setReady(true);
    }

    loadInitialData();

    // Listen for auth state changes — role comes from public.users
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await loadDbUser(session.user.id);
        if (u) {
          setSupaUser(u);
          setUsers((prev) => {
            const exists = prev.some((x) => x.id === u.id);
            return exists ? prev.map((x) => (x.id === u.id ? u : x)) : [...prev, u];
          });
        }
      } else {
        setSupaUser(null);
      }
    });

    // Realtime orders subscription
    const channel = supabase
      .channel("global_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        loadReviews();
      })
      .subscribe();

    const interval = setInterval(loadOrders, 5000);

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const user = supaUser;
  const isAdmin = supaUser?.role === "admin";

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      storage.setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const persistUsers = (u: User[]) => {
    setUsers(u);
    storage.setUsers(u);
  };
  const persistOrders = (o: Order[]) => {
    setOrders(o);
  };
  const persistProducts = (p: Product[]) => {
    setProducts(p);
  };
const persistInventory = async (i: InventoryItem[]) => {
  setInventory(i);

  for (const item of i) {
    const { error } = await supabase
      .from("inventory")
      .update({
        stock: item.stock,
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
    }
  }
};
  const persistNotifs = (n: AppNotification[]) => {
    setNotifications(n);
    storage.setNotifications(n);
  };

  const login: Ctx["login"] = async (email, password, adminOnly) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    // Block login if email is not confirmed
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      toast.error("Please verify your email before logging in.");
      return null;
    }
    // Role must come from public.users, not from auth metadata
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (dbError || !dbUser) return null;
    const u: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      password: "",
      role: dbUser.role,
      avatar: dbUser.avatar ?? undefined,
      addresses: [],
      favourites: [],
    };
    setSupaUser(u);
    if (adminOnly && u.role !== "admin") {
      await supabase.auth.signOut();
      return null;
    }
    return u;
  };

  const register: Ctx["register"] = async ({ name, email, phone, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role: "user" } },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSupaUser(null);
  };

  const updateUser: Ctx["updateUser"] = (patch) => {
    if (!user) return;
    const updated = users.map((u) => (u.id === user.id ? { ...u, ...patch } : u));
    persistUsers(updated);
  };

  const addToCart: Ctx["addToCart"] = (item) => {
    setCart((c) => [...c, item]);
    toast.success("Added to cart");
  };
  const removeFromCart: Ctx["removeFromCart"] = (id) =>
    setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const decrementInventoryFor = async (items: OrderItem[]) => {
    const inv = [...inventory];
    for (const it of items) {
      if (it.custom) {
        const dec = (name: string) => {
          const idx = inv.findIndex((i) => i.name === name);
          if (idx >= 0)
            inv[idx] = { ...inv[idx], stock: Math.max(0, inv[idx].stock - it.quantity) };
        };
        dec(it.custom.base);
        dec(it.custom.sauce);
        dec(it.custom.cheese);
        it.custom.veggies.forEach(dec);
      }
    }
   await persistInventory(inv);
    // low stock notifs
    inv
      .filter((i) => i.stock <= i.threshold)
      .forEach((i) =>
        addNotificationSilent(`Low stock: ${i.name}`, `Only ${i.stock} left in inventory`),
      );
  };

  const addNotificationSilent = (title: string, body: string) => {
    const n: AppNotification = {
      id: uid("n"),
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => {
      const next = [n, ...prev].slice(0, 40);
      storage.setNotifications(next);
      return next;
    });
  };

  const addNotification: Ctx["addNotification"] = (n) => addNotificationSilent(n.title, n.body);

  const placeOrder: Ctx["placeOrder"] = async (address) => {
    if (!user || cart.length === 0) return null;

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const gst = Math.round(subtotal * 0.05);
    const delivery = subtotal > 499 ? 0 : 40;
    const total = subtotal + gst + delivery;

    // 1. Create order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          user_name: user.name,
          subtotal,
          gst,
          delivery,
          total,
          status: "received",
          address,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      toast.error(orderError?.message ?? "Failed to place order");
      return null;
    }

    // 2. Create order items
    const items = cart.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId ?? null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      is_custom: item.custom ? true : false,
      base: item.custom?.base ?? null,
      sauce: item.custom?.sauce ?? null,
      cheese: item.custom?.cheese ?? null,
      veggies: item.custom?.veggies ?? null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(items);

    if (itemsError) {
      toast.error(itemsError.message);
      return null;
    }

    await decrementInventoryFor(cart);

    addNotificationSilent("Order placed", `Order #${String(orderData.id).slice(-6)} received`);

    clearCart();
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(
        ordersData.map((o) => ({
          id: o.id,
          userId: o.user_id,
          userName: o.user_name,
          items: [],
          subtotal: o.subtotal,
          gst: o.gst,
          delivery: o.delivery,
          total: o.total,
          status: o.status,
          createdAt: o.created_at,
          address: o.address,
        })),
      );
    }
    return {
      id: orderData.id,
      userId: user.id,
      userName: user.name,
      items: cart,
      subtotal,
      gst,
      delivery,
      total,
      status: "received",
      createdAt: orderData.created_at,
      address,
    };
  };

  const updateOrderStatus: Ctx["updateOrderStatus"] = async (id, status) => {
    console.log("Updating Order ID:", id);

    const updated = orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );

    persistOrders(updated);

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();

    console.log("UPDATE DATA:", data);
    console.log("UPDATE ERROR:", error);

    addNotificationSilent(
      "Order updated",
      `#${String(id).slice(-6)} → ${status}`
    );
  };
  const addProduct: Ctx["addProduct"] = async (p) => {
    const { error } = await supabase.from("pizzas").insert([p]);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = await supabase.from("pizzas").select("*");

    if (data) setProducts(data as Product[]);
  };
  const updateProduct: Ctx["updateProduct"] = async (p) => {
    const { error } = await supabase
      .from("pizzas")
      .update({
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        featured: p.featured,
        popular: p.popular,
      })
      .eq("id", p.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = await supabase.from("pizzas").select("*");

    if (data) {
      setProducts(data as Product[]);
    }
  };
  const deleteProduct: Ctx["deleteProduct"] = async (id) => {
    const { error } = await supabase.from("pizzas").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = await supabase.from("pizzas").select("*");

    if (data) {
      setProducts(data as Product[]);
    }
  };
  const addInventory: Ctx["addInventory"] = async (i) => {
    const { error } = await supabase.from("inventory").insert([i]);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = await supabase.from("inventory").select("*");

    if (data) {
      setInventory(data as InventoryItem[]);
    }
  };
  const updateInventory: Ctx["updateInventory"] = async (i) => {
    const { error } = await supabase
      .from("inventory")
   .update({
  name: i.name,
  category: i.category,
  stock: i.stock,
  threshold: i.threshold,
  price: i.price,
  low_stock_email_sent:
    i.stock > i.threshold ? false : i.low_stock_email_sent,
})
      .eq("id", i.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = await supabase.from("inventory").select("*");

    if (data) {
      setInventory(data as InventoryItem[]);
    }
  };
  const deleteInventory: Ctx["deleteInventory"] = async (id) => {
    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = await supabase.from("inventory").select("*");

    if (data) {
      setInventory(data as InventoryItem[]);
    }
  };

  const toggleFavourite: Ctx["toggleFavourite"] = (pid) => {
    if (!user) return;
    const favs = user.favourites ?? [];
    updateUser({ favourites: favs.includes(pid) ? favs.filter((f) => f !== pid) : [...favs, pid] });
  };

  const submitReview: Ctx["submitReview"] = async (orderId, rating, reviewText) => {
    if (!user) return;

    // Check for duplicate review on this order by this user
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      toast.error("You have already reviewed this order.");
      return;
    }

    const { error, data } = await supabase.from("reviews").insert([{
      user_id: user.id,
      user_name: user.name,
      order_id: orderId,
      rating,
      review: reviewText,
    }]).select();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      setReviews(prev => [data[0], ...prev]);
    }
    toast.success("Review submitted! Thank you.");
  };

  const deleteReview: Ctx["deleteReview"] = async (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Review deleted successfully");
  };

  const markNotificationsRead = () => {
    persistNotifs(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppCtx.Provider
      value={{
        ready,
        user,
        isAdmin,
        theme,
        toggleTheme,
        users,
        products,
        inventory,
        orders,
        reviews,
        notifications,
        cart,
        login,
        register,
        logout,
        updateUser,
        addToCart,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addInventory,
        updateInventory,
        deleteInventory,
        toggleFavourite,
        submitReview,
        deleteReview,
        addNotification,
        markNotificationsRead,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
