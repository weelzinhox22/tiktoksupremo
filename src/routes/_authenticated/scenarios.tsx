import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  FileCode,
  Sun,
  Camera,
  Layers,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Clapperboard,
  Sparkle,
  Image as ImageIcon,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { toast } from "sonner";
import type { ScenarioProfile } from "@/features/four-modules/types";
import { scenarioRepository } from "@/features/four-modules/repositories";
import { buildScenarioConsistencyBlock } from "@/features/four-modules/services";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/scenarios")({
  component: ScenariosPage,
  head: () => ({ meta: [{ title: "Biblioteca de Cenários & Gerador Flux — Tik Supremo" }] }),
});

interface FluxScenarioPreset {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  fluxPrompt: string;
  lighting: string;
  surface: string;
  decor: string;
}

const FLUX_SCENARIO_PRESETS: FluxScenarioPreset[] = [
  {
    id: "flux-1",
    name: "Quarto Minimalista Pinterest (Tapete Felpudo & Madeira)",
    category: "bedroom",
    categoryLabel: "Quarto Acolhedor",
    description: "Cenário favorito para vídeos unboxing e flat lay: tapete fofo cream, piso de carvalho claro e luz solar suave de janela.",
    fluxPrompt: `Ultra-realistic 8k smartphone photo of a cozy minimalist bedroom setup, soft fluffy cream carpet on light oak wooden floor, warm golden hour sunlight streaming from a side window, subtle marble side table partially visible, neutral dried flower arrangement in ceramic vase, perfume bottle, delicate aesthetic decor, Pinterest fashion unboxing POV, authentic realistic shadows, no studio lighting, 9:16 vertical --ar 9:16 --v 6.1`,
    lighting: "Golden Hour Suave (Luz natural de janela lateral)",
    surface: "Tapete felpudo bege/cream sobre piso de carvalho claro",
    decor: "Mesinha de mármore, vaso cerâmico com flores secas, perfume e pratinho de anéis",
  },
  {
    id: "flux-2",
    name: "Closet de Boutique Chic & Provador",
    category: "boutique",
    categoryLabel: "Boutique & Moda",
    description: "Ambiente sofisticado de loja boutique com araras de metal dourado, espelho de chão com moldura orgânica e iluminação quente.",
    fluxPrompt: `High-end fashion boutique showroom corner, modern luxury interior, minimalist brass clothing rack with beige linen hangers, full-length arched golden floor mirror, warm ambient spotlights, clean polished microcement floor, elegant neutral palette, authentic boutique lighting, 9:16 vertical --ar 9:16`,
    lighting: "Spots direcionais quentes 3000K com luz difusa de fundo",
    surface: "Piso de microcimento acetinado neutro",
    decor: "Arara de latão dourado, espelho orgânico de corpo inteiro e poltrona boucle",
  },
  {
    id: "flux-3",
    name: "Sala de Estar Escandinava Clean",
    category: "living_room",
    categoryLabel: "Sala & Sofá",
    description: "Cenário amplo e iluminado com sofá em tecido boucle off-white, plantas naturais e luz difusa da manhã.",
    fluxPrompt: `Bright Scandinavian aesthetic living room, natural morning daylight filling the room, cozy textured off-white boucle sofa, light travertine coffee table, large fiddle leaf fig plant, sheer white linen curtains, minimal clean styling, realistic smartphone exposure, 9:16 vertical --ar 9:16`,
    lighting: "Luz difusa da manhã através de cortinas de linho",
    surface: "Tapete de juta e lã mesclada",
    decor: "Sofá boucle off-white, mesa de travertino e planta natural",
  },
  {
    id: "flux-4",
    name: "Banheiro de Mármore Spa Luxo",
    category: "bathroom",
    categoryLabel: "Skincare & Beleza",
    description: "Perfeito para cosméticos, perfumes e autocuidado: bancada de mármore calacatta com espelho iluminado e toalhas de algodão.",
    fluxPrompt: `Luxury modern bathroom vanity with white Calacatta marble countertop, brushed brass faucet, backlit round mirror with soft warm glow, small glass tray with skincare bottles, folded plush white cotton towels, high-end spa aesthetic, realistic moisture reflections, 9:16 vertical --ar 9:16`,
    lighting: "Espelho retroiluminado com temperatura suave 4000K",
    surface: "Bancada de mármore Calacatta branco com veios cinza",
    decor: "Bandeja de vidro, toalhas dobradas e torneira em latão escovado",
  },
  {
    id: "flux-5",
    name: "Cozinha Gourmet Americana & Ilha",
    category: "kitchen",
    categoryLabel: "Casa & Utilidades",
    description: "Cenário premium para produtos de cozinha e utilidades: ilha de quartzo branco com banquetas e armários em madeira ripada.",
    fluxPrompt: `Modern open-concept gourmet kitchen island with white quartz countertop, warm under-cabinet LED lighting, fluted oak wood cabinetry, clean minimalist styling, natural daylight, POV angle, shot on iPhone 15 Pro, realistic home setting, 9:16 vertical --ar 9:16`,
    lighting: "Fitas LED embutidas sob os armários + luz natural",
    surface: "Ilha central em quartzo branco polido",
    decor: "Armários ripados em carvalho e tábua de madeira rústica",
  },
];

function ScenariosPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"library" | "flux_builder">("library");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Flux Builder State
  const [customRoom, setCustomRoom] = useState("Quarto Minimalista Acolhedor");
  const [customLighting, setCustomLighting] = useState("Golden hour natural de janela lateral");
  const [customSurface, setCustomSurface] = useState("Tapete felpudo bege/cream sobre piso de madeira");
  const [customDecor, setCustomDecor] = useState("Mesinha de mármore, flores secas em vaso cerâmico, perfume e espelho dourado");
  const [customAesthetic, setCustomAesthetic] = useState("Pinterest Aesthetic (POV Smartphone Hiper-realista)");

  const generatedFluxPrompt = `Ultra-realistic 8k photo of a ${customRoom.toLowerCase()}, surface: ${customSurface.toLowerCase()}, lighting: ${customLighting.toLowerCase()}, decor elements: ${customDecor.toLowerCase()}, aesthetic: ${customAesthetic.toLowerCase()}, shot on iPhone 15 Pro, authentic soft shadows and realistic texture, no studio lighting, clean framing for TikTok Shop fashion/product unboxing POV, 9:16 vertical --ar 9:16 --v 6.1`;

  const scenariosQuery = useQuery({
    queryKey: ["scenarios", user.id],
    queryFn: () => scenarioRepository.list(user.id),
  });

  const saveFluxScenarioMutation = useMutation({
    mutationFn: async (preset: { name: string; description: string; fluxPrompt: string; category: string }) => {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase.from("scenarios").insert({
        user_id: user.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        environment: {
          spaceType: preset.name,
          wall: "Neutro",
          floor: "Madeira clara",
          ceiling: "Branco",
          furniture: ["Móveis minimalistas"],
          decor: ["Decoração estética"],
          depth: "3m",
        },
        lighting: {
          mainSource: "Janela natural",
          temperature: "4500K",
          intensity: "Suave",
          contrast: "Baixo",
          shadows: "Suaves",
          naturalLight: "Abundante",
          preset: "natural_golden",
        },
        camera_presets: [
          {
            id: `cp-${Date.now()}`,
            name: "Overhead Top-Down 9:16",
            framing: "Plano fixo superior",
            height: "1.8m",
            distance: "1.2m",
            angle: "90 graus",
            depthOfField: "Nitidez total no plano",
            promptSnippet: preset.fluxPrompt,
          },
        ],
        fixed_elements: [],
        action_zones: {
          characterZone: "Mãos na base",
          productZone: "Centro do tapete",
          demonstrationZone: "Área central",
          textSafeZone: "Terço superior",
        },
        audio: {
          ambientNoise: "Silencioso",
          reverberation: "Mínima",
          suggestedMusic: "Lo-fi acústico",
          forbiddenSounds: [],
        },
        environment_prompt: preset.fluxPrompt,
        lighting_prompt: "Warm golden hour natural window light",
        camera_prompt: "Static top-down overhead view",
        continuity_prompt: "Preserve exact same scene and objects",
        negative_prompt: "camera movement, deformed objects, floating items, artificial studio lighting",
        compatible_formats: ["UGC", "UNBOXING", "FASHION", "FLAT LAY"],
        compatible_categories: ["Moda", "Beleza", "Casa", "Acessórios"],
        tags: ["flux", "cenario real", preset.category, "midjourney"],
      });
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success("Cenário salvo na Biblioteca com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    toast.success("Prompt Flux / Midjourney copiado para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scenarios = (scenariosQuery.data ?? []).filter((s) => {
    const matchesSearch = `${s.name} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="bento-hero p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold px-3 py-1 text-xs">
            <Building2 className="mr-1.5 size-3.5" /> Cenários Hiper-realistas & Flux
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-white">
            Biblioteca de Cenários & Gerador Flux
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 md:text-base">
            Crie cenários reais e consistentes para suas gravações usando prompts calibrados para o{" "}
            <strong>Flux 1.1 e Midjourney</strong>. Mantenha a mesma iluminação, tapetes, móveis e identidade visual em todos os vídeos.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
              <Sparkles className="size-3.5 text-amber-400" /> Prompts Otimizados para Flux 1.1
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
              <Sun className="size-3.5 text-cyan-400" /> Iluminação Golden Hour & Soft Natural
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
              <Layers className="size-3.5 text-emerald-400" /> Consistência 100% no VEO / Kling
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "library"
              ? "bg-primary text-black shadow-md shadow-primary/20"
              : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          <Building2 className="size-3.5" /> Cenários Prontos & Salvos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flux_builder")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "flux_builder"
              ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20"
              : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          <Wand2 className="size-3.5" /> Criar Cenário Customizado com Flux
        </button>
      </div>

      {activeTab === "library" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400" /> Cenários Fotográficos de Alta Conversão (Flux & Midjourney)
            </h2>
            <span className="text-xs text-slate-400">5 modelos profissionais pré-calibrados</span>
          </div>

          {/* Grid of Ready Flux Presets */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FLUX_SCENARIO_PRESETS.map((preset) => (
              <article
                key={preset.id}
                className="bento-card group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e1017] p-5 shadow-xl hover:border-cyan-400/40 hover:bg-white/[0.02] transition-all"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-bold">
                      {preset.categoryLabel}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-500">Flux 1.1 / Midjourney</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-400">
                    {preset.description}
                  </p>

                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-1.5 text-[11px] text-slate-400">
                    <p><strong className="text-slate-300">Iluminação:</strong> {preset.lighting}</p>
                    <p><strong className="text-slate-300">Superfície:</strong> {preset.surface}</p>
                    <p><strong className="text-slate-300">Decoração:</strong> {preset.decor}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Sparkles className="size-3" /> Prompt Flux em Inglês:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(preset.fluxPrompt, preset.id)}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
                      >
                        {copiedId === preset.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        {copiedId === preset.id ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/50 p-2.5 text-[11px] leading-relaxed text-slate-400 font-mono line-clamp-3">
                      {preset.fluxPrompt}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold flex-1 border-white/10 bg-white/[0.02] hover:bg-white/[0.08]"
                    onClick={() => handleCopyPrompt(preset.fluxPrompt, preset.id)}
                  >
                    <Copy className="size-3.5 mr-1" /> Copiar Prompt
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-primary text-black flex-1 shadow"
                    onClick={() => saveFluxScenarioMutation.mutate(preset)}
                  >
                    <Plus className="size-3.5 mr-1" /> Salvar Cenário
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* User's custom saved scenarios */}
          {scenarios.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cenários Salvos na sua Biblioteca ({scenarios.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {scenarios.map((sc) => (
                  <div key={sc.id} className="rounded-xl border border-white/10 bg-[#0e1017] p-4 space-y-2">
                    <span className="text-xs font-bold text-white block">{sc.name}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{sc.description}</p>
                    <div className="pt-2 flex justify-between items-center">
                      <Badge variant="outline" className="text-[9px]">{sc.category}</Badge>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" asChild>
                        <Link to="/projects/new" search={{ setting: sc.name }}>
                          Usar em Roteiro
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "flux_builder" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Left Form: Custom Scenario Parameters */}
          <div className="bento-card rounded-2xl border border-white/10 bg-[#0e1017] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wand2 className="size-4 text-cyan-400" /> Parâmetros do Cenário Realista
            </h2>

            <div className="space-y-3.5">
              <div>
                <Field label="Tipo de Espaço / Cômodo">
                  <Input
                    value={customRoom}
                    onChange={(e) => setCustomRoom(e.target.value)}
                    placeholder="Ex: Quarto contemporâneo minimalista"
                    className="h-9 border-white/10 bg-[#161822] text-xs text-white"
                  />
                </Field>
              </div>

              <div>
                <Field label="Iluminação & Temperatura">
                  <Input
                    value={customLighting}
                    onChange={(e) => setCustomLighting(e.target.value)}
                    placeholder="Ex: Golden hour natural suave entrando pela janela"
                    className="h-9 border-white/10 bg-[#161822] text-xs text-white"
                  />
                </Field>
              </div>

              <div>
                <Field label="Superfície Principal (Onde fica o produto)">
                  <Input
                    value={customSurface}
                    onChange={(e) => setCustomSurface(e.target.value)}
                    placeholder="Ex: Tapete fofo bege/cream sobre piso de madeira carvalho claro"
                    className="h-9 border-white/10 bg-[#161822] text-xs text-white"
                  />
                </Field>
              </div>

              <div>
                <Field label="Móveis & Objetos de Decoração">
                  <Textarea
                    value={customDecor}
                    onChange={(e) => setCustomDecor(e.target.value)}
                    rows={2}
                    placeholder="Ex: Mesinha lateral de mármore, vaso com flores secas, perfume, frasco e espelho com moldura dourada"
                    className="resize-none border-white/10 bg-[#161822] text-xs text-white"
                  />
                </Field>
              </div>

              <div>
                <Field label="Estética & Ângulo">
                  <Input
                    value={customAesthetic}
                    onChange={(e) => setCustomAesthetic(e.target.value)}
                    placeholder="Ex: Pinterest Aesthetic POV Smartphone (TikTok Shop)"
                    className="h-9 border-white/10 bg-[#161822] text-xs text-white"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Right Live Preview: Generated Flux Prompt */}
          <div className="bento-card rounded-2xl border border-cyan-500/30 bg-[#0e1017] p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs font-bold">
                  Prompt Flux 1.1 Gerado
                </Badge>
                <span className="text-[10px] text-slate-500 font-mono">9:16 Vertical</span>
              </div>

              <h3 className="text-sm font-bold text-white">{customRoom}</h3>

              <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-relaxed text-slate-300 select-all">
                {generatedFluxPrompt}
              </div>

              <p className="text-[11px] leading-relaxed text-slate-400">
                Copie este prompt e cole no <strong>Flux 1.1 / Midjourney / Leonardo AI</strong> para gerar a imagem de fundo perfeita para o seu primeiro frame e vídeos.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <Button
                className="w-full h-10 font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg"
                onClick={() => handleCopyPrompt(generatedFluxPrompt, "custom-flux")}
              >
                <Copy className="size-4 mr-1.5" /> Copiar Prompt Flux
              </Button>

              <Button
                variant="outline"
                className="w-full h-9 text-xs font-semibold border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                onClick={() =>
                  saveFluxScenarioMutation.mutate({
                    name: customRoom,
                    description: `Cenário customizado: ${customSurface} com ${customLighting}`,
                    fluxPrompt: generatedFluxPrompt,
                    category: "custom",
                  })
                }
              >
                <Plus className="size-3.5 mr-1.5 text-primary" /> Salvar na Minha Biblioteca
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
