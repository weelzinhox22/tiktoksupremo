import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Cpu,
  EyeOff,
  KeyRound,
  Loader2,
  PlayCircle,
  Save,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PROVIDER_CATALOG,
  type VideoProviderId,
  type VideoProviderPublicConfig,
} from "@/features/video-providers/types";
import {
  listVideoProviderConfigs,
  saveVideoProviderConfig,
  testVideoProviderConfig,
} from "@/features/video-providers/server";

export const Route = createFileRoute("/_authenticated/admin/video-providers")({
  component: VideoProviderAdminPage,
  head: () => ({ meta: [{ title: "Admin · Provedores de vídeo — Tik Supremo" }] }),
});

type Draft = {
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
  secret: string;
  clearSecret: boolean;
  settingsText: string;
};

function VideoProviderAdminPage() {
  const { user } = Route.useRouteContext();
  const [configs, setConfigs] = useState<VideoProviderPublicConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listVideoProviderConfigs();
      setConfigs(rows);
      setDrafts(
        Object.fromEntries(
          PROVIDER_CATALOG.map((catalog) => {
            const row = rows.find((item) => item.provider === catalog.id);
            return [
              catalog.id,
              {
                displayName: row?.displayName || catalog.name,
                enabled: row?.enabled || false,
                isDefault: row?.isDefault || false,
                secret: "",
                clearSecret: false,
                settingsText: JSON.stringify(row?.settings || catalog.recommendedSettings, null, 2),
              },
            ];
          }),
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar provedores.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user.isAdmin) void load();
    else setLoading(false);
  }, [user.isAdmin]);

  if (!user.isAdmin)
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
        <ShieldCheck className="mx-auto size-10 text-rose-400" />
        <h1 className="mt-4 text-xl font-bold">Área exclusiva do administrador</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina seu e-mail em ADMIN_EMAILS no ambiente do servidor ou atribua role=admin no
          Supabase.
        </p>
        <Button asChild className="mt-5">
          <Link to="/dashboard">Voltar ao painel</Link>
        </Button>
      </div>
    );
  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );

  const patchDraft = (id: string, patch: Partial<Draft>) =>
    setDrafts((current) => ({ ...current, [id]: { ...current[id]!, ...patch } }));
  const save = async (provider: VideoProviderId) => {
    const draft = drafts[provider]!;
    const activatesWithNewKey = provider !== "comfyui" && Boolean(draft.secret.trim());
    let settings: Record<string, unknown>;
    try {
      settings = JSON.parse(draft.settingsText) as Record<string, unknown>;
    } catch {
      toast.error("O JSON de configurações é inválido.");
      return;
    }
    if (provider === "comfyui" && draft.enabled) {
      const baseUrl = String(settings["baseUrl"] || "");
      if (
        !baseUrl ||
        baseUrl.includes("/admin/video-providers") ||
        /localhost:3000/i.test(baseUrl)
      ) {
        toast.error(
          "Use a API do ComfyUI, normalmente http://127.0.0.1:8188 — não a URL desta página.",
        );
        return;
      }
      if (!settings["workflow"] || typeof settings["workflow"] !== "object") {
        toast.error("workflow está vazio. Cole o JSON exportado por Save (API Format) no ComfyUI.");
        return;
      }
    }
    setBusy(provider);
    try {
      await saveVideoProviderConfig({
        data: {
          provider,
          displayName: draft.displayName,
          enabled: draft.enabled || activatesWithNewKey,
          isDefault: draft.isDefault,
          secret: draft.secret || undefined,
          clearSecret: draft.clearSecret,
          settings,
        },
      });
      toast.success(
        activatesWithNewKey
          ? "Chave salva e provedor ativado. Agora use Testar para confirmar o acesso ao modelo."
          : "Configuração salva sem expor a chave.",
      );
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar.");
    } finally {
      setBusy(null);
    }
  };
  const test = async (provider: VideoProviderId) => {
    setBusy(provider);
    try {
      if (provider === "comfyui") {
        const settings = JSON.parse(drafts[provider]!.settingsText) as Record<string, unknown>;
        const baseUrl = String(settings["baseUrl"] || "http://127.0.0.1:8188").replace(/\/$/, "");
        if (baseUrl.includes("/admin/video-providers") || /localhost:3000/i.test(baseUrl)) {
          throw new Error("A URL informada é do Tik Supremo, não do ComfyUI.");
        }
        if (!settings["workflow"] || typeof settings["workflow"] !== "object") {
          throw new Error("O workflow API ainda não foi informado.");
        }
        const response = await fetch(`${baseUrl}/system_stats`, {
          signal: AbortSignal.timeout(8_000),
        });
        if (!response.ok) throw new Error(`ComfyUI respondeu HTTP ${response.status}.`);
        toast.success("ComfyUI encontrado neste computador. O gerador local está pronto.");
        return;
      }
      const draft = drafts[provider]!;
      if (draft.secret.trim()) {
        const settings = JSON.parse(draft.settingsText) as Record<string, unknown>;
        await saveVideoProviderConfig({
          data: {
            provider,
            displayName: draft.displayName,
            enabled: true,
            isDefault: draft.isDefault,
            secret: draft.secret,
            clearSecret: false,
            settings,
          },
        });
      }
      const result = await testVideoProviderConfig({ data: { provider } });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : provider === "comfyui"
            ? "ComfyUI local não respondeu. Inicie-o na porta 8188 com CORS habilitado."
            : "Falha no teste.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-background to-cyan-500/10 p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-violet-300">
              <ShieldCheck className="size-4" /> Cofre administrativo
            </div>
            <h1 className="mt-3 text-3xl font-bold">Motores de geração de vídeo</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Ative ComfyUI, LTX, Veo, Replicate, Hugging Face ou MiniMax. O motor padrão roda
              primeiro e o sistema tenta os demais automaticamente se ele falhar.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
            <EyeOff className="mr-2 inline size-4" /> Chaves cifradas no backend e nunca devolvidas
            ao navegador
          </div>
        </div>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        {PROVIDER_CATALOG.map((catalog) => {
          const row = configs.find((item) => item.provider === catalog.id);
          const draft = drafts[catalog.id];
          if (!draft) return null;
          return (
            <section
              key={catalog.id}
              className={`rounded-3xl border p-5 ${draft.enabled ? "border-violet-500/30 bg-violet-500/[.06]" : "border-border bg-card"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Cpu className="size-5" />
                  </span>
                  <div>
                    <input
                      value={draft.displayName}
                      onChange={(e) => patchDraft(catalog.id, { displayName: e.target.value })}
                      className="w-full bg-transparent font-semibold outline-none"
                    />
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {catalog.description}
                    </p>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(e) => patchDraft(catalog.id, { enabled: e.target.checked })}
                  />{" "}
                  Ativo
                </label>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="text-xs font-medium text-muted-foreground">
                  {catalog.keyLabel}
                  <div className="mt-1 flex gap-2">
                    <KeyRound className="mt-3 size-4 shrink-0" />
                    <input
                      type="password"
                      value={draft.secret}
                      onChange={(e) =>
                        patchDraft(catalog.id, { secret: e.target.value, clearSecret: false })
                      }
                      placeholder={
                        row?.configured
                          ? `${row.secretHint || "Chave configurada"} · deixe vazio para manter`
                          : catalog.keyOptional
                            ? "Opcional"
                            : "Cole a chave aqui"
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                    />
                  </div>
                </label>
                {row?.configured && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={draft.clearSecret}
                      onChange={(e) =>
                        patchDraft(catalog.id, { clearSecret: e.target.checked, secret: "" })
                      }
                    />{" "}
                    Remover a credencial já salva
                  </label>
                )}
                <label className="text-xs font-medium text-muted-foreground">
                  Configurações avançadas (JSON)
                  <textarea
                    value={draft.settingsText}
                    onChange={(e) => patchDraft(catalog.id, { settingsText: e.target.value })}
                    rows={catalog.id === "comfyui" ? 9 : 5}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 font-mono text-[11px] leading-5"
                  />
                </label>
                {catalog.id === "comfyui" && (
                  <p className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-[11px] leading-5 text-cyan-200">
                    No ComfyUI use “Save (API Format)” e cole o JSON em workflow. Nos campos
                    variáveis do grafo você pode usar: {"{{PROMPT}}"}, {"{{NEGATIVE_PROMPT}}"},{" "}
                    {"{{WIDTH}}"}, {"{{HEIGHT}}"}, {"{{FRAMES}}"} e {"{{SEED}}"}. Em produção,
                    baseUrl deve ser um endereço HTTPS que o servidor consiga acessar; localhost
                    funciona apenas quando a aplicação e o ComfyUI rodam na mesma máquina.
                  </p>
                )}
                {catalog.id === "veo" && (
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] leading-5 text-amber-100">
                    Uma API key do AI Studio não garante acesso ao Veo. A geração de vídeo não está
                    disponível no Free Tier: habilite o faturamento no mesmo projeto da chave e
                    clique em Testar para validar especificamente o modelo configurado.
                  </p>
                )}
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="default-provider"
                    checked={draft.isDefault}
                    onChange={() =>
                      setDrafts((current) =>
                        Object.fromEntries(
                          Object.entries(current).map(([key, value]) => [
                            key,
                            { ...value, isDefault: key === catalog.id },
                          ]),
                        ),
                      )
                    }
                  />{" "}
                  Usar como motor padrão
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    {row?.lastTestStatus === "success" ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : row?.lastTestStatus === "error" ? (
                      <XCircle className="size-4 text-rose-400" />
                    ) : (
                      <PlayCircle className="size-4 text-muted-foreground" />
                    )}
                    <span className="max-w-[280px] truncate text-muted-foreground">
                      {row?.lastTestMessage || "Ainda não testado"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy === catalog.id}
                      onClick={() => void test(catalog.id)}
                    >
                      <PlayCircle /> {catalog.id === "comfyui" ? "Testar neste PC" : "Testar"}
                    </Button>
                    <Button
                      size="sm"
                      disabled={busy === catalog.id}
                      onClick={() => void save(catalog.id)}
                    >
                      {busy === catalog.id ? <Loader2 className="animate-spin" /> : <Save />} Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
