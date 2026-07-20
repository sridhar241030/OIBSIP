import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/AuthShell";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Pizzaverse" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const u = await login(data.email, data.password);
    if (!u) return toast.error("Invalid credentials or email not verified");
    toast.success(`Welcome back, ${u.name.split(" ")[0] || "there"}!`);
    navigate({ to: u.role === "admin" ? "/admin" : "/dashboard" });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep the pizza flowing"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-orange-500">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="text-xs text-orange-500">
              Forgot?
            </Link>
          </div>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500"
        >
          Login
        </Button>

      </form>
    </AuthShell>
  );
}
