import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clapperboard,
  Eye,
  FolderKanban,
  Loader2,
  Package,
  Plus,
  Sparkles,
  UserRound,
  Download,
  Flame,
  Radio,
  RotateCw,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listAvatarLibrary,
  listPerformance,
  listProductLibrary,
} from "@/features/libraries/queries";
import { listProjects } from "@/features/projects/queries";
import {
  BUILTIN_MOVEMENT_PRESETS,
  PRESET_VIDEO_MAP,
  PRESET_DURATION_MAP,
} from "@/features/movements/movement-presets";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Visão geral — Tik Supremo Studio" }] }),
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const performanceQuery = useQuery({ queryKey: ["performance"], queryFn: listPerformance });
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });
  const avatarsQuery = useQuery({
    queryKey: ["avatars", user.id],
    queryFn: () => listAvatarLibrary(user.id),
  });

  const projects = projectsQuery.data ?? [];
  const performance = performanceQuery.data ?? [];
  const totalViews = performance.reduce((sum, record) => sum + record.views, 0);

  // Video-Only Rotating Prompt Presets
  const videoPresets = useMemo(() => {
    return BUILTIN_MOVEMENT_PRESETS.filter((p) => Boolean(PRESET_VIDEO_MAP[p.id]));
  }, []);

  const [videoIndex, setVideoIndex] = useState(() => {
    return Math.floor(Math.random() * (videoPresets.length || 1));
  });

  const currentVideoPreset = videoPresets[videoIndex % videoPresets.length] || BUILTIN_MOVEMENT_PRESETS[0];
  const currentVideoSrc = currentVideoPreset ? PRESET_VIDEO_MAP[currentVideoPreset.id] : undefined;
  const currentDuration = currentVideoPreset ? PRESET_DURATION_MAP[currentVideoPreset.id] || "8s" : "8s";

  const handleNextVideo = () => {
    setVideoIndex((prev) => (prev + 1) % videoPresets.length);
  };

  const loading =
    projectsQuery.isLoading ||
    performanceQuery.isLoading ||
    productsQuery.isLoading ||
    avatarsQuery.isLoading;

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto size-7 animate-spin text-[#9B7CFF]" />
          <p className="text-xs text-[#A3A6B3]">Carregando estúdio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 pb-6">
      {/* Header Bar */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/[0.07] bg-[#0E1017] px-5 py-4 shadow-lg shadow-black/20">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Badge className="border-[#9B7CFF]/30 bg-[#9B7CFF]/10 text-[#9B7CFF] text-[10px] font-bold px-2 py-0.5">
              <Sparkles className="mr-1 size-3" /> Tik Supremo Studio
            </Badge>
            <span className="text-[11px] text-[#666A78]">Painel de Controle</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#F7F7FB] tracking-tight md:text-2xl">
            Olá, {user.displayName}
          </h1>
          <p className="text-xs text-[#A3A6B3]">
            Transforme produtos em roteiros, modele copies vencedoras e acompanhe sua performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-[#A3A6B3] hover:text-[#F7F7FB]"
            asChild
          >
            <Link to="/tiktok-downloader">
              <Download className="mr-1.5 size-3.5 text-[#9B7CFF]" /> Baixar do TikTok
            </Link>
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs font-bold bg-[#9B7CFF] hover:bg-[#AA92FF] text-[#07080D] shadow-md shadow-[#9B7CFF]/20"
            asChild
          >
            <Link to="/projects/new">
              <Plus className="mr-1.5 size-3.5" /> Criar Roteiro
            </Link>
          </Button>
        </div>
      </header>

      {/* Metric Cards (1 Compact Row) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <UnifiedMetricCard
          icon={Eye}
          label="Views monitoradas"
          value={totalViews.toLocaleString("pt-BR")}
          detail="Alcance total"
        />
        <UnifiedMetricCard
          icon={FolderKanban}
          label="Projetos criados"
          value={projects.length}
          detail="Roteiros prontos"
        />
        <UnifiedMetricCard
          icon={Package}
          label="Produtos no catálogo"
          value={productsQuery.data?.length ?? 0}
          detail="Prontos para uso"
        />
        <UnifiedMetricCard
          icon={UserRound}
          label="Avatares & Personagens"
          value={avatarsQuery.data?.length ?? 0}
          detail="Consistência IA"
        />
      </section>

      {/* Central 2-Column Bento Grid: Tool Shortcuts (Left) + Featured Video (Right) */}
      <section className="grid gap-4 lg:grid-cols-12 items-stretch">
        {/* Left Column: 4 Tool Shortcuts in 2x2 Grid (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3 h-full">
          <UnifiedToolShortcut
            to="/projects/new"
            icon={Clapperboard}
            title="Criar Roteiro"
            subtitle="Prompts VEO & Kling para conversão"
          />
          <UnifiedToolShortcut
            to="/follower-growth"
            icon={Flame}
            title="Roteiros para Upar Conta"
            subtitle="Ganchos para reter e ganhar seguidores"
          />
          <UnifiedToolShortcut
            to="/live-scripts"
            icon={Radio}
            title="Scripts de Live IA"
            subtitle="Falas de até 8s geradas via Gemini"
          />
          <UnifiedToolShortcut
            to="/tiktok-downloader"
            icon={Download}
            title="Baixar do TikTok"
            subtitle="Download sem marca d'água em HD"
          />
        </div>

        {/* Right Column: Featured Video Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="h-full rounded-2xl border border-white/[0.07] bg-[#0E1017] p-4 shadow-xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#9B7CFF]/15 text-[#9B7CFF] border border-[#9B7CFF]/25 text-[10px] font-bold px-2 py-0.5">
                  <Sparkles className="size-3 mr-1" /> Movimento em Alta
                </Badge>
                <span className="text-[10px] font-mono text-[#666A78]">({currentDuration})</span>
              </div>

              <button
                type="button"
                onClick={handleNextVideo}
                className="text-xs text-[#A3A6B3] hover:text-[#F7F7FB] flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-white/[0.04] transition"
                title="Ver próximo movimento"
              >
                <RotateCw className="size-3 text-[#9B7CFF]" /> Trocar Vídeo
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/60 relative border border-white/[0.08] shadow-inner">
              {currentVideoSrc ? (
                <video
                  key={currentVideoSrc}
                  src={currentVideoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-slate-600">
                  <Play className="size-8 text-[#9B7CFF]/60" />
                </div>
              )}
            </div>

            {/* Title & Primary Action */}
            <div className="space-y-2.5 pt-0.5">
              <div>
                <h3 className="text-xs font-bold text-[#F7F7FB] truncate">{currentVideoPreset?.name}</h3>
                <p className="text-[11px] text-[#A3A6B3] line-clamp-1 mt-0.5">
                  {currentVideoPreset?.description}
                </p>
              </div>

              <Button
                className="w-full h-8.5 font-bold bg-[#9B7CFF] hover:bg-[#AA92FF] text-[#07080D] shadow-md shadow-[#9B7CFF]/15 text-xs gap-1.5"
                asChild
              >
                <Link to="/movements">
                  Ver na Biblioteca de Prompts <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#0E1017] p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <h2 className="text-xs font-bold text-[#F7F7FB] flex items-center gap-2">
            <FolderKanban className="size-3.5 text-[#9B7CFF]" /> Meus Últimos Roteiros
          </h2>
          <Link to="/projects" className="text-[11px] text-[#9B7CFF] hover:text-[#AA92FF] hover:underline flex items-center gap-1 font-semibold transition">
            Ver Todos ({projects.length}) <ArrowRight className="size-3" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((proj) => (
              <Link
                key={proj.id}
                to="/projects/$projectId"
                params={{ projectId: proj.id }}
                className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 hover:border-[#9B7CFF]/30 hover:bg-white/[0.03] transition-all"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-[#F7F7FB] truncate group-hover:text-[#9B7CFF] transition-colors">
                    {proj.name}
                  </p>
                  <p className="text-[10px] text-[#A3A6B3] truncate mt-0.5">
                    {proj.products?.[0]?.name || "Roteiro criado"}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0 border-white/15 text-[#A3A6B3]">
                  {proj.status}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-[#666A78]">
            Nenhum roteiro criado ainda. Clique em "Criar Roteiro" para começar!
          </div>
        )}
      </section>
    </div>
  );
}

function UnifiedMetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-[#0E1017] p-3.5 shadow-md flex items-center gap-3 hover:border-[#9B7CFF]/25 transition-all">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#9B7CFF]/10 text-[#9B7CFF] border border-[#9B7CFF]/20">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-[#F7F7FB] tracking-tight leading-none">{value}</p>
        <p className="text-xs text-[#A3A6B3] font-medium truncate mt-0.5">{label}</p>
        {detail && <p className="text-[10px] text-[#666A78] mt-0.5">{detail}</p>}
      </div>
    </article>
  );
}

function UnifiedToolShortcut({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string;
  icon: typeof Clapperboard;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-white/[0.07] bg-[#0E1017] p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#9B7CFF]/35 hover:bg-[#9B7CFF]/[0.02] shadow-md flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#A3A6B3] group-hover:bg-[#9B7CFF]/10 group-hover:text-[#9B7CFF] group-hover:border-[#9B7CFF]/20 transition-colors">
          <Icon className="size-3.5" />
        </div>
        <ArrowRight className="size-3 text-[#666A78] group-hover:text-[#9B7CFF] group-hover:translate-x-0.5 transition-all" />
      </div>

      <div>
        <h3 className="text-xs font-bold text-[#F7F7FB] group-hover:text-[#9B7CFF] transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-[#A3A6B3] line-clamp-2 mt-0.5 leading-tight">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
