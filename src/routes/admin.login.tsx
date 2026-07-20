import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin login — Pizzaverse" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative grid min-h-screen place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-white">
      <div className="absolute inset-0 -z-0 opacity-20">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-orange-500 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-red-500 blur-3xl" />
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const u = await login(email, password, true);
          if (!u) return toast.error("Invalid admin credentials");
          toast.success("Welcome, admin");
          navigate({ to: "/admin" });
        }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-black">Admin Portal</h1>
          <p className="text-sm text-white/60">Restricted access</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-white/80">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500">
            Sign in
          </Button>
          <Link to="/" className="block text-center text-xs text-white/60 hover:text-white">
            ← Back to site
          </Link>
        </div>
      </form>
    </div>
  );
}
