import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { uid } from "@/lib/storage";
import {
  BASE_PRICE,
  SAUCE_PRICE,
  CHEESE_PRICE,
  VEGGIE_PRICE,
  
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Build a Pizza — Pizzaverse" },
      { name: "description", content: "Design your own custom pizza." },
    ],
  }),
  component: Build,
});

const STEPS = ["Base", "Sauce", "Cheese", "Veggies", "Review"];

function Build() {
  const { addToCart, inventory, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [base, setBase] = useState<string>("");
  const [sauce, setSauce] = useState<string>("");
  const [cheese, setCheese] = useState<string>("");
  const [veggies, setVeggies] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const unit =
    BASE_PRICE +
    (sauce ? SAUCE_PRICE : 0) +
    (cheese ? CHEESE_PRICE : 0) +
    veggies.length * VEGGIE_PRICE;
  const price = unit * qty;
  const stockOf = (name: string) => inventory.find((i) => i.name === name)?.stock ?? 99;
const bases = inventory
  .filter((i) => i.category === "base")
  .map((i) => i.name);

const sauces = inventory
  .filter((i) => i.category === "sauce")
  .map((i) => i.name);

const cheeses = inventory
  .filter((i) => i.category === "cheese")
  .map((i) => i.name);

const veggiesList = inventory
  .filter((i) => i.category === "veggie")
  .map((i) => i.name);
  const canNext = useMemo(() => {
    if (step === 0) return !!base;
    if (step === 1) return !!sauce;
    if (step === 2) return !!cheese;
    return true;
  }, [step, base, sauce, cheese]);

  function toggleVeg(v: string) {
    setVeggies((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function place() {
    if (!user) {
      toast.error("Please login to add to cart");
      navigate({ to: "/login" });
      return;
    }
    addToCart({
      id: uid("i"),
      name: `Custom ${base} Pizza`,
      price: unit,
      quantity: qty,
      custom: { base, sauce, cheese, veggies, quantity: qty, price: unit },
    });
    navigate({ to: "/orders" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Build your pizza</h1>
        <p className="mt-1 text-muted-foreground">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
          {step === 0 && (
            <OptionGrid
              title="Choose your base"
              options={bases}
              value={base}
              onChange={setBase}
              price={BASE_PRICE}
              stock={stockOf}
            />
          )}
          {step === 1 && (
            <OptionGrid
              title="Choose your sauce"
              options={sauces}
              value={sauce}
              onChange={setSauce}
              price={SAUCE_PRICE}
              stock={stockOf}
            />
          )}
          {step === 2 && (
            <OptionGrid
              title="Choose your cheese"
              options={cheeses}
              value={cheese}
              onChange={setCheese}
              price={CHEESE_PRICE}
              stock={stockOf}
            />
          )}
          {step === 3 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Add veggies</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {veggiesList.map((v) => {
                  const active = veggies.includes(v);
                  const out = stockOf(v) <= 0;
                  return (
                    <button
                      key={v}
                      disabled={out}
                      onClick={() => toggleVeg(v)}
                      className={cn(
                        "group relative flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all",
                        active
                          ? "border-orange-500 bg-orange-500/10 shadow-lg"
                          : "border-border/40 hover:border-orange-500/50",
                        out && "opacity-40",
                      )}
                    >
                      {active && (
                        <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <span className="text-3xl">🥬</span>
                      <span className="mt-2 font-semibold">{v}</span>
                      <span className="text-xs text-muted-foreground">+₹{VEGGIE_PRICE}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Review your creation</h2>
              <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                <Row label="Base" value={base} price={BASE_PRICE} />
                <Row label="Sauce" value={sauce} price={SAUCE_PRICE} />
                <Row label="Cheese" value={cheese} price={CHEESE_PRICE} />
                <Row
                  label="Veggies"
                  value={veggies.join(", ") || "None"}
                  price={veggies.length * VEGGIE_PRICE}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="bg-gradient-to-r from-orange-500 to-red-500"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={place} className="bg-gradient-to-r from-orange-500 to-red-500">
                Add to cart
              </Button>
            )}
          </div>
        </Card>

        <Card className="sticky top-20 h-fit border-border/40 bg-card/60 p-6 backdrop-blur">
          <h3 className="font-bold">Your pizza</h3>
          <div className="my-4 grid aspect-square place-items-center rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 text-7xl">
            🍕
          </div>
          <div className="space-y-2 text-sm">
            <SummaryLine label="Base" value={base || "—"} />
            <SummaryLine label="Sauce" value={sauce || "—"} />
            <SummaryLine label="Cheese" value={cheese || "—"} />
            <SummaryLine label="Veggies" value={veggies.length ? `${veggies.length} items` : "—"} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 p-3">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              ₹{price}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OptionGrid({
  title,
  options,
  value,
  onChange,
  price,
  stock,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  price: number;
  stock: (n: string) => number;
}) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {options.map((o) => {
          const s = stock(o);
          const out = s <= 0;
          return (
            <button
              key={o}
              disabled={out}
              onClick={() => onChange(o)}
              className={cn(
                "group relative flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all",
                value === o
                  ? "border-orange-500 bg-orange-500/10 shadow-lg"
                  : "border-border/40 hover:border-orange-500/50",
                out && "opacity-40",
              )}
            >
              <div>
                <div className="font-semibold">{o}</div>
                <div className="text-xs text-muted-foreground">+₹{price}</div>
              </div>
              {s <= 3 && s > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Low stock
                </Badge>
              )}
              {value === o && (
                <div className="ml-2 grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, price }: { label: string; value: string; price: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value} <span className="text-muted-foreground">— ₹{price}</span>
      </span>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[180px] truncate font-medium">{value}</span>
    </div>
  );
}
