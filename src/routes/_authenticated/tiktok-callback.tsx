import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeTikTokConnection } from "@/features/tiktok/server";

export const Route = createFileRoute("/_authenticated/tiktok-callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search["code"] === "string" ? search["code"] : "",
    state: typeof search["state"] === "string" ? search["state"] : "",
    error: typeof search["error"] === "string" ? search["error"] : "",
    errorDescription:
      typeof search["error_description"] === "string" ? search["error_description"] : "",
  }),
  component: TikTokCallbackPage,
  head: () => ({ meta: [{ title: "Conectar TikTok — Tik Supremo" }] }),
});

function TikTokCallbackPage() {
  const search = Route.useSearch();
  const started = useRef(false);
  const mutation = useMutation({
    mutationFn: () =>
      completeTikTokConnection({ data: { code: search.code, state: search.state } }),
  });
  useEffect(() => {
    if (started.current || search.error || !search.code || !search.state) return;
    started.current = true;
    mutation.mutate();
  }, [mutation, search.code, search.error, search.state]);

  const rejected = search.error || (!search.code && !mutation.isPending);
  const errorMessage =
    search.errorDescription ||
    (mutation.error instanceof Error ? mutation.error.message : "A autorização não foi concluída.");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center py-12">
      <section className="bento-card bento-card-accent w-full p-7 text-center md:p-10">
        {mutation.isPending && (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
            <h1 className="mt-5 text-2xl font-semibold">Conectando sua conta TikTok...</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos guardando a autorização de forma cifrada e confirmando os escopos.
            </p>
          </>
        )}
        {mutation.isSuccess && (
          <>
            <CheckCircle2 className="mx-auto size-11 text-emerald-300" />
            <h1 className="mt-5 text-2xl font-semibold">TikTok conectado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mutation.data.displayName} agora pode fornecer métricas oficiais dos próprios vídeos.
            </p>
            <Button className="mt-6" variant="hero" asChild>
              <Link to="/performance">Ir para desempenho</Link>
            </Button>
          </>
        )}
        {(rejected || mutation.isError) && (
          <>
            <CircleAlert className="mx-auto size-11 text-amber-300" />
            <h1 className="mt-5 text-2xl font-semibold">A conexão não foi concluída</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{errorMessage}</p>
            <Button className="mt-6" variant="outline" asChild>
              <Link to="/performance">Voltar para desempenho</Link>
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
