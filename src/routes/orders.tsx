import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, Search, CreditCard, Lock, X, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { uid } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { STATUS_FLOW } from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your Orders — Pizzaverse" },
      { name: "description", content: "Your cart and past orders." },
    ],
  }),
  component: OrdersPage,
});

const statusColor: Record<OrderStatus, string> = {
  received: "bg-blue-500/15 text-blue-600",
  preparing: "bg-yellow-500/15 text-yellow-600",
  kitchen: "bg-orange-500/15 text-orange-600",
  ready: "bg-purple-500/15 text-purple-600",
  out: "bg-cyan-500/15 text-cyan-600",
  delivered: "bg-green-500/15 text-green-600",
};

// ─── Razorpay Test Mode Payment Modal ───────────────────────────────────────
function RazorpayModal({
  total,
  onSuccess,
  onClose,
}: {
  total: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  function formatCard(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }
  function formatExpiry(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 4)
      .replace(/^(\d{2})(\d)/, "$1/$2");
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (card.number.replace(/\s/g, "").length < 16)
      return toast.error("Enter a valid 16-digit card number");
    if (card.expiry.length < 5) return toast.error("Enter a valid expiry date");
    if (card.cvv.length < 3) return toast.error("Enter a valid CVV");
    if (!card.name.trim()) return toast.error("Enter cardholder name");

    setPaying(true);
    // Simulate Razorpay payment processing delay
    await new Promise((r) => setTimeout(r, 1800));
    setPaid(true);
    await new Promise((r) => setTimeout(r, 800));
    setPaying(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        {/* Razorpay Header */}
        <div className="relative bg-[#072654] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">rzp</span>
                <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  Test Mode
                </span>
              </div>
              <div className="mt-0.5 text-xs text-white/60">Powered by Razorpay</div>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
            <div>
              <div className="text-xs text-white/60">Total Amount</div>
              <div className="text-2xl font-black text-white">₹{total.toLocaleString()}</div>
            </div>
            <div className="text-right text-xs text-white/50">
              <div>Pizzaverse</div>
              <div>Order Payment</div>
            </div>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/30 px-6 py-2 text-center">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            🔒 Test Mode — Use any card details below
          </span>
        </div>

        {/* Payment Form */}
        <form onSubmit={pay} className="px-6 py-5 space-y-4">
          {paid ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-500/15 text-green-600 text-3xl">
                ✓
              </div>
              <div className="mt-3 text-lg font-bold text-green-600">Payment Successful!</div>
              <div className="mt-1 text-sm text-muted-foreground">Placing your order…</div>
            </div>
          ) : (
            <>
              {/* Card Number */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Card Number
                </label>
                <div className="relative">
                  <Input
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: formatCard(e.target.value) }))}
                    placeholder="4111 1111 1111 1111"
                    className="pr-10 font-mono"
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Test: 4111 1111 1111 1111</p>
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Expiry
                  </label>
                  <Input
                    value={card.expiry}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Test: 12/26</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    CVV
                  </label>
                  <Input
                    value={card.cvv}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                    }
                    placeholder="123"
                    maxLength={4}
                    type="password"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Test: 123</p>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Cardholder Name
                </label>
                <Input
                  value={card.name}
                  onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Name on card"
                />
              </div>

              {/* Pay Button */}
              <Button
                type="submit"
                disabled={paying}
                className="w-full bg-[#072654] hover:bg-[#0a3270] text-white font-bold py-6 text-base rounded-xl transition"
              >
                {paying ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Pay ₹{total.toLocaleString()}
                  </span>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Secured by Razorpay · 256-bit SSL encryption
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

function OrdersPage() {
  const { cart, removeFromCart, placeOrder, orders, user, addToCart, submitReview, reviews } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [showPayment, setShowPayment] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [myOrders, setMyOrders] = useState(orders);
  // Map of orderId -> array of item names fetched from order_items
  const [orderItemNames, setOrderItemNames] = useState<Record<string, string[]>>({});
  // Set of order IDs the current user has already reviewed
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadMyOrders() {
      if (!user) {
        setMyOrders([]);
        setOrderItemNames({});
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !data) return;

      setMyOrders(
        data.map((o) => ({
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

      // Fetch item names for all of this user's orders in one query
      const orderIds = data.map((o) => o.id);
      if (orderIds.length > 0) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("order_id, name")
          .in("order_id", orderIds);

        if (itemRows) {
          const map: Record<string, string[]> = {};
          for (const row of itemRows) {
            if (!map[row.order_id]) map[row.order_id] = [];
            map[row.order_id].push(row.name);
          }
          setOrderItemNames(map);
        }
      }

      // Fetch which orders this user has already reviewed
      const { data: reviewRows } = await supabase
        .from("reviews")
        .select("order_id")
        .eq("user_id", user.id);

      if (reviewRows) {
        setReviewedOrderIds(new Set(reviewRows.map((r) => r.order_id)));
      }
    }

    loadMyOrders();

    const channel = supabase
      .channel("user_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadMyOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        loadMyOrders();
      })
      .subscribe();

    const interval = setInterval(loadMyOrders, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  const filtered = useMemo(() => {
    return myOrders.filter((o) => {
      const matchQ =
        o.id.toLowerCase().includes(q.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(q.toLowerCase()));
      const matchS = status === "all" || o.status === status;
      return matchQ && matchS;
    });
  }, [myOrders, q, status]);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const total = subtotal + gst + delivery;

  // Called when user clicks "Place Order" — opens payment modal
  function openPayment() {
    if (!user) {
      toast.error("Login first");
      navigate({ to: "/login" });
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setShowPayment(true);
  }

  // Called after Razorpay mock payment succeeds — calls EXISTING placeOrder (untouched)
  async function onPaymentSuccess() {
    setShowPayment(false);
    const order = await placeOrder(user?.addresses?.[0]?.line1);
    if (order) {
      toast.success("Order placed!");
    }
  }

  function reorder(orderId: string) {
    const o = orders.find((x) => x.id === orderId);
    if (!o) return;
    o.items.forEach((it) => addToCart({ ...it, id: uid("i") }));
  }

  async function handleSubmitReview() {
    if (!reviewOrder || !reviewText.trim()) return;
    await submitReview(reviewOrder, reviewRating, reviewText);
    setReviewedOrderIds(prev => new Set([...prev, reviewOrder]));
    setReviewOrder(null);
    setReviewText("");
    setReviewRating(5);
  }

  return (
    <>
      {showPayment && (
        <RazorpayModal
          total={total}
          onSuccess={onPaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      <Dialog open={!!reviewOrder} onOpenChange={(o) => !o && setReviewOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              How was your pizza? Let us know what you think.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${star <= reviewRating ? "fill-yellow-500 text-yellow-500" : "text-muted opacity-30"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOrder(null)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-500"
              disabled={!reviewText.trim()}
              onClick={handleSubmitReview}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl font-black tracking-tight">Your orders</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
              <h2 className="mb-4 text-lg font-bold">Cart</h2>
              {cart.length === 0 ? (
                <EmptyState
                  title="Your cart is empty"
                  description="Add pizzas from the menu or build one."
                  action={
                    <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500">
                      <Link to="/build">Build a pizza</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div key={i.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl">
                        🍕
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{i.name}</div>
                        {i.custom && (
                          <div className="truncate text-xs text-muted-foreground">
                            {i.custom.base} · {i.custom.sauce} · {i.custom.cheese}
                            {i.custom.veggies.length > 0 &&
                              ` · +${i.custom.veggies.length} veggies`}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{i.price * i.quantity}</div>
                        <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeFromCart(i.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="mt-6 border-border/40 bg-card/60 p-6 backdrop-blur">
              <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <h2 className="text-lg font-bold">Order history</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search"
                      className="pl-9 w-48"
                    />
                  </div>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {STATUS_FLOW.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!user ? (
                <EmptyState
                  title="Please login"
                  description="Sign in to see your order history."
                  action={
                    <Button asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                  }
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Once you order, they'll appear here."
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {pageItems.map((o) => (
                      <div
                        key={o.id}
                        className="flex flex-col gap-3 rounded-xl border border-border/40 p-4 md:flex-row md:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">#{o.id.slice(-6)}</span>
                            <Badge className={statusColor[o.status]}>
                              {STATUS_FLOW.find((s) => s.key === o.status)?.label}
                            </Badge>
                          </div>
                          <div className="mt-1 truncate text-sm text-muted-foreground">
                            {(() => {
                              const names = orderItemNames[o.id];
                              if (!names || names.length === 0) return <span className="italic">—</span>;
                              if (names.length === 1) return names[0];
                              return `${names[0]} +${names.length - 1} more`;
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(o.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <div className="font-bold">₹{o.total}</div>
                            <div className="text-xs text-muted-foreground">
                              {(orderItemNames[o.id] ?? []).length} items
                            </div>
                          </div>
                          {o.status === "delivered" && !reviewedOrderIds.has(o.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-orange-500 hover:text-orange-600 border-orange-200 hover:bg-orange-50"
                              onClick={() => setReviewOrder(o.id)}
                            >
                              <MessageSquare className="mr-1.5 h-3 w-3" /> Write Review
                            </Button>
                          )}
                          {o.status === "delivered" && reviewedOrderIds.has(o.id) && (
                            <span className="text-xs text-green-600 font-medium">✓ Reviewed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <Card className="sticky top-20 h-fit border-border/40 bg-card/60 p-6 backdrop-blur">
            <h3 className="font-bold">Order summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Line label="Subtotal" v={subtotal} />
              <Line label="GST (5%)" v={gst} />
              <Line label="Delivery" v={delivery} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="font-semibold">Grand total</span>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                ₹{total}
              </span>
            </div>
            <Button
              className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500"
              onClick={openPayment}
              disabled={cart.length === 0}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Proceed to Payment
            </Button>
            <Button variant="outline" className="mt-2 w-full" asChild>
              <Link to="/build">Edit / build more</Link>
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}

function Line({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>₹{v}</span>
    </div>
  );
}

// unused import guard for Minus/Plus
export const _icons = { Minus, Plus };
