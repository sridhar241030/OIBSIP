import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
  component: () => null,
});
