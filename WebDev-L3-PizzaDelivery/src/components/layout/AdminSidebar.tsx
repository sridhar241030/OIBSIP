import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Pizza,
  Settings,
  LogOut,
  Menu as MenuIcon,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/products", label: "Products", icon: Pizza },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function NavList({ onClick }: { onClick?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((it) => {
        const active = it.exact ? path === it.to : path.startsWith(it.to);
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-r from-orange-500/15 to-red-500/15 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const { logout, user } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/40 bg-background/80 backdrop-blur-xl md:flex">
        <Link
          to="/admin"
          className="flex h-16 items-center gap-2 border-b border-border/40 px-4 font-black"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            🍕
          </span>
          Pizzaverse<span className="text-xs text-muted-foreground">Admin</span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="border-t border-border/40 p-3">
          <div className="mb-2 truncate px-3 text-xs text-muted-foreground">{user?.email}</div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={async () => {
              await logout();
              navigate({ to: "/admin/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavList onClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="text-sm font-medium">Admin Console</div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/" })}>
              View site
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
