import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus, Star } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { uid } from "@/lib/storage";

export function PizzaCard({ product }: { product: Product }) {
  const { user, toggleFavourite, addToCart } = useApp();
  const fav = user?.favourites?.includes(product.id);
  return (
    <Card className="group overflow-hidden border-border/40 bg-card/60 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={() => toggleFavourite(product.id)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-red-500 shadow-lg backdrop-blur hover:bg-white"
          aria-label="Toggle favourite"
        >
          <Heart className={cn("h-4 w-4", fav && "fill-current")} />
        </button>
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow">
          <Star className="mr-1 inline h-3 w-3 fill-yellow-500 text-yellow-500" />
          4.{Math.floor(Math.random() * 5) + 3}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-bold">{product.name}</h3>
            <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
          </div>
          <div className="text-right">
            <div className="font-black text-lg">₹{product.price}</div>
          </div>
        </div>
        <Button
          className="mt-3 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
          onClick={() =>
            addToCart({
              id: uid("i"),
              name: product.name,
              price: product.price,
              quantity: 1,
              productId: product.id,
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add to cart
        </Button>
      </div>
    </Card>
  );
}
