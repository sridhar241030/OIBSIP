import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Pizzaverse" }] }),
  component: AdminDash,
});

function AdminDash() {
  const { orders, inventory } = useApp();
  const lowStock = inventory.filter((i) => i.stock <= i.threshold);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={orders.length.toString()}
          accent="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={lowStock.length.toString()}
          accent="from-orange-500 to-red-500"
        />
      </div>

      {lowStock.length > 0 && (
        <Card className="mt-6 border-orange-500/30 bg-orange-500/5 p-4">
          <div className="flex items-center gap-2 font-semibold text-orange-600">
            <AlertTriangle className="h-4 w-4" /> Inventory alert
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <Badge key={i.id} variant="secondary">
                {i.name} · {i.stock} left
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="border-border/40 bg-card/60 p-5 backdrop-blur">
      <div
        className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </Card>
  );
}
