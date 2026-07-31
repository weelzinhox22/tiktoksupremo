import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, DEMO_CREDENTIALS } from "@/lib/demo-auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar no Tik Supremo" },
      {
        name: "description",
        content:
          "Acesse sua central de inteligência artificial para roteiros e vídeos do TikTok Shop.",
      },
      { property: "og:title", content: "Entrar no Tik Supremo" },
      { property: "og:description", content: "Do produto ao vídeo pronto para vender." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = signIn(username, password);
      toast.success(`Bem-vindo de volta, ${user.fullName}.`);
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Não foi possível entrar.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="aurora" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para a página inicial
        </Link>

        <div className="surface-card glow-primary p-7 md:p-9">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-supremo flex size-10 items-center justify-center rounded-xl">
              <Sparkles className="size-5 text-primary-foreground" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold">Entrar no Tik Supremo</h1>
              <p className="text-xs text-muted-foreground">
                Do produto ao vídeo pronto para vender.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              Entrar
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Acesso de demonstração</p>
            <p className="mt-1">
              Usuário <span className="font-mono text-cyan">{DEMO_CREDENTIALS.username}</span> · senha{" "}
              <span className="font-mono text-cyan">{DEMO_CREDENTIALS.password}</span>
            </p>
            <Button variant="soft" size="sm" className="mt-3" onClick={fillDemo} type="button">
              Preencher automaticamente
            </Button>
            <p className="mt-3">
              A sessão fica salva apenas neste navegador enquanto o banco de dados não estiver
              ativo. Cadastro, recuperação de senha e login com Google entram junto com o backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
