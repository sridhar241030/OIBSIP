import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/contexts/AppContext";
import type { OrderStatus } from "@/lib/types";
import { STATUS_FLOW } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const { orders, updateOrderStatus } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  // Map of orderId -> array of item objects
  const [orderItemsData, setOrderItemsData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    async function loadAllOrderItems() {
      const { data, error } = await supabase
        .from("order_items")
        .select("*");
      if (error || !data) return;
      const map: Record<string, any[]> = {};
      for (const row of data) {
        if (!map[row.order_id]) map[row.order_id] = [];
        map[row.order_id].push(row);
      }
      setOrderItemsData(map);
    }
    loadAllOrderItems();
  }, []);
  const per = 10;

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          (o.id.toLowerCase().includes(q.toLowerCase()) ||
            o.userName.toLowerCase().includes(q.toLowerCase())),
      ),
    [orders, q, status],
  );
  const pageItems = filtered.slice((page - 1) * per, page * per);
  const totalPages = Math.max(1, Math.ceil(filtered.length / per));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Orders</h1>
        <p className="text-muted-foreground">Manage every order in real time</p>
      </div>

      <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by id or customer"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
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

        {filtered.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Once customers order, they'll appear here."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#{o.id.slice(-6)}</TableCell>
                      <TableCell>{o.userName}</TableCell>
                      <TableCell className="max-w-xs align-top py-4">
                        {orderItemsData[o.id] ? (
                          <div className="space-y-4">
                            {orderItemsData[o.id].map((item, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="font-semibold text-foreground mb-1">
                                  Item {idx + 1}
                                </div>
                                <div className="font-medium text-foreground">
                                  {item.is_custom ? "🍕 " + item.name : item.name}
                                </div>
                                {item.is_custom ? (
                                  <div className="mt-1 space-y-0.5 text-muted-foreground">
                                    {item.base && <div>Base: {item.base}</div>}
                                    {item.sauce && <div>Sauce: {item.sauce}</div>}
                                    {item.cheese && <div>Cheese: {item.cheese}</div>}
                                    {item.veggies && item.veggies.length > 0 && (
                                      <div>
                                        <div>Veggies:</div>
                                        <ul className="ml-1">
                                          {item.veggies.map((v: string, i: number) => (
                                            <li key={i}>- {v}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    <div className="mt-1 text-foreground font-medium">Qty: {item.quantity}</div>
                                  </div>
                                ) : (
                                  <div className="mt-1 text-muted-foreground">Qty: {item.quantity}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell>₹{o.total}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={o.status}
                          onValueChange={(v) => updateOrderStatus(o.id, v as OrderStatus)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue>
                              <Badge variant="outline">
                                {STATUS_FLOW.find((s) => s.key === o.status)?.label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_FLOW.map((s) => (
                              <SelectItem key={s.key} value={s.key}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
