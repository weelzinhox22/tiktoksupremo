import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listProductLibrary } from "@/features/libraries/queries";

export const Route = createFileRoute("/_authenticated/live-scripts")({
  component: LiveScriptsPage,
});

interface LiveBlock {
  id: string;
  title: string;
  timeframe: string;
  badge: string;
  badgeColor: string;
  goal: string;
  script: string;
  tips: string;
}

function generateLiveScriptBlocks(product: {
  name: string;
  price: string;
  discountPrice: string;
  fabric: string;
  benefit: string;
  urgency: string;
}): LiveBlock[] {
  const name = product.name || "Vestido Midi Canelado";
  const price = product.price || "R$ 149,90";
  const discountPrice = product.discountPrice || "R$ 69,90";
  const fabric = product.fabric || "Canelado encorpado 320g com elastano";
  const benefit = product.benefit || "Zero transparência, modela a cintura e não amassa";
  const urgency = product.urgency || "Últimas 12 unidades com frete grátis";

  return [
    {
      id: "block-1",
      title: "1. Acolhimento & Retenção de Entrada",
      timeframe: "00:00 - 00:45",
      badge: "Gatilho de Chegada",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      goal: "Segurar quem acabou de cair na live nos primeiros 5 segundos e gerar curiosidade imediata.",
      script: `Oi meninas! Sejam muito bem-vindas à nossa live oficial de fábrica! Quem tá chegando agora já digita aqui no chat de qual cidade vocês tão assistindo. Gente, se você tá procurando uma peça elegante, confortável e que não fica nada transparente, fica comigo porque hoje conseguimos liberar um lote exclusivo do ${name} direto da confecção por menos da metade do preço de shopping!`,
      tips: "Fale com energia alta e gesticule mostrando o produto logo no início da transmissão.",
    },
    {
      id: "block-2",
      title: "2. Demonstração Sensorial & Prova ao Vivo",
      timeframe: "00:45 - 02:00",
      badge: "Quebra de Objeções",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      goal: "Provar a qualidade do tecido de perto, elasticidade e caimento para eliminar o medo de comprar online.",
      script: `Deixa eu puxar a câmera bem de pertinho pra vocês verem a textura desse tecido. Olha a gramatura desse ${fabric}! Estou esticando com força aqui na live e vejam: ele não deforma, não fica transparente de jeito nenhum e tem toque aveludado. O caimento veste como uma luva porque ${benefit}. Em loja de shopping vocês pagam fácil ${price}, mas aqui no TikTok Shop hoje tá saindo por apenas ${discountPrice}!`,
      tips: "Aproxime a peça da lente, estique o tecido e mostre o acabamento das costuras.",
    },
    {
      id: "block-3",
      title: "3. Interação com Comentários & Validação Social",
      timeframe: "02:00 - 03:15",
      badge: "Gatilho de Prova Social",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      goal: "Simular ou responder dúvidas comuns sobre tamanhos, prazo de entrega e caimento real.",
      script: `Vi que a Mariana perguntou aqui no chat: 'Veste qual tamanho?'. Meninas, a grade vai do P ao GG, tem elastano premium então estica super bem e se adapta ao seu corpo sem apertar. E pra quem tá perguntando sobre o envio: o frete é expresso com rastreio direto pelo TikTok e chega rapidinho na sua casa. Quem já garantiu a sua coloca um coraçãozinho no chat pra eu ver!`,
      tips: "Responda citando nomes de espectadoras para criar sensação de transmissão 100% humanizada.",
    },
    {
      id: "block-4",
      title: "4. Disparo de Escassez & Chamada para a Sacolinha",
      timeframe: "03:15 - 04:15",
      badge: "Pico de Conversão",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      goal: "Direcionar os cliques imediatos para o carrinho amarelo com senso de urgência real.",
      script: `Atenção, meninas: o sistema do TikTok Shop acabou de avisar que restam ${urgency}! Para pegar o desconto de ${discountPrice} com o cupom de frete grátis, é só clicar na sacolinha amarela aqui embaixo no cantinho esquerdo. Seleciona seu tamanho e sua cor favorita antes que esgote, porque quando bater a meta da live o preço volta para ${price}!`,
      tips: "Aponte o dedo para o canto inferior esquerdo onde fica o carrinho amarelo.",
    },
    {
      id: "block-5",
      title: "5. Transição Suave & Reinício do Loop",
      timeframe: "04:15 - 05:00",
      badge: "Loop Contínuo 24/7",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      goal: "Conectar o fim do roteiro de volta ao início de forma natural para transmissões contínuas com avatar IA.",
      script: `Se você acabou de entrar e perdeu os detalhes, calma que eu vou recapitular tudo agora pra quem chegou agora! Estamos apresentando o ${name} direto de fábrica com condição especial de lote. Deixa eu te mostrar de novo por que todo mundo tá apaixonado nessa peça...`,
      tips: "Ao usar avatar IA no OBS/TikTok Live Studio, esse bloco garante que a live rode 24 horas sem cortes bruscos.",
    },
  ];
}

