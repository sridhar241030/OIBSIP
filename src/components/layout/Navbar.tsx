import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Moon,
  Sun,
  Menu as MenuIcon,
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/build", label: "Build Pizza" },
  { to: "/orders", label: "Orders" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const { user, theme, toggleTheme, cart, logout, notifications } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  if (path.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
            🍕
          </span>
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Pizzaverse
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
                path === l.to && "bg-accent text-accent-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/orders" })}
            className="relative"
          >
            <ShoppingBag className="h-4 w-4" />
            {cart.length > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs">
                {cart.length}
              </Badge>
            )}
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/dashboard" })}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs">
                  {unread}
                </Badge>
              )}
            </Button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Hi, {user.name.split(" ")[0]}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>
                  Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/register" })}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
              >
                Register
              </Button>
            </div>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 border-t pt-4">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm block hover:bg-accent"
                  >
                    Profile
                  </Link>
                  {!user && (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm block hover:bg-accent"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm block hover:bg-accent"
                      >
                        Register
                      </Link>
                    </>
                  )}
                  <Link
                    to="/admin/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm block hover:bg-accent text-muted-foreground"
                  >
                    Admin Portal
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
