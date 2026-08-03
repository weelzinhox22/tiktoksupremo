import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
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
});

function ScenariosPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("bedroom");
  const [spaceType, setSpaceType] = useState("Quarto contemporâneo bem iluminado");
  const [wall, setWall] = useState("Bege neutro");
  const [floor, setFloor] = useState("Madeira clara");
  const [lightingPreset, setLightingPreset] = useState("natural_soft");

  const scenariosQuery = useQuery({
    queryKey: ["scenarios", user.id],
    queryFn: () => scenarioRepository.list(user.id),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error("Informe o nome do cenário.");

      const supabase = getSupabaseBrowserClient();
      const result = await supabase.from("scenarios").insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim(),
        category,
        environment: {
          spaceType,
          wall,
          floor,
          ceiling: "branco",
          furniture: ["sofá", "mesa"],
          decor: ["planta"],
          depth: "3m",
        },
        lighting: {
          mainSource: "janela",
          temperature: "5000K",
          intensity: "suave",
          contrast: "baixo",
          shadows: "suaves",
          naturalLight: "abundante",
          preset: lightingPreset,
        },
        camera_presets: [
          {
            id: "cp-1",
            name: "Plano Médio Fixo",
            framing: "cintura para cima",
            height: "altura dos olhos",
            distance: "1.8m",
            angle: "0 graus",
            depthOfField: "desfoque suave",
            promptSnippet: "medium shot, fixed angle",
          },
        ],
        fixed_elements: [],
        action_zones: {
          characterZone: "centro da cena",
          productZone: "mãos",
          demonstrationZone: "área central",
          textSafeZone: "terço superior",
        },
        audio: {
          ambientNoise: "silencioso",
          reverberation: "mínima",
          suggestedMusic: "pop acústico",
          forbiddenSounds: [],
        },
        environment_prompt: `${spaceType}, ${wall} walls, ${floor} floor`,
        lighting_prompt: `${lightingPreset} lighting`,
        camera_prompt: "fixed framing, eye level",
        continuity_prompt: "keep furniture fixed",
        negative_prompt: "camera movement, camera zoom, shifting background",
        compatible_formats: ["UGC", "NO SPEAK", "FASHION"],
        compatible_categories: ["Moda", "Beleza", "Casa"],
        tags: [category, "cenario"],
      });

      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      setIsFormOpen(false);
      setName("");
      setDescription("");
      toast.success("Cenário cadastrado na Biblioteca com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const scenarios = (scenariosQuery.data ?? []).filter((s) => {
    const matchesSearch = `${s.name} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Building2 className="size-3.5" /> Biblioteca de Cenários Reutilizáveis
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Biblioteca de Cenários
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre ambientes e iluminações consistentes para fixar a estética dos seus vídeos do TikTok Shop.
          </p>
        </div>

        <Button type="button" variant="hero" onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Cadastrar Novo Cenário
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, ambiente ou tag..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            <option value="bedroom">Quarto</option>
            <option value="studio">Estúdio / Esteira</option>
            <option value="living_room">Sala</option>
            <option value="kitchen">Cozinha</option>
            <option value="gym">Academia</option>
          </select>
        </div>
      </div>

      {/* Formulário de Criação */}
      {isFormOpen && (
        <div className="space-y-6 rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-semibold text-lg">Criar Perfil de Cenário</h2>
              <p className="text-xs text-muted-foreground">
                Defina os elementos fixos, tipo de iluminação e área segura para texto nas gravações.
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome do Cenário">
              <Input placeholder="Ex.: Sala Minimalista Neutra" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <Field label="Categoria">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="bedroom">Quarto Feminino</option>
                <option value="studio">Estúdio / Vitrine / Esteira</option>
                <option value="living_room">Sala Neutra</option>
                <option value="kitchen">Cozinha</option>
                <option value="gym">Academia / Fitness</option>
              </select>
            </Field>

            <Field label="Tipo de Espaço e Parede">
              <Input value={spaceType} onChange={(e) => setSpaceType(e.target.value)} />
            </Field>

            <Field label="Preset de Iluminação">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={lightingPreset}
                onChange={(e) => setLightingPreset(e.target.value)}
              >
                <option value="natural_soft">Natural Suave (Janela Lateral)</option>
                <option value="studio_commercial">Estúdio Comercial de Alta Clareza</option>
                <option value="warm_cozy">Quente Aconchegante</option>
              </select>
            </Field>

            <Field label="Descrição Curta">
              <Textarea
                rows={3}
                placeholder="Ex.: Cenário aconchegante com sofá bege e iluminação natural difusa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="hero" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? "Salvar..." : "Salvar na Biblioteca"}
            </Button>
          </div>
        </div>
      )}

      {/* Grid de Cenários */}
      {scenarios.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scen) => (
            <article key={scen.id} className="bento-card interactive-card group overflow-hidden space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                    <Building2 className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-base">{scen.name}</h3>
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {scen.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {scen.description || "Cenário configurado para gravação de vídeos."}
              </p>

              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Versão v{scen.version}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate({ to: "/copy-modeler" });
                  }}
                >
                  Usar no Modelador
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Building2 className="mx-auto size-10 opacity-40" />
          <p className="mt-3 text-sm">Nenhum cenário encontrado na sua biblioteca.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>
            Cadastrar primeiro cenário
          </Button>
        </div>
      )}
    </div>
  );
}
