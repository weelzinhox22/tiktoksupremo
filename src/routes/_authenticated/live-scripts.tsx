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
  ClipboardCopy,
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
  type LiveMicroBlock,
} from "@/features/live-scripts/server";

export const Route = createFileRoute("/_authenticated/live-scripts")({
  component: LiveScriptsPage,
  head: () => ({ meta: [{ title: "Scripts de Live IA (8s por Cena) — Tik Supremo" }] }),
});

function LiveScriptsPage() {
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });

  const [productForm, setProductForm] = useState({
    name: "Vestido Midi Canelado com Fenda",
    price: "R$ 149,90",
    discountPrice: "R$ 69,90",
    fabric: "Canelado encorpado 320g com elastano",
    benefit: "Zero transparência, modela a cintura e não marca",
    urgency: "Últimas 12 unidades com frete grátis liberado",
    streamerStyle: "vendedora_amiga",
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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
    {
      id: "fb-5",
      stepNumber: 5,
      timeframe: "00:32 - 00:40",
      durationSeconds: 8,
      stageName: "5. Benefício do Corpo",
      badge: "Modelagem",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      actionGuide: "Aponta para o caimento da cintura e quadril.",
      speech: "O caimento veste como uma luva porque modela a cintura sem marcar nada no corpo!",
      hookTrigger: "Desejo de auto-estima e conforto",
    },
    {
      id: "fb-6",
      stepNumber: 6,
      timeframe: "00:40 - 00:48",
      durationSeconds: 8,
      stageName: "6. Comparativo de Shopping",
      badge: "Ancoragem",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      actionGuide: "Balança a cabeça afirmativamente mostrando a etiqueta.",
      speech: "Em loja de shopping vocês pagam fácil R$ 149,90, mas aqui no TikTok Shop hoje tá saindo por apenas R$ 69,90!",
      hookTrigger: "Percepção de ganho financeiro extremo",
    },
    {
      id: "fb-7",
      stepNumber: 7,
      timeframe: "00:48 - 00:56",
      durationSeconds: 8,
      stageName: "7. Respondendo Tamanhos",
      badge: "Chat Ao Vivo",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      actionGuide: "Olha para baixo simulando ler um comentário e responde rindo.",
      speech: "A Mariana perguntou do tamanho: meninas, a grade vai do P ao GG e o elastano se adapta perfeitamente!",
      hookTrigger: "Humanização e prova social ao vivo",
    },
    {
      id: "fb-8",
      stepNumber: 8,
      timeframe: "00:56 - 01:04",
      durationSeconds: 8,
      stageName: "8. Frete & Envio Expresso",
      badge: "Confiança",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      actionGuide: "Faz sinal de positivo com as mãos.",
      speech: "O frete é expresso com envio em até 24h e rastreio direto pelo app do TikTok até sua casa!",
      hookTrigger: "Segurança na entrega rápida",
    },
    {
      id: "fb-9",
      stepNumber: 9,
      timeframe: "01:04 - 01:12",
      durationSeconds: 8,
      stageName: "9. Alerta de Escassez",
      badge: "Urgência",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      actionGuide: "Olha para a tela com expressão de surpresa.",
      speech: "Atenção: o sistema acabou de avisar que restam apenas 12 unidades nesse valor promocional!",
      hookTrigger: "FOMO (medo de ficar sem)",
    },
    {
      id: "fb-10",
      stepNumber: 10,
      timeframe: "01:12 - 01:20",
      durationSeconds: 8,
      stageName: "10. Chamada para a Sacolinha",
      badge: "Clique no Carrinho",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      actionGuide: "Aponta com o dedo para o canto inferior esquerdo onde fica a sacolinha amarela.",
      speech: "Clica agora na sacolinha amarela aqui embaixo no cantinho e garante a sua antes que encerre o lote!",
      hookTrigger: "CTA clara de conversão",
    },
    {
      id: "fb-11",
      stepNumber: 11,
      timeframe: "01:20 - 01:28",
      durationSeconds: 8,
      stageName: "11. Cor e Variação",
      badge: "Seleção Rápida",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      actionGuide: "Mostra as opções de cores ou fita de tecido.",
      speech: "Escolhe sua cor e tamanho na sacolinha, clica em comprar com cupom e volta aqui pra me avisar no chat!",
      hookTrigger: "Facilitação da jornada de compra",
    },
    {
      id: "fb-12",
      stepNumber: 12,
      timeframe: "01:28 - 01:36",
      durationSeconds: 8,
      stageName: "12. Reinício do Loop 24/7",
      badge: "Loop Infinito",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      actionGuide: "Ajeita a peça e saúda quem acabou de entrar.",
      speech: "Pra você que acabou de cair na nossa live oficial de fábrica, deixa eu te mostrar agora por que essa peça é perfeita...",
      hookTrigger: "Transição suave para repetição 24h sem quebra",
    },
  ]);

  // Mutation to generate live script dynamically with Gemini
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await generateLiveScriptServerFn({
        data: {
          productName: productForm.name,
          price: productForm.price,
          discountPrice: productForm.discountPrice,
          fabric: productForm.fabric,
          benefit: productForm.benefit,
          urgency: productForm.urgency,
          streamerStyle: productForm.streamerStyle,
        },
      });
      return res;
    },
    onSuccess: (data) => {
      if (data && data.blocks.length > 0) {
        setLiveBlocks(data.blocks);
        toast.success("Novo roteiro de Live gerado via Gemini com falas de até 8s!");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar roteiro.");
    },
  });

  // Teleprompter / Live Reader Mode
  const [isTeleprompterActive, setIsTeleprompterActive] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(30); // pixels per sec
  const [isScrolling, setIsScrolling] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement | null>(null);

  // Teleprompter autoscroll effect
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollStep = (currentTime: number) => {
      if (isScrolling && teleprompterRef.current) {
        const delta = (currentTime - lastTime) / 1000;
        teleprompterRef.current.scrollTop += teleprompterSpeed * delta;
      }
      lastTime = currentTime;
      if (isScrolling) {
        animationFrameId = requestAnimationFrame(scrollStep);
      }
    };

    if (isScrolling) {
      animationFrameId = requestAnimationFrame(scrollStep);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isScrolling, teleprompterSpeed]);

  const copyFullLiveScript = async () => {
    const fullText = liveBlocks
      .map(
        (b) =>
          `[${b.timeframe}] ${b.stageName} (Duração: ${b.durationSeconds}s)\nAção: ${b.actionGuide}\nFala: "${b.speech}"\nGatilho: ${b.hookTrigger}\n`
      )
      .join("\n═══════════════════════════════════════════════════\n\n");
    await navigator.clipboard.writeText(fullText);
    toast.success("Roteiro completo de Live copiado!");
  };

  const copySingleBlock = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Micro-fala copiada!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="bento-hero p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="border-red-500/30 bg-red-500/10 text-red-400 font-bold px-3 py-1 text-xs animate-pulse">
            <Radio className="mr-1.5 size-3.5" /> Transmissão & Avatar IA 24/7
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-white">
            Scripts de Live IA (Cenas ≤ 8s com Gemini)
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 md:text-base">
            Gera roteiros completos para Lives de TikTok Shop e avatares contínuos, divididos rigorosamente em{" "}
            <strong>falas rápidas de até 8 segundos</strong> para ritmo dinâmico, retenção ininterrupta e loop infinito.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
              <Sparkles className="size-3.5 text-amber-400" /> IA Gemini com Scripts Sempre Diferentes
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
              <Zap className="size-3.5 text-cyan-400" /> Falas de 6 a 8 Segundos
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
              <RotateCcw className="size-3.5 text-emerald-400" /> Loop 24h para OBS e TikTok Live Studio
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid: Form + Micro-Blocks */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left Column: Product Data Form */}
        <div className="space-y-4">
          <div className="bento-card rounded-2xl border border-white/10 bg-[#0e1017] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShoppingBag className="size-4 text-cyan-400" /> Produto da Live
              </h2>
            </div>

            {/* Quick Product Library Picker */}
            {productsQuery.data && productsQuery.data.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-400">Puxar da Biblioteca de Produtos</Label>
                <select
                  className="w-full h-9 rounded-xl border border-white/10 bg-[#161822] px-3 text-xs text-white outline-none focus:border-cyan-400"
                  value={selectedProductId || ""}
                  onChange={(e) => {
                    const found = productsQuery.data?.find((p) => p.id === e.target.value);
                    if (found) {
                      setSelectedProductId(found.id);
                      setProductForm((prev) => ({
                        ...prev,
                        name: found.name,
                        price: found.price !== null ? `R$ ${found.price}` : prev.price,
                        discountPrice: prev.discountPrice,
                        benefit: Array.isArray(found.benefits) ? found.benefits.join(", ") : prev.benefit,
                      }));
                      toast.success(`Dados de "${found.name}" preenchidos!`);
                    }
                  }}
                >
                  <option value="">Selecione um produto salvo...</option>
                  {productsQuery.data.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label className="text-[11px] text-slate-400 font-medium">Nome do Produto</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Conjunto Alfaiataria Feminino"
                  className="mt-1 h-9 border-white/10 bg-[#161822] text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-slate-400 font-medium">Preço Normal</Label>
                  <Input
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="R$ 149,90"
                    className="mt-1 h-9 border-white/10 bg-[#161822] text-xs text-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400 font-medium text-emerald-400">Preço Live (Desconto)</Label>
                  <Input
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    placeholder="R$ 69,90"
                    className="mt-1 h-9 border-white/10 bg-[#161822] text-xs text-emerald-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-slate-400 font-medium">Tecido & Toque</Label>
                <Input
                  value={productForm.fabric}
                  onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                  placeholder="Ex: Linho com viscose e elastano premium"
                  className="mt-1 h-9 border-white/10 bg-[#161822] text-xs text-white"
                />
              </div>

              <div>
                <Label className="text-[11px] text-slate-400 font-medium">Benefício / Caimento</Label>
                <Textarea
                  value={productForm.benefit}
                  onChange={(e) => setProductForm({ ...productForm, benefit: e.target.value })}
                  placeholder="Ex: Não amassa, cintura alta modeladora, zero transparência"
                  rows={2}
                  className="mt-1 resize-none border-white/10 bg-[#161822] text-xs text-white"
                />
              </div>

              <div>
                <Label className="text-[11px] text-slate-400 font-medium text-amber-400">Urgência / Escassez</Label>
                <Input
                  value={productForm.urgency}
                  onChange={(e) => setProductForm({ ...productForm, urgency: e.target.value })}
                  placeholder="Ex: Últimas 15 peças com frete grátis"
                  className="mt-1 h-9 border-white/10 bg-[#161822] text-xs text-amber-300"
                />
              </div>
            </div>

            <Button
              className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-black shadow-lg gap-2"
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Gerando com Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Gerar Novo Script com Gemini
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Micro-blocks list & Teleprompter Mode */}
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e1017] p-3.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs font-bold px-2.5 py-1">
                {liveBlocks.length} Falas de até 8s
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Total: ~{(liveBlocks.length * 8)}s ({Math.floor((liveBlocks.length * 8) / 60)}m {((liveBlocks.length * 8) % 60)}s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                onClick={() => setIsTeleprompterActive(!isTeleprompterActive)}
              >
                <Eye className="size-3.5 mr-1.5 text-cyan-400" />
                {isTeleprompterActive ? "Modo Cartões" : "Modo Teleprompter"}
              </Button>

              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-primary text-black shadow"
                onClick={copyFullLiveScript}
              >
                <Copy className="size-3.5 mr-1.5" /> Copiar Roteiro Completo
              </Button>
            </div>
          </div>

          {/* Teleprompter Reader Mode */}
          {isTeleprompterActive ? (
            <div className="rounded-2xl border border-cyan-500/30 bg-[#08090d] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="size-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Teleprompter de Live</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Velocidade:</span>
                    <input
                      type="range"
                      min="15"
                      max="70"
                      value={teleprompterSpeed}
                      onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                      className="w-24 accent-cyan-400"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-white/15"
                    onClick={() => setIsScrolling(!isScrolling)}
                  >
                    {isScrolling ? <Pause className="size-3 mr-1" /> : <Play className="size-3 mr-1" />}
                    {isScrolling ? "Pausar" : "Rolar Auto"}
                  </Button>
                </div>
              </div>

              <div
                ref={teleprompterRef}
                className="h-[460px] overflow-y-auto pr-3 space-y-6 scroll-smooth"
              >
                {liveBlocks.map((block) => (
                  <div key={block.id} className="space-y-1.5 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">{block.timeframe}</span>
                      <span className="text-[10px] text-slate-400">· {block.actionGuide}</span>
                    </div>
                    <p className="text-xl font-bold leading-relaxed text-slate-100 font-sans">
                      "{block.speech}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Cards View: Micro-Blocks (≤ 8s each) */
            <div className="space-y-3">
              {liveBlocks.map((block, idx) => (
                <article
                  key={block.id}
                  className="bento-card group rounded-xl border border-white/10 bg-[#0e1017] p-4 shadow-md hover:border-cyan-400/40 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white font-mono">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white">{block.stageName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{block.timeframe}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({block.durationSeconds}s)</span>
                          <Badge className={`text-[9px] px-1.5 py-0 border ${block.badgeColor}`}>
                            {block.badge}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copySingleBlock(block.speech, idx)}
                      className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-white/5 transition flex items-center gap-1 text-[11px]"
                      title="Copiar micro-fala"
                    >
                      {copiedIndex === idx ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      <span className="hidden sm:inline">{copiedIndex === idx ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>

                  {/* Spoken text & visual guide */}
                  <div className="mt-3 space-y-2">
                    <div className="rounded-lg bg-black/40 p-3 text-xs leading-relaxed text-slate-100 font-medium border border-white/5">
                      "{block.speech}"
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className="flex items-center gap-1">
                        <strong className="text-slate-300">Ação no Vídeo:</strong> {block.actionGuide}
                      </span>
                      <span className="text-slate-500 italic">
                        {block.hookTrigger}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
