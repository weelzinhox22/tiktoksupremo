import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { completeTikTokLogin } from "@/features/tiktok/server";

function friendlyError(error?: string) {
  if (error === "access_denied")
    return "Você cancelou o acesso ao TikTok. Nenhuma alteração foi feita.";
  return "Não foi possível entrar com TikTok. Tente novamente.";
}

export const Route = createFileRoute("/auth/tiktok/callback")({
  validateSearch: z.object({
    code: z.string().max(2_000).optional().catch(undefined),
    state: z.string().uuid().optional().catch(undefined),
    error: z.string().max(120).optional().catch(undefined),
  }),
  beforeLoad: async ({ search }) => {
    if (search.error || !search.code || !search.state) {
      throw redirect({
        to: "/login",
        search: { tiktok_error: friendlyError(search.error) },
      });
    }
    try {
      await completeTikTokLogin({ data: { code: search.code, state: search.state } });
      throw redirect({ to: "/dashboard" });
    } catch (error) {
      if (error && typeof error === "object" && "to" in error) throw error;
      console.error("TikTok Login Kit callback failed", error);
      const message =
        error instanceof Error && error.message.includes("validação de segurança")
          ? error.message
          : friendlyError();
      throw redirect({ to: "/login", search: { tiktok_error: message } });
    }
  },
  component: () => null,
});
