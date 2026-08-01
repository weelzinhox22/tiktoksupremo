import { useState } from "react";
import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/features/auth/server";
import { resetPassword, signIn } from "@/features/auth/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const schema = z.object({
  displayName: z.string().optional(),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string(),
});
type FormData = z.infer<typeof schema>;
type Mode = "login" | "recovery";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    try {
      const user = await getCurrentUser();
      if (user) throw redirect({ to: "/dashboard" });
    } catch (error) {
      if (error && typeof error === "object" && "to" in error) {
        throw error;
      }
    }
  },
  head: () => ({ meta: [{ title: "Entrar no Tik Supremo" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "", password: "" },
  });
  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      if (!configured)
        throw new Error("Supabase não configurado. Consulte o arquivo .env.example.");
      if (mode === "recovery") {
        await resetPassword(values.email);
        toast.success("Enviamos o link de recuperação, se o e-mail estiver cadastrado.");
        setMode("login");
        return;
      }
      await signIn(values.email, values.password);
      toast.success("Bem-vindo de volta.");
      window.location.href = "/dashboard";
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível continuar.";
      setError(message);
      toast.error(message);
    }
  });
  const title = mode === "recovery" ? "Recuperar senha" : "Entrar no Tik Supremo";
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="aurora opacity-40" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para a página inicial
        </Link>
        <div className="surface-card p-7 md:p-9">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">
                Do produto ao vídeo pronto para vender.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                {...register("email")}
                required
              />
            </div>
            {mode !== "recovery" && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  required
                />
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !configured}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {mode === "recovery" ? "Enviar link" : "Entrar"}
            </Button>
          </form>
          {!configured && (
            <div className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Supabase ainda não está configurado. Preencha as variáveis descritas em{" "}
              <code>.env.example</code>.
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm">
            {mode !== "login" && (
              <button
                type="button"
                className="font-medium text-primary hover:text-primary/80"
                onClick={() => setMode("login")}
              >
                Voltar para o login
              </button>
            )}
            {mode !== "recovery" && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setMode("recovery")}
              >
                Esqueci a senha
              </button>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Acesso exclusivo para contas autorizadas. Cadastros públicos desativados.
          </p>
        </div>
      </div>
    </div>
  );
}
