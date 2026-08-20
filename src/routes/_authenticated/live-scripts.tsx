import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Radio,
  Sparkles,
  ShoppingBag,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  Flame,
  Zap,
  Package,
  Layers,
  ChevronRight,
  Volume2,
  CheckCircle2,
  Sliders,
  Send,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Plus,
  Save,
  Database,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listProductLibrary } from "@/features/libraries/queries";
import {
  generateLiveScriptServerFn,
  saveLiveScriptServerFn,
  listSavedLiveScriptsServerFn,
  deleteSavedLiveScriptServerFn,
  type LiveMicroBlock,
  type SavedLiveScript,
} from "@/features/live-scripts/server";

export const Route = createFileRoute("/_authenticated/live-scripts")({
  component: LiveScriptsPage,
  head: () => ({ meta: [{ title: "Scripts de Live IA (Até 30min+) — Tik Supremo" }] }),
});

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}min`;
  return `${mins}m ${secs}s`;
}

function LiveScriptsPage() {
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });
  const savedLivesQuery = useQuery({
    queryKey: ["saved-live-scripts"],
    queryFn: () => listSavedLiveScriptsServerFn(),
  });

  const [activeTab, setActiveTab] = useState<"editor" | "saved">("editor");

  const [productForm, setProductForm] = useState({
    name: "Vestido Midi Canelado com Fenda",
    price: "R$ 149,90",
    discountPrice: "R$ 69,90",
    fabric: "Canelado encorpado 320g com elastano",
    benefit: "Zero transparência, modela a cintura e não marca",
    urgency: "Últimas 12 unidades com frete grátis liberado",
    streamerStyle: "vendedora_amiga",
  });

  const [sceneCount, setSceneCount] = useState<number>(24);
  const [customSceneCount, setCustomSceneCount] = useState<string>("24");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);

  const [liveBlocks, setLiveBlocks] = useState<LiveMicroBlock[]>([
    {
      id: "fb-1",
      stepNumber: 1,
      timeframe: "00:00 - 00:08",
      durationSeconds: 8,
      stageName: "1. Acolhimento & Cidade",
      badge: "Entrada",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      actionGuide: "Sorriso aberto, olhando na câmera e gesticulando com energia.",
      speech: "Oi meninas! Sejam muito bem-vindas à nossa live oficial de fábrica! Já digita aqui no chat de qual cidade vocês tão assistindo!",
      hookTrigger: "Engajamento imediato no chat",
    },
    {
      id: "fb-2",
      stepNumber: 2,
      timeframe: "00:08 - 00:16",
      durationSeconds: 8,
      stageName: "2. Revelação da Oferta",
      badge: "Gatilho de Curiosidade",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      actionGuide: "Puxa a peça principal e exibe na frente com entusiasmo.",
      speech: "Hoje conseguimos liberar um lote exclusivo do Vestido Midi direto da confecção por menos da metade do preço de shopping!",
      hookTrigger: "Âncora de preço e curiosidade",
    },
    {
      id: "fb-3",
      stepNumber: 3,
      timeframe: "00:16 - 00:24",
      durationSeconds: 8,
      stageName: "3. Textura de Perto",
      badge: "Prova de Tecido",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      actionGuide: "Aproxima o tecido bem perto da lente da câmera.",
      speech: "Deixa eu aproximar bem da câmera pra vocês verem: olha a gramatura desse canelado encorpado 320g com elastano!",
      hookTrigger: "Quebra de medo de comprar online",
    },
    {
      id: "fb-4",
      stepNumber: 4,
      timeframe: "00:24 - 00:32",
      durationSeconds: 8,
      stageName: "4. Teste de Elasticidade",
      badge: "Elasticidade",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      actionGuide: "Estica o tecido com as duas mãos firmes e solta.",
      speech: "Estou esticando com força aqui na live e vejam: ele não deforma e tem zero transparência!",
      hookTrigger: "Demonstração física de qualidade",
    },
  ]);

  // Teleprompter / Live Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [secondsInCurrentBlock, setSecondsInCurrentBlock] = useState(0);
  const timerRef = useRef<number | null>(null);

  const totalDurationSeconds = liveBlocks.reduce((acc, b) => acc + (b.durationSeconds || 8), 0);
  const formattedTotalDuration = formatDuration(totalDurationSeconds);

  // Mutations
  const generateMutation = useMutation({
    mutationFn: async (countToGen: number) => {
      const res = await generateLiveScriptServerFn({
        data: {
          productName: productForm.name,
          price: productForm.price,
          discountPrice: productForm.discountPrice,
          fabric: productForm.fabric,
          benefit: productForm.benefit,
          urgency: productForm.urgency,
          streamerStyle: productForm.streamerStyle,
          sceneCount: countToGen,
        },
      });
      return res;
    },
    onSuccess: (data) => {
      setLiveBlocks(data.blocks);
      setCurrentBlockIndex(0);
      setSecondsInCurrentBlock(0);
      setIsPlaying(false);
      toast.success(`Roteiro de Live gerado com ${data.blocks.length} falas (${formatDuration(data.blocks.length * 8)})!`);
    },
    onError: (err) => {
      toast.error(`Erro ao gerar roteiro: ${err.message}`);
    },
  });

  const appendMutation = useMutation({
    mutationFn: async (countToAppend: number) => {
      const res = await generateLiveScriptServerFn({
        data: {
          productName: productForm.name,
          price: productForm.price,
          discountPrice: productForm.discountPrice,
          fabric: productForm.fabric,
          benefit: productForm.benefit,
          urgency: productForm.urgency,
          streamerStyle: productForm.streamerStyle,
          sceneCount: countToAppend,
          startFromIndex: liveBlocks.length + 1,
        },
      });
      return res;
    },
    onSuccess: (data) => {
      setLiveBlocks((prev) => [...prev, ...data.blocks]);
      toast.success(`Adicionadas mais ${data.blocks.length} falas à Live!`);
    },
    onError: (err) => {
      toast.error(`Erro ao estender roteiro: ${err.message}`);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await saveLiveScriptServerFn({
        data: {
          productName: productForm.name,
          totalScenes: liveBlocks.length,
          totalDuration: formattedTotalDuration,
          summary: `Live TikTok Shop com ${liveBlocks.length} falas de 8s`,
          blocks: liveBlocks,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Roteiro de Live salvo com sucesso no Banco de Dados!");
      savedLivesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar no banco de dados: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteSavedLiveScriptServerFn({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Live removida com sucesso do banco de dados!");
      savedLivesQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao deletar: ${err.message}`);
    },
  });

  // Teleprompter Timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setSecondsInCurrentBlock((prev) => {
          if (prev >= 7) {
            setCurrentBlockIndex((currIdx) => {
              if (currIdx >= liveBlocks.length - 1) {
                return 0; // Continuous loop
              }
              return currIdx + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, liveBlocks.length]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = productsQuery.data?.find((p) => p.id === productId);
    if (prod) {
      setProductForm({
        name: prod.name,
        price: prod.price ? `R$ ${prod.price.toFixed(2)}` : "R$ 149,90",
        discountPrice: prod.price ? `R$ ${(prod.price * 0.5).toFixed(2)}` : "R$ 69,90",
        fabric: prod.description || "Tecido encorpado premium",
        benefit: prod.benefits?.[0] || "Modela a cintura e zero transparência",
        urgency: "Últimas peças com frete grátis liberado",
        streamerStyle: "vendedora_amiga",
      });
      toast.info(`Dados de "${prod.name}" carregados para a live!`);
    }
  };

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success(`Fala ${index + 1} copiada!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyFullScript = () => {
    const full = liveBlocks
      .map((b) => `[${b.timeframe}] (${b.stageName})\nAção: ${b.actionGuide}\nFala: "${b.speech}"`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(full);
    setCopiedFull(true);
    toast.success("Roteiro completo copiado para a área de transferência!");
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleDownloadTxt = () => {
    const full = `ROTEIRO DE LIVE IA — TIK SUPREMO STUDIO\nProduto: ${productForm.name}\nDuração Total: ${formattedTotalDuration} (${liveBlocks.length} falas)\n\n` +
      liveBlocks
        .map((b) => `[${b.timeframe}] ${b.stageName}\nAção: ${b.actionGuide}\nFala: "${b.speech}"`)
        .join("\n\n--------------------------------------------\n\n");

    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-script-${productForm.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo TXT exportado com sucesso!");
  };

  const handleLoadSavedLive = (saved: SavedLiveScript) => {
    setLiveBlocks(saved.blocks);
    setProductForm((prev) => ({ ...prev, name: saved.productName }));
    setActiveTab("editor");
    toast.success(`Live "${saved.title}" carregada com sucesso!`);
  };

  const durationPresets = [
    { label: "12 falas (~1.5m)", count: 12 },
    { label: "24 falas (~3.2m)", count: 24 },
    { label: "50 falas (~6.5m)", count: 50 },
    { label: "100 falas (~13m)", count: 100 },
    { label: "150 falas (~20m)", count: 150 },
    { label: "225 falas (~30m)", count: 225 },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <header className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold px-2.5 py-0.5 text-xs">
                <Radio className="mr-1.5 size-3.5 animate-pulse" /> Scripts de Live IA & Banco de Dados
              </Badge>
              <span className="text-xs text-[#666A78]">Falas de até 8s para Lives de 1m a 30m+</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl text-[#F7F7FB]">
              Gerador de Scripts para Live Streamings
            </h1>
            <p className="text-xs text-[#A3A6B3] leading-relaxed">
              Crie roteiros contínuos em micro-blocos de <strong>até 8 segundos</strong> ideais para avatares virtuais e streamers humanos manterem retenção alta, interação com chat e chamadas na sacolinha amarela 24/7.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("editor")}
              className={`h-9 text-xs font-semibold ${activeTab === "editor" ? "bg-[#9B7CFF]/15 border-[#9B7CFF]/30 text-[#9B7CFF]" : "border-white/10 text-[#A3A6B3]"}`}
            >
              <Radio className="size-3.5 mr-1.5" /> Criador de Live
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("saved")}
              className={`h-9 text-xs font-semibold ${activeTab === "saved" ? "bg-[#9B7CFF]/15 border-[#9B7CFF]/30 text-[#9B7CFF]" : "border-white/10 text-[#A3A6B3]"}`}
            >
              <Database className="size-3.5 mr-1.5 text-emerald-400" /> Lives Salvas ({savedLivesQuery.data?.savedLives?.length ?? 0})
            </Button>
          </div>
        </div>
      </header>

      {activeTab === "saved" ? (
        /* Saved Lives from Database */
        <section className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#F7F7FB] flex items-center gap-2">
                <Database className="size-4 text-emerald-400" /> Minhas Lives Salvas no Banco de Dados
              </h2>
              <p className="text-xs text-[#A3A6B3] mt-0.5">
                Histórico de roteiros completos salvos diretamente no seu banco de dados.
              </p>
            </div>
          </div>

          {savedLivesQuery.isLoading ? (
            <div className="py-12 text-center text-xs text-[#A3A6B3]">Carregando lives salvas do banco...</div>
          ) : savedLivesQuery.data?.savedLives && savedLivesQuery.data.savedLives.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {savedLivesQuery.data.savedLives.map((saved) => (
                <div
                  key={saved.id}
                  className="rounded-xl border border-white/[0.08] bg-[#11131E] p-4 flex flex-col justify-between space-y-3 hover:border-[#9B7CFF]/30 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#9B7CFF]/15 text-[#9B7CFF] border-white/10 text-[10px] font-bold">
                        {saved.totalScenes} Falas ({saved.totalDuration})
                      </Badge>
                      <span className="text-[10px] text-[#666A78]">
                        {new Date(saved.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#F7F7FB] line-clamp-1">{saved.productName}</h3>
                    <p className="text-xs text-[#A3A6B3] line-clamp-2">{saved.summary}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <Button
                      size="sm"
                      className="h-7 text-xs font-bold bg-[#9B7CFF] text-[#07080D] hover:bg-[#AA92FF] flex-1"
                      onClick={() => handleLoadSavedLive(saved)}
                    >
                      Carregar no Estúdio
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-[#666A78] hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                      onClick={() => deleteMutation.mutate(saved.id)}
                      title="Excluir do Supabase"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Database className="mx-auto size-8 text-[#666A78]" />
              <p className="text-xs text-[#A3A6B3]">Nenhuma live salva ainda.</p>
              <Button size="sm" className="bg-[#9B7CFF] text-black font-bold text-xs" onClick={() => setActiveTab("editor")}>
                Gerar e Salvar Primeira Live
              </Button>
            </div>
          )}
        </section>
      ) : (
        /* Live Editor & Live Teleprompter */
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Form & Product Selection (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Product Library Picker */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-4.5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#F7F7FB] flex items-center gap-1.5">
                  <Package className="size-3.5 text-[#9B7CFF]" /> Puxar Produto do Catálogo
                </Label>
                <span className="text-[10px] text-[#666A78]">Preenchimento automático</span>
              </div>

              <select
                value={selectedProductId || ""}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full h-9 rounded-xl border border-white/[0.08] bg-[#11131E] px-3 text-xs text-[#F7F7FB] focus:outline-none focus:border-[#9B7CFF]/50"
              >
                <option value="">Selecione um produto existente...</option>
                {productsQuery.data?.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.price ? `R$ ${prod.price.toFixed(2)}` : "Sem preço"})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Settings & Scene Count */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-5 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-[#F7F7FB] flex items-center gap-2">
                <Sliders className="size-4 text-amber-400" /> Parâmetros da Live
              </h2>

              {/* DURATION / SCENE COUNT SELECTOR */}
              <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Quantidade de Falas & Duração:
                  </Label>
                  <span className="text-[11px] font-mono font-bold text-[#F7F7FB]">
                    {sceneCount} falas ({formatDuration(sceneCount * 8)})
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {durationPresets.map((preset) => (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => {
                        setSceneCount(preset.count);
                        setCustomSceneCount(String(preset.count));
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${
                        sceneCount === preset.count
                          ? "bg-amber-400 text-black shadow-sm"
                          : "border border-white/[0.08] bg-white/[0.02] text-[#A3A6B3] hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-[#666A78] shrink-0">Quantidade personalizada:</span>
                  <Input
                    type="number"
                    min={6}
                    max={250}
                    value={customSceneCount}
                    onChange={(e) => {
                      setCustomSceneCount(e.target.value);
                      const parsed = parseInt(e.target.value, 10);
                      if (!isNaN(parsed) && parsed >= 6 && parsed <= 250) {
                        setSceneCount(parsed);
                      }
                    }}
                    className="h-7 text-xs bg-black/60 border-white/15 text-white w-24 font-mono"
                  />
                  <span className="text-[10px] text-[#A3A6B3]">falas (8s cada)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#A3A6B3]">Nome do Produto / Coleção</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Vestido Midi Canelado"
                  className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs text-[#A3A6B3]">Preço de Tabela</Label>
                  <Input
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#A3A6B3]">Preço na Live</Label>
                  <Input
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#A3A6B3]">Tecido / Material / Diferencial</Label>
                <Input
                  value={productForm.fabric}
                  onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                  placeholder="Ex: Canelado encorpado 320g com elastano"
                  className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#A3A6B3]">Benefício Principal de Caimento</Label>
                <Input
                  value={productForm.benefit}
                  onChange={(e) => setProductForm({ ...productForm, benefit: e.target.value })}
                  placeholder="Ex: Modela a cintura e zero transparência"
                  className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#A3A6B3]">Gatilho de Escassez / Urgência</Label>
                <Input
                  value={productForm.urgency}
                  onChange={(e) => setProductForm({ ...productForm, urgency: e.target.value })}
                  placeholder="Ex: Últimas 10 peças no lote promocional"
                  className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate(sceneCount)}
                disabled={generateMutation.isPending || !productForm.name.trim()}
                className="w-full h-10 font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/10 text-xs gap-1.5"
              >
                {generateMutation.isPending ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Gerando {sceneCount} Falas ({formatDuration(sceneCount * 8)})...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Gerar Roteiro de {sceneCount} Falas ({formatDuration(sceneCount * 8)})
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Live Teleprompter & Micro-Speeches (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Bar for Script Actions & Teleprompter */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-4 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F7F7FB]">Sequência de Falas da Live</span>
                    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-[10px] font-bold">
                      {liveBlocks.length} Falas ({formattedTotalDuration})
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#A3A6B3]">
                    Falas de até 8s ordenadas para transmissão ou avatares em loop contínuo.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyFullScript}
                    className="h-8 text-xs font-semibold border-white/10 bg-white/[0.02] text-[#A3A6B3] hover:text-white"
                  >
                    {copiedFull ? <Check className="size-3.5 text-emerald-400 mr-1" /> : <Copy className="size-3.5 mr-1 text-[#9B7CFF]" />}
                    {copiedFull ? "Copiado!" : "Copiar Tudo"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadTxt}
                    className="h-8 text-xs font-semibold border-white/10 bg-white/[0.02] text-[#A3A6B3] hover:text-white"
                  >
                    <Download className="size-3.5 mr-1 text-cyan-400" /> Exportar TXT
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="h-8 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/10 gap-1"
                  >
                    {saveMutation.isPending ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                    Salvar no Banco de Dados
                  </Button>
                </div>
              </div>

              {/* LIVE TELEPROMPTER / SIMULATOR BAR */}
              <div className="rounded-xl border border-white/[0.08] bg-[#11131E] p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`size-9 rounded-xl flex items-center justify-center font-bold transition shadow-md ${
                      isPlaying ? "bg-amber-400 text-black" : "bg-[#9B7CFF] text-black hover:bg-[#AA92FF]"
                    }`}
                  >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F7F7FB]">
                        {isPlaying ? "Simulando Live Ao Vivo..." : "Teleprompter de Live"}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                        Fala {currentBlockIndex + 1} de {liveBlocks.length} ({secondsInCurrentBlock}s/8s)
                      </span>
                    </div>
                    <p className="text-[10px] text-[#666A78]">
                      Acompanhe o tempo de cada fala para sincronizar com seu avatar ou teleprompter.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentBlockIndex(0);
                      setSecondsInCurrentBlock(0);
                      setIsPlaying(false);
                    }}
                    className="text-xs text-[#A3A6B3] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05]"
                    title="Reiniciar do bloco 1"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* List of Micro-Blocks */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {liveBlocks.map((block, idx) => {
                const isActive = currentBlockIndex === idx;

                return (
                  <article
                    key={block.id}
                    className={`rounded-xl border p-4 transition-all duration-200 ${
                      isActive
                        ? "border-amber-400 bg-amber-400/[0.04] shadow-lg shadow-amber-400/5 ring-1 ring-amber-400/20"
                        : "border-white/[0.08] bg-[#0E1017] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono font-bold text-white">
                          #{block.stepNumber}
                        </span>
                        <Badge className={`text-[10px] font-bold border ${block.badgeColor}`}>
                          {block.badge}
                        </Badge>
                        <span className="text-[10px] font-mono text-[#666A78]">
                          {block.timeframe} ({block.durationSeconds}s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentBlockIndex(idx);
                            setSecondsInCurrentBlock(0);
                          }}
                          className="text-[10px] text-[#666A78] hover:text-amber-400 px-2 py-0.5 rounded hover:bg-white/[0.04] transition"
                        >
                          Ir para esta fala
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopySingle(block.speech, idx)}
                          className="text-[10px] text-[#A3A6B3] hover:text-[#9B7CFF] flex items-center gap-1 font-medium px-2 py-0.5 rounded hover:bg-white/[0.04] transition"
                        >
                          {copiedIndex === idx ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                          {copiedIndex === idx ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>

                    {/* Action Guide */}
                    <div className="rounded-lg bg-black/40 border border-white/[0.04] px-3 py-1.5 text-[11px] text-[#A3A6B3] mb-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-amber-400/90 shrink-0">Ação Visual:</span>
                      <span className="truncate">{block.actionGuide}</span>
                    </div>

                    {/* Spoken text */}
                    <div className="text-xs md:text-sm text-[#F7F7FB] font-medium leading-relaxed bg-[#11131E] border border-white/[0.06] rounded-xl p-3">
                      "{block.speech}"
                    </div>
                  </article>
                );
              })}

              {/* Action Button to Append 20 more speeches */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => appendMutation.mutate(20)}
                  disabled={appendMutation.isPending}
                  className="w-full h-10 border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.04] text-xs text-[#A3A6B3] hover:text-white font-semibold gap-1.5"
                >
                  {appendMutation.isPending ? (
                    <>
                      <RefreshCw className="size-4 animate-spin text-amber-400" /> Gerando mais 20 falas...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 text-amber-400" /> Estender Live (+20 falas contínuas de 8s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
