import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: ProductsPage,
});

const empty: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 199,
  image: "https://images.unsplash.com/photo-1548369937-47519962c11a?w=800&q=80",
  category: "Classic",
  popular: false,
  featured: false,
};

function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [dialog, setDialog] = useState<{ open: boolean; editing?: Product }>({ open: false });
  const [form, setForm] = useState(empty);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [products, q, cat],
  );

  function openAdd() {
    setForm(empty);
    setDialog({ open: true });
  }
  function openEdit(p: Product) {
    setForm(p);
    setDialog({ open: true, editing: p });
  }
  function save() {
    if (!form.name || form.price <= 0) return toast.error("Fill required fields");
    if (dialog.editing) {
      updateProduct({ ...dialog.editing, ...form });
      toast.success("Updated");
    } else {
      addProduct(form);
      toast.success("Created");
    }
    setDialog({ open: false });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="text-muted-foreground">Manage your pizza catalog</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-orange-500 to-red-500">
          <Plus className="mr-1 h-4 w-4" /> Add product
        </Button>
      </div>

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
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {p.description}
                    </div>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell className="text-xs space-x-1">
                    {p.featured && (
                      <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-orange-600">
                        Featured
                      </span>
                    )}
                    {p.popular && (
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-600">
                        Popular
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        deleteProduct(p.id);
                        toast.success("Deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog.editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={!!form.featured}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                />{" "}
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={!!form.popular}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, popular: v }))}
                />{" "}
                Popular
              </label>
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
