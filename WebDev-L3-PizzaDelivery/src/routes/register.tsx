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

const schema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(60),
    email: z.string().email("Invalid email").max(120),
    phone: z.string().regex(/^\d{10}$/, "10 digit phone number"),
    password: z.string().min(6, "Min 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Pizzaverse" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register: signup } = useApp();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const result = await signup({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    if (!result.ok) return toast.error(result.message ?? "Registration failed");
    toast.success("Account created! Please check your email to verify before logging in.");
    navigate({ to: "/login" });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join thousands of pizza lovers"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-orange-500">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Full name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register("phone")} placeholder="9999999999" />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Password</Label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label>Confirm</Label>
            <Input type="password" {...register("confirm")} />
            {errors.confirm && (
              <p className="mt-1 text-xs text-destructive">{errors.confirm.message}</p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500"
        >
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
