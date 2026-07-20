import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Shield, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PizzaCard } from "@/components/PizzaCard";
import { useApp } from "@/contexts/AppContext";
import { CATEGORIES, FAQS, OFFERS } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pizzaverse — Order the perfect pizza in 30 minutes" },
      {
        name: "description",
        content: "Custom pizzas, live tracking, and hot delivery. Build, order, and enjoy.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { products, reviews } = useApp();
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const popular = products.filter((p) => p.popular).slice(0, 4);

  const [orderItemNames, setOrderItemNames] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadItems() {
      const orderIds = reviews.map(r => r.order_id);
      if (orderIds.length === 0) return;
      const { data } = await supabase.from("order_items").select("order_id, name").in("order_id", orderIds);
      if (data) {
        const map: Record<string, string[]> = {};
        for (const row of data) {
          if (!map[row.order_id]) map[row.order_id] = [];
          map[row.order_id].push(row.name);
        }
        setOrderItemNames(map);
      }
    }
    loadItems();
  }, [reviews]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent" />
        <div className="absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -right-24 top-40 -z-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-[8px]">
                ★
              </span>
              Rated #1 pizza builder of the year
            </div>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Build the pizza{" "}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                of your dreams
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Fresh dough, premium toppings, and delivery in 30 minutes. Design your own or pick
              from our chef's favourites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 hover:opacity-90"
              >
                <Link to="/build">
                  Build a pizza <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/menu">Browse menu</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[
                { n: "50K+", l: "Happy foodies" },
                { n: "30 min", l: "Avg delivery" },
                { n: "4.9★", l: "Rating" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-border/40 bg-background/50 p-3 backdrop-blur"
                >
                  <div className="text-xl font-black">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500 blur-3xl opacity-30" />
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80"
                alt="Delicious pizza"
                className="relative h-full w-full rounded-full object-cover shadow-2xl animate-fade-in"
              />
              <Card className="absolute -left-4 top-16 flex items-center gap-2 rounded-2xl border-border/40 bg-background/80 p-3 backdrop-blur-xl shadow-xl">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-green-500/20 text-green-600">
                  ✓
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Order confirmed</div>
                  <div className="text-muted-foreground">Delivered in 28 min</div>
                </div>
              </Card>
              <Card className="absolute -right-4 bottom-16 flex items-center gap-2 rounded-2xl border-border/40 bg-background/80 p-3 backdrop-blur-xl shadow-xl">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-500/20 text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold">4.9 rating</div>
                  <div className="text-muted-foreground">12,304 orders</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHead title="Explore by category" subtitle="Something for every craving" />
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              to="/menu"
              key={c.name}
              className="group flex flex-col items-center rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur transition-all hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg"
            >
              <span className="text-3xl transition-transform group-hover:scale-125">{c.icon}</span>
              <span className="mt-2 text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHead title="Featured pizzas" subtitle="Chef's hand-picked favourites" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PizzaCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHead title="Hot deals" subtitle="Save more, eat more" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {OFFERS.map((o) => (
            <div
              key={o.code}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${o.color} p-6 text-white shadow-xl`}
            >
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="text-3xl font-black">{o.title}</div>
              <div className="mt-1 text-sm opacity-90">{o.subtitle}</div>
              <div className="mt-6 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-mono">
                CODE: {o.code}
              </div>
            </div>
          ))}
        </div>
      </section>

      {popular.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHead title="Popular items" subtitle="What everyone's ordering right now" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <PizzaCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHead title="Why Pizzaverse" subtitle="We obsess over every slice" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { icon: Clock, title: "30-min delivery", desc: "Or your next pizza is free." },
            { icon: Shield, title: "Premium ingredients", desc: "Sourced fresh every morning." },
            { icon: Truck, title: "Live tracking", desc: "See your pizza journey in real-time." },
          ].map((f) => (
            <Card key={f.title} className="border-border/40 bg-card/60 p-6 backdrop-blur">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHead title="Loved by thousands" subtitle="Real reviews from real foodies" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            reviews.slice(0, 6).map((t) => (
              <Card key={t.id} className="border-border/40 bg-card/60 p-6 backdrop-blur flex flex-col">
                <div className="flex gap-1 text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < t.rating ? "fill-current" : "text-muted opacity-30"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm flex-1">"{t.review}"</p>
                <div className="mt-6">
                  <div className="text-sm font-semibold">{t.user_name}</div>
                  {orderItemNames[t.order_id] && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {orderItemNames[t.order_id].join(" • ")}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(t.created_at), "dd MMM yyyy")}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <SectionHead title="Frequently asked" subtitle="Answers to what you're wondering" />
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-black md:text-4xl">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
