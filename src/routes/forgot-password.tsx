import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/AuthShell";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Pizzaverse" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a reset link"
      footer={
        <Link to="/login" className="font-semibold text-orange-500">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl bg-green-500/10 p-4 text-center">
          <MailCheck className="mx-auto h-8 w-8 text-green-500" />
          <p className="mt-2 text-sm font-semibold">Check your inbox!</p>
          <p className="mt-1 text-xs text-muted-foreground">
            A password reset link has been sent to <span className="font-medium">{email}</span>.
            Follow the link in the email to set a new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500"
          >
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
