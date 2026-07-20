import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, PizzaIcon, ShoppingBag, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { PizzaCard } from "@/components/PizzaCard";
import { useApp } from "@/contexts/AppContext";
import { STATUS_FLOW } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Pizzaverse" }] }),
  component: Dash,
});

function Dash() {
  const { user, products, orders, notifications, markNotificationsRead } = useApp();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Please login"
          action={
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.userId === user.id);
  const recent = myOrders.slice(0, 3);
  const current = myOrders.find((o) => o.status !== "delivered");
  const favs = (user.favourites ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);
  const recommended = products.filter((p) => p.popular).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-8 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <h1 className="text-3xl font-black">Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 opacity-90">Hungry? Your favourite pizza is one click away.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link to="/build">
              <Zap className="mr-1 h-4 w-4" />
              Build now
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            asChild
          >
            <Link to="/menu">Browse menu</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Stat icon={ShoppingBag} label="Total orders" value={myOrders.length.toString()} />
        <Stat icon={Heart} label="Favourites" value={(user.favourites?.length ?? 0).toString()} />
        <Stat
          icon={PizzaIcon}
          label="Spend"
          value={`₹${myOrders.reduce((s, o) => s + o.total, 0)}`}
        />
      </div>

      {current && (
        <Card className="mt-6 border-border/40 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Current order</div>
              <div className="mt-1 text-lg font-bold">#{current.id.slice(-6)}</div>
              <Badge className="mt-2">
                {STATUS_FLOW.find((s) => s.key === current.status)?.label}
              </Badge>
            </div>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500">
              <Link to="/orders">
                View Orders
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {recommended.length > 0 && (
            <>
              <h2 className="mb-4 text-xl font-bold">Recommended for you</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((p) => (
                  <PizzaCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}

          {favs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Your favourites</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favs.map((p) => p && <PizzaCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold">Recent orders</h2>
            {recent.length === 0 ? (
              <EmptyState
                title="No orders yet"
                action={
                  <Button asChild>
                    <Link to="/menu">Order now</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {recent.map((o) => (
                  <Card
                    key={o.id}
                    className="flex items-center justify-between border-border/40 bg-card/60 p-4 backdrop-blur"
                  >
                    <div>
                      <div className="font-semibold">#{o.id.slice(-6)}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.items.length} items · ₹{o.total}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <Card className="h-fit border-border/40 bg-card/60 p-6 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Bell className="h-4 w-4" /> Notifications
            </div>
            <Button size="sm" variant="ghost" onClick={markNotificationsRead}>
              Mark read
            </Button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 12).map((n) => (
                <div key={n.id} className="rounded-lg bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{n.title}</div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-4 border-border/40 bg-card/60 p-5 backdrop-blur">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-black">{value}</div>
      </div>
    </Card>
  );
}
