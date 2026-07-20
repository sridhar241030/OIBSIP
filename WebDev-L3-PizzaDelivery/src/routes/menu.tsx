import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PizzaCard } from "@/components/PizzaCard";
import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/contexts/AppContext";
import { CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Pizzaverse" },
      { name: "description", content: "Our full pizza menu." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { products } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQ =
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.description.toLowerCase().includes(q.toLowerCase());
      const matchC = cat === "All" || p.category === cat;
      return matchQ && matchC;
    });
  }, [products, q, cat]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Our Menu</h1>
          <p className="mt-1 text-muted-foreground">Fresh from our oven to your door</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pizzas..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
          <Button
            key={c}
            size="sm"
            variant={cat === c ? "default" : "outline"}
            className={cat === c ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
            onClick={() => setCat(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No pizzas found" description="Try a different search or category." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PizzaCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
