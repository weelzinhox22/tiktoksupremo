import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserRound,
  Plus,
  Sparkles,
  Check,
  Search,
  SlidersHorizontal,
  Copy,
  Edit,
  Trash2,
  FileCode,
  Shirt,
  Volume2,
  Activity,
  Smile,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { toast } from "sonner";
import type { CharacterProfile } from "@/features/four-modules/types";
import { characterRepository } from "@/features/four-modules/repositories";
import { buildCharacterConsistencyBlock } from "@/features/four-modules/services";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/characters")({
  component: CharactersPage,
});

function CharactersPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"identity" | "appearance" | "outfit" | "voice" | "personality" | "veo">("identity");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [characterType, setCharacterType] = useState<CharacterProfile["type"]>("ai_realistic_human");
  const [visualAge, setVisualAge] = useState("25-30");
  const [hairColor, setHairColor] = useState("castanho");
  const [outfitTop, setOutfitTop] = useState("Camiseta básica branca");
  const [outfitBottom, setOutfitBottom] = useState("Calça jeans azul");
  const [voiceSpeed, setVoiceSpeed] = useState<"slow" | "natural" | "fast" | "very_fast">("natural");
  const [voiceEnergy, setVoiceEnergy] = useState<"low" | "moderate" | "high">("moderate");

  const charactersQuery = useQuery({
    queryKey: ["characters", user.id],
    queryFn: () => characterRepository.list(user.id),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error("Informe o nome da personagem.");

      const supabase = getSupabaseBrowserClient();
      const metadata = {
        internalName: name,
        type: characterType,
        appearance: {
          visualAge,
          gender: "feminino",
          height: "1.68m",
          bodyType: "esbelto",
          skinTone: "morena clara",
          faceShape: "oval",
          eyes: "castanhos",
          hairColor,
          hairLength: "médio",
          hairStyle: "ondas naturais",
          makeup: "natural",
          distinctiveFeatures: [],
        },
        outfitPresets: [
          {
            id: "default",
            name: "Roupa Padrão",
            top: outfitTop,
            bottom: outfitBottom,
            footwear: "Tênis casual",
            accessories: [],
            colors: ["branco", "azul"],
            fabric: "algodão",
            style: "casual",
            occasion: "dia a dia",
            isImmutable: true,
          },
        ],
        voice: {
          language: "pt-BR",
          regionalVariant: "Neutro",
          vocalRange: "Médio",
          timbre: "Quente",
          speed: voiceSpeed,
          energy: voiceEnergy,
          catchphrases: [],
          avoidedWords: [],
        },
        personality: {
          traits: ["Espontânea", "Confiante"],
          energyLevel: "Média",
          persuasiveness: "Alta",
          informality: "Informal",
          preferredHooks: [],
          preferredCtas: [],
        },
        negativePrompt: "face change, extra fingers, deformed face, morphing outfit",
      };

      const result = await supabase.from("avatars").insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || `${name} — ${characterType}`,
        source: "user_created",
        metadata,
      });

      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      setIsFormOpen(false);
      setName("");
      setDescription("");
      toast.success("Personagem cadastrada com sucesso no Estúdio!");
    },
    onError: (err) => toast.error(err.message),
  });

  const characters = (charactersQuery.data ?? []).filter((c) => {
    const matchesSearch = `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <UserRound className="size-3.5" /> Estúdio de Personagens Fixas
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Estúdio de Personagens
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre avatares e modelos recorrentes para manter consistência de rosto, corpo, voz e roupas em cada vídeo.
          </p>
        </div>

        <Button type="button" variant="hero" onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Cadastrar Nova Personagem
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="ai_realistic_human">IA Realista</option>
            <option value="faceless_mannequin">Manequim sem Rosto</option>
            <option value="ugc_presenter">Apresentadora UGC</option>
            <option value="fashion_model">Modelo de Moda</option>
          </select>
        </div>
      </div>

      {/* Formulário Modal/Card de Criação */}
      {isFormOpen && (
        <div className="space-y-6 rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-semibold text-lg">Criar Perfil de Personagem</h2>
              <p className="text-xs text-muted-foreground">
                Configure os metadados de consistência visual para os prompts do Google VEO.
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
          </div>

          {/* Abas do Formulário */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {[
              { id: "identity", label: "1. Identidade", icon: UserRound },
              { id: "appearance", label: "2. Aparência", icon: Sparkles },
              { id: "outfit", label: "3. Roupa", icon: Shirt },
              { id: "voice", label: "4. Voz & Tom", icon: Volume2 },
              { id: "veo", label: "5. Bloco VEO", icon: FileCode },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "identity" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome da Personagem">
                <Input placeholder="Ex.: Lara UGC" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Tipo de Personagem">
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={characterType}
                  onChange={(e) => setCharacterType(e.target.value as CharacterProfile["type"])}
                >
                  <option value="ai_realistic_human">Personagem Realista Gerada por IA</option>
                  <option value="faceless_mannequin">Manequim Sem Rosto (Preto Fosco)</option>
                  <option value="ugc_presenter">Apresentadora UGC Realista</option>
                  <option value="fashion_model">Modelo de Moda Try-On</option>
                </select>
              </Field>
              <Field label="Descrição Curta">
                <Textarea
                  rows={3}
                  placeholder="Ex.: Criadora de conteúdo jovem, estilo casual praiano, fala rápida e entusiasmada."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Idade Visual Aproximada">
                <Input value={visualAge} onChange={(e) => setVisualAge(e.target.value)} />
              </Field>
              <Field label="Cor do Cabelo">
                <Input value={hairColor} onChange={(e) => setHairColor(e.target.value)} />
              </Field>
            </div>
          )}

          {activeTab === "outfit" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Parte Superior (Camiseta / Blusa)">
                <Input value={outfitTop} onChange={(e) => setOutfitTop(e.target.value)} />
              </Field>
              <Field label="Parte Inferior (Calça / Saia)">
                <Input value={outfitBottom} onChange={(e) => setOutfitBottom(e.target.value)} />
              </Field>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Velocidade da Fala">
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(e.target.value as typeof voiceSpeed)}
                >
                  <option value="slow">Lenta</option>
                  <option value="natural">Natural</option>
                  <option value="fast">Rápida</option>
                  <option value="very_fast">Muito Rápida</option>
                </select>
              </Field>
              <Field label="Energia Vocal">
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={voiceEnergy}
                  onChange={(e) => setVoiceEnergy(e.target.value as typeof voiceEnergy)}
                >
                  <option value="low">Baixa / Calma</option>
                  <option value="moderate">Moderada / Espontânea</option>
                  <option value="high">Alta Energia</option>
                </select>
              </Field>
            </div>
          )}

          {activeTab === "veo" && (
            <div className="space-y-4">
              <Field label="Bloco de Consistência Gerado para VEO">
                <Textarea
                  rows={5}
                  readOnly
                  className="bg-secondary/30 font-mono text-xs"
                  value={buildCharacterConsistencyBlock({
                    id: "temp",
                    userId: user.id,
                    name: name || "Nome da Personagem",
                    internalName: name,
                    description,
                    type: characterType,
                    appearance: {
                      visualAge,
                      gender: "feminino",
                      height: "1.68m",
                      bodyType: "esbelto",
                      skinTone: "morena clara",
                      faceShape: "oval",
                      eyes: "castanhos",
                      hairColor,
                      hairLength: "médio",
                      hairStyle: "ondas",
                      makeup: "natural",
                      distinctiveFeatures: [],
                    },
                    outfitPresets: [
                      {
                        id: "d",
                        name: "Padrão",
                        top: outfitTop,
                        bottom: outfitBottom,
                        footwear: "Tênis",
                        accessories: [],
                        colors: ["branco"],
                        fabric: "algodão",
                        style: "casual",
                        occasion: "dia a dia",
                        isImmutable: true,
                      },
                    ],
                    voice: {
                      language: "pt-BR",
                      regionalVariant: "Neutro",
                      vocalRange: "Médio",
                      timbre: "Quente",
                      speed: voiceSpeed,
                      energy: voiceEnergy,
                      catchphrases: [],
                      avoidedWords: [],
                    },
                    personality: {
                      traits: ["Espontânea"],
                      energyLevel: "Média",
                      persuasiveness: "Alta",
                      informality: "Informal",
                      preferredHooks: [],
                      preferredCtas: [],
                    },
                    expressions: [],
                    movements: [],
                    basePrompt: "",
                    voicePrompt: "",
                    behaviorPrompt: "",
                    continuityPrompt: "",
                    negativePrompt: "face change",
                    tags: [],
                    version: 1,
                    status: "active",
                    createdAt: "",
                    updatedAt: "",
                  })}
                />
              </Field>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="hero" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? "Salvando..." : "Salvar no Estúdio"}
            </Button>
          </div>
        </div>
      )}

      {/* Grid de Listagem das Personagens */}
      {characters.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((char) => (
            <article key={char.id} className="bento-card interactive-card group overflow-hidden space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-base">{char.name}</h3>
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {char.type}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {char.description || "Personagem sem descrição informada."}
              </p>

              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Versão v{char.version}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate({
                      to: "/copy-modeler",
                    });
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
          <UserRound className="mx-auto size-10 opacity-40" />
          <p className="mt-3 text-sm">Nenhuma personagem cadastrada no seu Estúdio.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>
            Criar primeira personagem
          </Button>
        </div>
      )}
    </div>
  );
}
