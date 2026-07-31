import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/demo-auth";

export const Route = createFileRoute("/_authenticated")({
  // A sessão de demonstração vive no navegador, então o gate roda só no cliente.
  ssr: false,
  beforeLoad: () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}
