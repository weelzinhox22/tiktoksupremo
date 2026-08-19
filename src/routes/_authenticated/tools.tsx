import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  Scissors,
  FileText,
  FileCheck2,
  Shuffle,
  ShieldCheck,
  Radar,
  Flame,
  FlaskConical,
  BarChart3,
  Video,
  Sparkles,
  Mic,
  ArrowRight,
  Zap,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/tools")({
  component: ToolsHubPage,
});

interface ToolCardProps {
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  gradient: string;
}

const toolCategories = [
  {
    category: "Download & Transcrição",
    description: "Extraia áudios, textos e baixe vídeos sem marca d'água para análise",
    tools: [
      {
        title: "Baixar do TikTok",
        description: "Faça download de vídeos do TikTok em alta resolução sem marca d'água.",
        to: "/tiktok-downloader",
        icon: Download,
        badge: "Rápido",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        gradient: "from-cyan-500/10 via-transparent to-transparent",
      },
      {
        title: "Transcrever por Link",
        description: "Cole o link de um vídeo viral para transcrever fala e legenda com IA.",
        to: "/video-transcriber",
        icon: FileText,
        badge: "IA Whisper",
        badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        gradient: "from-indigo-500/10 via-transparent to-transparent",
      },
      {
        title: "Transcrever Arquivo",
        description: "Envie arquivos de áudio ou vídeo do seu computador para gerar transcrições.",
        to: "/copies",
        icon: FileCheck2,
        gradient: "from-blue-500/10 via-transparent to-transparent",
      },
    ],
  },
  {
    category: "Edição Rápida & Higienização",
    description: "Ferramentas práticas para ajustar mídias antes da postagem no TikTok",
    tools: [
      {
        title: "Remover Marca d'Água",
        description: "Limpe marcas d'água indesejadas e logos de vídeos com precisão.",
        to: "/watermark-remover",
        icon: Scissors,
        gradient: "from-rose-500/10 via-transparent to-transparent",
      },
      {
        title: "Limpar Metadados",
        description: "Remova metadados de câmeras e softwares para publicar como vídeo 100% virgem.",
        to: "/metadata-cleaner",
        icon: ShieldCheck,
        badge: "Anti-Ban",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        gradient: "from-emerald-500/10 via-transparent to-transparent",
      },
      {
        title: "Juntar Vídeos (Combiner)",
        description: "Mescle múltiplos clipes, ganchos e CTAs em um único arquivo final.",
        to: "/video-combiner",
        icon: Shuffle,
        gradient: "from-violet-500/10 via-transparent to-transparent",
      },
      {
        title: "Editor de Vídeo",
        description: "Corte, redimensione e aplique ajustes básicos de timeline.",
        to: "/video-editor",
        icon: Video,
        gradient: "from-amber-500/10 via-transparent to-transparent",
      },
      {
        title: "Clipes Automáticos",
        description: "Gere cortes e clipes verticais inteligentes a partir de vídeos longos.",
        to: "/auto-clips",
        icon: Zap,
        badge: "Auto 9:16",
        badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        gradient: "from-pink-500/10 via-transparent to-transparent",
      },
    ],
  },
  {
    category: "Inteligência, Métricas & Testes",
    description: "Monitore tendências, pontue seus vídeos e acompanhe conversões",
    tools: [
      {
        title: "Radar Viral",
        description: "Descubra tendências, criativos em alta e produtos escalando no TikTok Shop.",
        to: "/radar",
        icon: Radar,
        badge: "Tendências",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        gradient: "from-purple-500/10 via-transparent to-transparent",
      },
      {
        title: "Auditoria Viral (Score IA)",
        description: "Analise seu roteiro ou vídeo antes de postar e receba notas de retenção.",
        to: "/viral-audit",
        icon: Flame,
        badge: "Score IA",
        badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        gradient: "from-orange-500/10 via-transparent to-transparent",
      },
      {
        title: "Laboratório de Criativos",
        description: "Realize testes A/B de ganchos e variações de copies para validar escala.",
        to: "/creative-lab",
        icon: FlaskConical,
        gradient: "from-teal-500/10 via-transparent to-transparent",
      },
      {
        title: "Painel de Desempenho",
        description: "Métricas detalhadas de visualizações, engajamento e conversões.",
        to: "/performance",
        icon: BarChart3,
        gradient: "from-blue-500/10 via-transparent to-transparent",
      },
    ],
  },
];

function ToolsHubPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-9 pb-16">
      <header className="bento-hero p-6 md:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-2.5 py-0.5 font-semibold">
              Central de Ferramentas
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Utilitários Rápidos
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Caixa de Ferramentas & Utilitários
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Acesse rapidamente todos os utilitários de download, transcrição, corte, higienização de metadados e análise viral.
          </p>
        </div>
      </header>

      {/* Categories */}
      <div className="space-y-10">
        {toolCategories.map((group) => (
          <section key={group.category} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-border/40 pb-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                {group.category}
              </h2>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.to}
                    to={tool.to}
                    className="bento-card interactive-card group relative flex flex-col justify-between overflow-hidden p-5 border-border/40 hover:border-primary/50 transition-all shadow-sm"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-40 group-hover:opacity-80 transition-opacity`}
                    />

                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                          <Icon className="size-5" />
                        </span>
                        {tool.badge && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 font-semibold ${
                              tool.badgeColor || "border-white/10 text-muted-foreground"
                            }`}
                          >
                            {tool.badge}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 pt-1">
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="relative pt-4 mt-2 flex items-center justify-between text-xs font-semibold text-primary opacity-80 group-hover:opacity-100 transition-opacity border-t border-white/5">
                      <span>Abrir ferramenta</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
