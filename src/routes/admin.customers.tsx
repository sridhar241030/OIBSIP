import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
  component: () => null,
});
