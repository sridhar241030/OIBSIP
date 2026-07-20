import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useApp } from "@/contexts/AppContext";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, ready } = useApp();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = path === "/admin/login";

  useEffect(() => {
    if (ready && !isAdmin && !isLogin) navigate({ to: "/admin/login" });
  }, [ready, isAdmin, isLogin, navigate]);

  if (isLogin) return <Outlet />;
  if (!isAdmin) return null;
  return (
    <AdminSidebar>
      <Outlet />
    </AdminSidebar>
  );
}
