import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin" }] }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const { reviews, deleteReview } = useApp();
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Customer Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">{reviews.length} total reviews</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="w-[150px]">Customer</TableHead>
              <TableHead className="w-[200px]">Items</TableHead>
              <TableHead className="w-[120px]">Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="w-[140px]">Order ID</TableHead>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((r) => (
                <TableRow key={r.id} className="border-border/40 hover:bg-muted/50">
                  <TableCell className="font-medium">{r.user_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {orderItemNames[r.order_id] ? (
                      <ul className="list-disc list-inside">
                        {orderItemNames[r.order_id].map((name, i) => (
                          <li key={i} className="truncate">{name}</li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-muted opacity-30"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">{r.review}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    #{r.order_id.slice(-6)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(r.created_at), "dd MMM yyyy, p")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this review?")) {
                          deleteReview(r.id);
                        }
                      }}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
