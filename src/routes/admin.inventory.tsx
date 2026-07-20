import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import type { InventoryItem } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Admin" }] }),
  component: InventoryPage,
});

const empty: Omit<InventoryItem, "id"> = {
  name: "",
  category: "veggie",
  stock: 10,
  threshold: 5,
  price: 0,
  low_stock_email_sent: false,
};

function InventoryPage() {
  const { inventory, addInventory, updateInventory, deleteInventory } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"name" | "stock">("name");
  const [dialog, setDialog] = useState<{ open: boolean; editing?: InventoryItem }>({ open: false });
  const [form, setForm] = useState(empty);

  const filtered = useMemo(() => {
    return inventory
      .filter(
        (i) =>
          (cat === "all" || i.category === cat) && i.name.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : a.stock - b.stock));
  }, [inventory, q, cat, sort]);

  const low = inventory.filter((i) => i.stock <= i.threshold);

  function openAdd() {
    setForm(empty);
    setDialog({ open: true });
  }
  function openEdit(it: InventoryItem) {
    setForm(it);
    setDialog({ open: true, editing: it });
  }
  function save() {
    if (!form.name) return toast.error("Name required");
    if (dialog.editing) {
      updateInventory({ ...dialog.editing, ...form });
      toast.success("Updated");
    } else {
      addInventory(form);
      toast.success("Added");
    }
    setDialog({ open: false });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Inventory</h1>
          <p className="text-muted-foreground">Manage stock levels</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-orange-500 to-red-500">
          <Plus className="mr-1 h-4 w-4" /> Add item
        </Button>
      </div>

      {low.length > 0 && (
        <Card className="mb-6 border-orange-500/30 bg-orange-500/10 p-4">
          <div className="flex items-center gap-2 font-semibold text-orange-600">
            <AlertTriangle className="h-4 w-4" /> {low.length} items low on stock
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {low.map((i) => (
              <Badge key={i.id} variant="outline" className="border-orange-500/40">
                {i.name} · {i.stock}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="border-border/40 bg-card/60 p-6 backdrop-blur">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="base">Bases</SelectItem>
              <SelectItem value="sauce">Sauces</SelectItem>
              <SelectItem value="cheese">Cheeses</SelectItem>
              <SelectItem value="veggie">Veggies</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as "name" | "stock")}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="stock">Sort: Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => {
                const lowFlag = i.stock <= i.threshold;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{i.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={lowFlag ? "font-bold text-orange-500" : ""}>{i.stock}</span>
                      {lowFlag && (
                        <Badge className="ml-2 bg-orange-500/20 text-orange-600">Low</Badge>
                      )}
                    </TableCell>
                    <TableCell>{i.threshold}</TableCell>
                    <TableCell>₹{i.price}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(i)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          deleteInventory(i.id);
                          toast.success("Deleted");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.editing ? "Edit item" : "Add inventory item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as InventoryItem["category"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="sauce">Sauce</SelectItem>
                  <SelectItem value="cheese">Cheese</SelectItem>
                  <SelectItem value="veggie">Veggie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: +e.target.value }))}
              />
            </div>
            <div>
              <Label>Threshold</Label>
              <Input
                type="number"
                value={form.threshold}
                onChange={(e) => setForm((f) => ({ ...f, threshold: +e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} className="bg-gradient-to-r from-orange-500 to-red-500">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
