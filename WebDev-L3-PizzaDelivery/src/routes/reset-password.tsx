import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/AuthShell";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Pizzaverse" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [pwd, setPwd] = useState({ n: "", c: "" });
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Set a new password"
      footer={
        <Link to="/login" className="font-semibold text-orange-500">
          Back to login
        </Link>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pwd.n.length < 6) return toast.error("Min 6 characters");
          if (pwd.n !== pwd.c) return toast.error("Passwords don't match");
          toast.success("Password updated. Please login.");
          navigate({ to: "/login" });
        }}
        className="space-y-4"
      >
        <div>
          <Label>New password</Label>
          <Input
            type="password"
            value={pwd.n}
            onChange={(e) => setPwd((p) => ({ ...p, n: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Confirm password</Label>
          <Input
            type="password"
            value={pwd.c}
            onChange={(e) => setPwd((p) => ({ ...p, c: e.target.value }))}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
