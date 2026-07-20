import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="mt-24 border-t border-border/40 bg-gradient-to-b from-transparent to-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-black text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
              🍕
            </span>
            Pizzaverse
          </div>
          <p className="text-sm text-muted-foreground">
            Crafted with love, delivered hot. Your custom pizza in 30 minutes.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/menu" className="hover:text-foreground">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/build" className="hover:text-foreground">
                Build a Pizza
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-foreground">
                Orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-foreground">
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Connect</h4>
          <div className="flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pizzaverse. All rights reserved.
      </div>
    </footer>
  );
}
