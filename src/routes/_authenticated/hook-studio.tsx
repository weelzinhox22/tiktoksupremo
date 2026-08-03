import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  Zap,
  Sparkles,
  Search,
  Copy as CopyIcon,
  Check,
  Star,
  Play,
  ArrowRight,
  Bookmark,
  Eye,
  Info,
  SlidersHorizontal,
  Layers,
  Wand2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { toast } from "sonner";
import { VIRAL_HOOK_FORMULAS, HOOK_CATEGORIES, type HookFormula } from "@/features/hooks/hook-data";
import { generateHooksServerFn, type GeneratedHook } from "@/features/hooks/hook-service";

export const Route = createFileRoute("/_authenticated/hook-studio")({
  component: HookStudioPage,
});

function HookStudioPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"generator" | "library" | "saved">("generator");

  // Form State - Generator
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [mainPain, setMainPain] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [hookCount, setHookCount] = useState(5);

  // Results & Saved State
  const [generatedHooks, setGeneratedHooks] = useState<GeneratedHook[]>([]);
  const [savedHooks, setSavedHooks] = useState<GeneratedHook[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("saved_tik_hooks");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Library State
  const [libraryCategory, setLibraryCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Save hooks to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("saved_tik_hooks", JSON.stringify(savedHooks));
    }
  }, [savedHooks]);

  // AI Hook Generation Mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (productName.trim().length < 2) {
        throw new Error("Informe o nome do produto para gerar os ganchos.");
      }
      return await generateHooksServerFn({
        data: {
          productName,
          niche,
          mainPain,
          style: selectedStyle,
          count: hookCount,
        },
      });
    },
    onSuccess: (data) => {
      setGeneratedHooks(data);
      toast.success(`${data.length} ganchos virais gerados pela IA!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Gancho copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSaveHook = (hook: GeneratedHook) => {
    setSavedHooks((prev) => {
      const exists = prev.some((h) => h.spokenText === hook.spokenText);
      if (exists) {
        toast.info("Gancho removido dos salvos.");
        return prev.filter((h) => h.spokenText !== hook.spokenText);
      } else {
        toast.success("Gancho salvo nos favoritos!");
        return [hook, ...prev];
      }
    });
  };

  const handleUseInWizard = (hook: GeneratedHook) => {
    navigate({
      to: "/projects/new",
      search: {
        productName: productName || "Produto",
      },
    });
    toast.success("Gancho enviado ao Criador de Roteiros!");
  };

  // Filter Library Formulas
  const filteredFormulas = VIRAL_HOOK_FORMULAS.filter((formula) => {
    const matchesCategory = libraryCategory === "all" || formula.category === libraryCategory;
    const matchesSearch =
      formula.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.example.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="size-3.5" /> Retenção dos 3 Primeiros Segundos
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Estúdio de Ganchos Virais
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Crie e descubra ganchos hipnotizantes para segurar até 99% dos espectadores no TikTok Shop.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-secondary/30 p-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "generator"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3.5" /> Gerador IA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "library"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" /> Fórmulas (+30)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              activeTab === "saved"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="size-3.5" /> Salvos ({savedHooks.length})
          </button>
        </div>
      </div>

      {/* TAB 1: GERADOR COM IA */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wand2 className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Gerar Ganchos Personalizados com IA</h2>
                <p className="text-xs text-muted-foreground">
                  Insira o produto e a dor principal para a IA criar combinações visuais e faladas inéditas.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nome do Produto *">
                <Input
                  placeholder="Ex: Escova Secadora de Cabelo / Mini Seladora Térmica"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </Field>

              <Field label="Nicho / Categoria">
                <Input
                  placeholder="Ex: Beleza & Cuidados Pessoais / Utilidades Domésticas"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />
              </Field>

              <Field label="Principal Dor que o Produto Resolve">
                <Input
                  placeholder="Ex: Demora muito tempo para secar o cabelo de manhã"
                  value={mainPain}
                  onChange={(e) => setMainPain(e.target.value)}
                />
              </Field>

              <Field label="Estilo de Gancho Desejado">
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                >
                  <option value="all">Misturar Todos os Estilos Virais</option>
                  <option value="Quebra de Padrão">⚡ Quebra de Padrão (Interrupção)</option>
                  <option value="Segredo">🤫 Segredo & Revelação (Exclusividade)</option>
                  <option value="Pergunta Provocativa">❓ Pergunta Provocativa</option>
                  <option value="Antes vs Depois">✨ Antes vs Depois (Transformação)</option>
                  <option value="Alerta de Erro">⚠️ Alerta de Erro Crítico</option>
                  <option value="Achadinho">🛍️ Achadinho do TikTok</option>
                </select>
              </Field>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Variações:</span>
                {[3, 5, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setHookCount(count)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      hookCount === count
                        ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                        : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {count} Ganchos
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="hero"
                disabled={generateMutation.isPending || productName.trim().length < 2}
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? "Gerando Ganchos Virais..." : "Gerar Ganchos Virais"}
                <Zap className="ml-2 size-4" />
              </Button>
            </div>
          </div>

          {/* AI Hook Results List */}
          {generatedHooks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Ganchos Gerados ({generatedHooks.length})
                </h3>
                <span className="text-xs text-muted-foreground">
                  Clique para copiar ou enviar ao criador de roteiros
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {generatedHooks.map((hook) => {
                  const isSaved = savedHooks.some((h) => h.spokenText === hook.spokenText);
                  return (
                    <div
                      key={hook.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-lg transition-all hover:border-primary/40 hover:shadow-primary/5"
                    >
                      <div className="space-y-3">
                        {/* Header Badges */}
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {hook.styleName}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                              <Eye className="size-3" /> {hook.retentionScore}% retenção
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleSaveHook(hook)}
                              className={`rounded-lg p-1.5 transition ${
                                isSaved
                                  ? "text-amber-400 hover:text-amber-300"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              title={isSaved ? "Remover dos favoritos" : "Salvar nos favoritos"}
                            >
                              <Bookmark className={`size-4 ${isSaved ? "fill-amber-400" : ""}`} />
                            </button>
                          </div>
                        </div>

                        {/* Spoken Text */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Fala (Primeiros 3s):
                          </p>
                          <p className="font-display text-base font-semibold text-foreground leading-snug">
                            "{hook.spokenText}"
                          </p>
                        </div>

                        {/* Visual Action */}
                        <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs space-y-1">
                          <p className="font-semibold text-cyan flex items-center gap-1.5">
                            <VideoIcon className="size-3.5" /> Ação Visual de Gravação:
                          </p>
                          <p className="text-muted-foreground leading-relaxed">{hook.visualAction}</p>
                        </div>

                        {/* Psychological Trigger */}
                        <div className="text-[11px] text-muted-foreground">
                          Gatilho: <span className="font-semibold text-foreground">{hook.psychologicalTrigger}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleCopyText(hook.spokenText, hook.id)}
                        >
                          {copiedId === hook.id ? (
                            <Check className="mr-1.5 size-3.5 text-emerald-400" />
                          ) : (
                            <CopyIcon className="mr-1.5 size-3.5" />
                          )}
                          {copiedId === hook.id ? "Copiado!" : "Copiar Fala"}
                        </Button>

                        <Button
                          type="button"
                          variant="hero"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleUseInWizard(hook)}
                        >
                          <Play className="mr-1.5 size-3.5" /> Usar no Roteiro
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BIBLIOTECA DE FÓRMULAS VIRAIS */}
      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Controls: Search & Category Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {HOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setLibraryCategory(cat.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    libraryCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 text-xs"
                placeholder="Buscar fórmulas ou palavras-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Formula Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredFormulas.map((formula) => (
              <div
                key={formula.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-lg transition hover:border-primary/30 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {formula.categoryName}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Zap className="size-3" /> {formula.retentionScore}% Score
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm leading-snug">{formula.title}</h3>

                  <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs">
                    <p className="font-semibold text-primary mb-1">Fórmula:</p>
                    <p className="font-mono text-foreground/90 font-medium">{formula.template}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-muted-foreground">Exemplo Real:</p>
                    <p className="text-muted-foreground italic">"{formula.example}"</p>
                  </div>

                  <div className="rounded-lg bg-secondary/30 p-2.5 text-[11px] space-y-1">
                    <p className="font-semibold text-cyan">Ação Visual Recomendada:</p>
                    <p className="text-muted-foreground">{formula.visualAction}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                    {formula.psychologicalTrigger}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleCopyText(formula.example, formula.id)}
                  >
                    {copiedId === formula.id ? (
                      <Check className="mr-1 size-3 text-emerald-400" />
                    ) : (
                      <CopyIcon className="mr-1 size-3" />
                    )}
                    {copiedId === formula.id ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GANCHOS SALVOS */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          {savedHooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
              <Bookmark className="mx-auto size-10 text-muted-foreground/40" />
              <h3 className="font-semibold text-base">Nenhum gancho salvo ainda</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Gere ganchos no Gerador de IA ou explore a Biblioteca de Fórmulas e clique no ícone de marcador para salvá-los aqui.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("generator")}>
                Ir para o Gerador IA
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedHooks.map((hook) => (
                <div
                  key={hook.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {hook.styleName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSaveHook(hook)}
                        className="text-destructive hover:text-destructive/80 p-1"
                        title="Remover dos salvos"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <p className="font-display text-base font-semibold leading-snug text-foreground">
                      "{hook.spokenText}"
                    </p>

                    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs space-y-1">
                      <p className="font-semibold text-cyan">Ação Visual:</p>
                      <p className="text-muted-foreground">{hook.visualAction}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleCopyText(hook.spokenText, hook.id)}
                    >
                      {copiedId === hook.id ? (
                        <Check className="mr-1.5 size-3.5 text-emerald-400" />
                      ) : (
                        <CopyIcon className="mr-1.5 size-3.5" />
                      )}
                      {copiedId === hook.id ? "Copiado!" : "Copiar"}
                    </Button>

                    <Button
                      type="button"
                      variant="hero"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleUseInWizard(hook)}
                    >
                      <Play className="mr-1.5 size-3.5" /> Usar no Roteiro
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}
