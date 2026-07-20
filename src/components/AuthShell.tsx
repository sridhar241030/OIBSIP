import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
      <div className="absolute -left-24 top-1/4 -z-10 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -right-24 top-1/2 -z-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-border/40 bg-card/60 p-8 shadow-2xl backdrop-blur-2xl">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-black text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
              🍕
            </span>
            Pizzaverse
          </Link>
          <h1 className="text-center text-2xl font-black">{title}</h1>
          {subtitle && <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