function LiveScriptsPage() {
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });

  const [productForm, setProductForm] = useState({
    name: "Vestido Midi Canelado com Fenda",
    price: "R$ 149,90",
    discountPrice: "R$ 69,90",
    fabric: "Canelado encorpado 320g com elastano",
    benefit: "Zero transparência, modela a cintura e não marca",
    urgency: "Últimas 12 unidades com frete grátis",
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [liveBlocks, setLiveBlocks] = useState<LiveBlock[]>(() => generateLiveScriptBlocks(productForm));

  // Teleprompter / Live Reader Mode
  const [isTeleprompterActive, setIsTeleprompterActive] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(30); // pixels per sec
  const [isScrolling, setIsScrolling] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement | null>(null);

  const handleUpdateScript = () => {
    setLiveBlocks(generateLiveScriptBlocks(productForm));
    toast.success("Roteiro de Live atualizado com os dados do produto!");
  };

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
          `═══════════════════════════════════════════════════\n${b.title} (${b.timeframe})\nObjetivo: ${b.goal}\n═══════════════════════════════════════════════════\n\n"${b.script}"\n\n[DICA DE TRANSMISSÃO]: ${b.tips}\n`
      )
      .join("\n\n");
    await navigator.clipboard.writeText(fullText);
    toast.success("Roteiro completo de Live copiado para a área de transferência!");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="bento-hero flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1.5 animate-pulse">
              <Radio className="size-3 text-red-400" />
              TikTok Shop Live AI Studio
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Loop Contínuo 24/7 & Teleprompter
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Gerador de Scripts para Lives IA
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Roteiros persuasivos e contínuos para transmissões ao vivo de alta conversão no TikTok Shop com avatares e clones de IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            className="gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10"
            onClick={() => setIsTeleprompterActive((prev) => !prev)}
          >
            <Clock className="size-4 text-red-400" />
            {isTeleprompterActive ? "Modo Editor" : "Modo Teleprompter Ao Vivo"}
          </Button>

          <Button variant="hero" className="gap-1.5" onClick={copyFullLiveScript}>
            <ClipboardCopy className="size-4" />
            Copiar Roteiro Completo
          </Button>
        </div>
      </header>

      {/* Main Grid: Left Setup, Right Live Script Blocks / Teleprompter */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Product Setup & Live Triggers (4 cols) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Store Product Quick Selector */}
          <div className="bento-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShoppingBag className="size-3.5 text-primary" />
                Produto da Loja
              </Label>
              <Badge variant="secondary" className="text-[10px]">
                {productsQuery.data?.length || 0} produtos
              </Badge>
            </div>

            {productsQuery.data && productsQuery.data.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {productsQuery.data.map((p) => {
                  const isSelected = selectedProductId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setProductForm({
                          name: p.name,
                          price: "R$ 149,90",
                          discountPrice: "R$ 69,90",
                          fabric: p.description || "Canelado encorpado 320g",
                          benefit: "Caimento impecável e modelagem perfeita",
                          urgency: "Últimas 10 unidades com frete grátis",
                        });
                        setLiveBlocks(
                          generateLiveScriptBlocks({
                            name: p.name,
                            price: "R$ 149,90",
                            discountPrice: "R$ 69,90",
                            fabric: p.description || "Canelado encorpado 320g",
                            benefit: "Caimento impecável e modelagem perfeita",
                            urgency: "Últimas 10 unidades com frete grátis",
                          })
                        );
                        toast.success(`Dados de "${p.name}" aplicados ao roteiro de live!`);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border/50 bg-card/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="size-9 rounded bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.previewUrl ? (
                          <img src={p.previewUrl} alt={p.name} className="size-full object-cover" />
                        ) : (
                          <Package className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.category || "Vestuário"}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Cadastre seus produtos na aba Produtos para carregar em 1 clique.
              </p>
            )}
          </div>

          {/* Form Settings */}
          <div className="bento-card p-5 space-y-3.5">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Sliders className="size-4 text-primary" />
              Variáveis da Transmissão
            </h2>

            <div className="space-y-1">
              <Label className="text-xs">Nome do Produto em Destaque</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Preço de Vitrine</Label>
                <Input
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-emerald-400 font-bold">Preço Especial Live</Label>
                <Input
                  value={productForm.discountPrice}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                  className="h-8 text-xs bg-background font-bold text-emerald-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Tecido & Toque Sensorial</Label>
              <Input
                value={productForm.fabric}
                onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Diferencial / Benefício Chave</Label>
              <Input
                value={productForm.benefit}
                onChange={(e) => setProductForm({ ...productForm, benefit: e.target.value })}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-pink-400 font-medium">Gatilho de Urgência da Live</Label>
              <Input
                value={productForm.urgency}
                onChange={(e) => setProductForm({ ...productForm, urgency: e.target.value })}
                className="h-8 text-xs bg-background"
              />
            </div>

            <Button
              type="button"
              variant="hero"
              className="w-full h-8 text-xs font-bold mt-2"
              onClick={handleUpdateScript}
            >
              <Sparkles className="size-3.5 mr-1" />
              Regerar Roteiro de Live
            </Button>
          </div>

          {/* Live Pro Tips */}
          <div className="bento-card p-4 space-y-2 bg-gradient-to-br from-red-500/10 via-transparent to-transparent border-red-500/20">
            <h3 className="text-xs font-bold text-red-300 flex items-center gap-1.5">
              <Flame className="size-3.5 text-red-400" />
              Segredos da Live 24/7 no TikTok Shop
            </h3>
            <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
              <li>• O loop de 5 minutos é o tempo ideal médio que um usuário fica na live antes de comprar.</li>
              <li>• Fixe o produto número #1 na sacolinha amarela durante toda a transmissão.</li>
              <li>• Mantenha a música de fundo em volume baixo (-20dB) para a voz da IA soar limpa e profissional.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Script Blocks OR Teleprompter Mode (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          {isTeleprompterActive ? (
            /* Teleprompter Live Mode */
            <div className="bento-card p-6 bg-slate-950/95 border-red-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-3 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-sm text-red-400 uppercase tracking-wider">
                    Teleprompter Ao Vivo (Rolagem Automática)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isScrolling ? "destructive" : "hero"}
                    className="h-8 text-xs font-bold gap-1"
                    onClick={() => setIsScrolling((prev) => !prev)}
                  >
                    {isScrolling ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    {isScrolling ? "Pausar Rolagem" : "Iniciar Rolagem"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => {
                      if (teleprompterRef.current) teleprompterRef.current.scrollTop = 0;
                    }}
                  >
                    <RotateCcw className="size-3.5" /> Reiniciar
                  </Button>
                </div>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3 bg-card/60 p-2.5 rounded-lg border border-border/50 text-xs">
                <span className="text-muted-foreground font-medium">Velocidade da leitura:</span>
                <input
                  type="range"
                  min="15"
                  max="70"
                  value={teleprompterSpeed}
                  onChange={(e) => setTeleprompterSpeed(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="font-mono text-primary font-bold">{teleprompterSpeed} px/s</span>
              </div>

              {/* Teleprompter Scrolling Container */}
              <div
                ref={teleprompterRef}
                className="h-[520px] overflow-y-auto pr-3 space-y-8 font-sans text-xl leading-relaxed text-slate-100 select-none p-4 rounded-xl bg-black/70 border border-white/5"
              >
                {liveBlocks.map((block) => (
                  <div key={block.id} className="space-y-2 border-l-4 border-primary pl-4 py-1">
                    <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wider">
                      <span>{block.title}</span>
                      <span className="text-muted-foreground font-mono">({block.timeframe})</span>
                    </div>
                    <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-100">
                      "{block.script}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Script Blocks Mode */
            <div className="space-y-4">
              {liveBlocks.map((block, idx) => (
                <article
                  key={block.id}
                  className="bento-card p-5 space-y-3.5 border-border/50 hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                        0{idx + 1}
                      </span>
                      <h2 className="font-bold text-base text-foreground">{block.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{block.timeframe}</span>
                      <Badge className={`text-[10px] font-semibold ${block.badgeColor}`}>
                        {block.badge}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-amber-400 shrink-0" />
                    <strong>Meta do Bloco:</strong> {block.goal}
                  </p>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-sans text-sm leading-relaxed text-slate-100">
                    "{block.script}"
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                    <span className="italic text-[11px] text-amber-300/80">
                      💡 <strong>Dica de Ação:</strong> {block.tips}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5 self-end sm:self-auto hover:bg-primary/10 hover:text-primary"
                      onClick={async () => {
                        await navigator.clipboard.writeText(block.script);
                        toast.success(`Bloco ${idx + 1} copiado!`);
                      }}
                    >
                      <ClipboardCopy className="size-3" /> Copiar Bloco
                    </Button>
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
