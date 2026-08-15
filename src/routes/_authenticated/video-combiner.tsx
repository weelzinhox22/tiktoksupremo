import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Film,
  Loader2,
  Lightbulb,
  Music2,
  MousePointer2,
  Layers3,
  Scissors,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Archive,
  SlidersHorizontal,
  TrendingUp,
  Trophy,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPerformance } from "@/features/libraries/queries";
import {
  createCombinations,
  createPurposefulCombinations,
  disposeVideoEngine,
  downloadVideo,
  getVideoDuration,
  loadVideoEngine,
  normalizeSegment,
  renderCombination,
  segmentIdsForCombination,
  type EditorCombination,
  type EditorSegment,
} from "@/features/video-editor/engine";

export const Route = createFileRoute("/_authenticated/video-combiner")({
  component: VideoEditorPage,
  head: () => ({ meta: [{ title: "Juntar vídeos — Tik Supremo" }] }),
});

function recommendationReason(value: "hook" | "body" | "cta" | "exact" | undefined) {
  if (value === "exact") return "combinação completa já validada";
  if (value === "hook") return "gancho com melhor retenção e resposta";
  if (value === "body") return "corpo com melhor desempenho";
  if (value === "cta") return "CTA com mais cliques ou pedidos";
  return "histórico disponível";
}

const makeSegment = (id: string, label: string, group: EditorSegment["group"]): EditorSegment => ({
  id,
  label,
  group,
  file: null,
  start: 0,
  end: 8,
  duration: 8,
  mute: false,
  playbackRate: 1,
  volume: 100,
  mirror: false,
  brightness: 0,
  contrast: 1,
  saturation: 1,
  fadeIn: 0,
  fadeOut: 0,
  animationIn: "none",
  animationOut: "none",
  animationDuration: 0.4,
  transition: "none",
  transitionDuration: 0.45,
  audioDetached: false,
  hideOverlay: false,
  overlayPosition: "top-right",
  overlayWidth: 18,
  overlayHeight: 8,
});

const initialSegments = (hookCount = 4, bodyCount = 4, ctaCount = 3): EditorSegment[] => [
  ...Array.from({ length: hookCount }, (_, index) =>
    makeSegment(`hook-${index + 1}`, `Gancho ${index + 1}`, "hook"),
  ),
  ...Array.from({ length: bodyCount }, (_, index) => [
    makeSegment(`body-${index + 1}-a`, `Corpo ${index + 1} · Cena 1`, "body"),
    makeSegment(`body-${index + 1}-b`, `Corpo ${index + 1} · Cena 2`, "body"),
  ]).flat(),
  ...Array.from({ length: ctaCount }, (_, index) =>
    makeSegment(`cta-${index + 1}`, `CTA ${index + 1}`, "cta"),
  ),
];

function VideoEditorPage() {
  const [hookCount, setHookCount] = useState(4);
  const [bodyCount, setBodyCount] = useState(4);
  const [ctaCount, setCtaCount] = useState(3);
  const [segments, setSegments] = useState(initialSegments);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [smartPolish, setSmartPolish] = useState(true);
  const [purposefulVariations, setPurposefulVariations] = useState(true);
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [fillFrame, setFillFrame] = useState(true);
  const [width, setWidth] = useState<720 | 1080>(720);
  const [phase, setPhase] = useState<"idle" | "loading" | "normalizing" | "rendering">("idle");
  const [progress, setProgress] = useState("");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);
  const [timelineOrders, setTimelineOrders] = useState<Record<number, string[]>>({});
  const [normalizationProgress, setNormalizationProgress] = useState({ done: 0, total: 0 });
  const normalizedRef = useRef(new Map<string, string>());
  const cancelRef = useRef(false);

  useEffect(() => () => disposeVideoEngine(), []);

  const performanceQuery = useQuery({
    queryKey: ["performance"],
    queryFn: listPerformance,
  });

  const uploadedCount = segments.filter((segment) => segment.file).length;
  const allReady = uploadedCount === segments.length;
  const hasMinimumCombination = (["hook", "body", "cta"] as const).every((group) =>
    segments.some((segment) => segment.group === group && segment.file),
  );
  const combinations = useMemo(
    () =>
      purposefulVariations
        ? createPurposefulCombinations(hookCount, bodyCount, ctaCount)
        : createCombinations(hookCount, bodyCount, ctaCount),
    [bodyCount, ctaCount, hookCount, purposefulVariations],
  );
  const recommendedCombinations = useMemo(() => {
    const records = performanceQuery.data ?? [];
    return combinations
      .map((combination) => {
        let score = 0;
        let evidence = 0;
        const reasons = { hook: 0, body: 0, cta: 0, exact: 0 };
        for (const record of records) {
          const hookMatch = record.hook_index === combination.hook;
          const bodyMatch = record.body_index === combination.body;
          const ctaMatch = record.cta_index === combination.cta;
          const exactMatch = record.combination_number === combination.number;
          const matches = Number(hookMatch) + Number(bodyMatch) + Number(ctaMatch);
          if (!matches && !exactMatch) continue;
          const performance =
            Math.log10(record.views + 1) * 12 +
            record.likes * 0.08 +
            record.comments * 0.3 +
            record.shares * 0.65 +
            record.clicks * 3 +
            record.orders * 80;
          score += performance * (exactMatch ? 1.8 : matches / 3);
          evidence += 1;
          if (hookMatch) reasons.hook += performance;
          if (bodyMatch) reasons.body += performance;
          if (ctaMatch) reasons.cta += performance;
          if (exactMatch) reasons.exact += performance;
        }
        const strongest = (Object.entries(reasons) as Array<[keyof typeof reasons, number]>).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0];
        return { combination, score: Math.round(score), evidence, strongest };
      })
      .filter((item) => item.evidence > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [combinations, performanceQuery.data]);
  const groups = useMemo(
    () =>
      [
        {
          key: "hook",
          title: `${hookCount} ganchos`,
          description: "Uma cena por gancho, com duração ajustável",
        },
        {
          key: "body",
          title: `${bodyCount} corpos`,
          description: "Duas cenas editáveis por corpo",
        },
        { key: "cta", title: `${ctaCount} CTAs`, description: "Uma cena editável por CTA" },
      ] as const,
    [hookCount, bodyCount, ctaCount],
  );

  const renderSegments = useMemo(
    () =>
      smartPolish
        ? segments.map((segment) => ({
            ...segment,
            transition: "fade" as const,
            transitionDuration: Math.min(0.22, Math.max(0.12, (segment.end - segment.start) / 12)),
          }))
        : segments,
    [segments, smartPolish],
  );

  const changeStructure = (next: { hooks?: number; bodies?: number; ctas?: number }) => {
    const nextHookCount = next.hooks ?? hookCount;
    const nextBodyCount = next.bodies ?? bodyCount;
    const nextCtaCount = next.ctas ?? ctaCount;
    setHookCount(nextHookCount);
    setBodyCount(nextBodyCount);
    setCtaCount(nextCtaCount);
    setSegments((current) =>
      initialSegments(nextHookCount, nextBodyCount, nextCtaCount).map(
        (segment) => current.find((existing) => existing.id === segment.id) ?? segment,
      ),
    );
    normalizedRef.current = new Map();
    setCompleted(new Set());
    setSelectedRecommendation(null);
    setTimelineOrders({});
  };

  const updateSegment = (id: string, patch: Partial<EditorSegment>) => {
    normalizedRef.current.delete(id);
    setCompleted(new Set());
    setSegments((current) =>
      current.map((segment) => (segment.id === id ? { ...segment, ...patch } : segment)),
    );
  };

  const selectFile = async (id: string, file: File | null) => {
    if (!file) return updateSegment(id, { file: null });
    try {
      const duration = await getVideoDuration(file);
      updateSegment(id, { file, duration, start: 0, end: Math.min(8, duration) });
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível ler o vídeo.");
    }
  };

  const segmentOrderFor = (combination: EditorCombination) => {
    const custom = timelineOrders[combination.number];
    if (custom) return custom;
    const ids = segmentIdsForCombination(combination);
    if (combination.purpose === "short-retention") return [ids[0]!, ids[1]!, ids[3]!];
    if (combination.purpose === "aggressive") return [ids[0]!, ids[1]!, ids[3]!, ids[2]!];
    if (combination.purpose === "emotional") return [ids[0]!, ids[2]!, ids[1]!, ids[3]!];
    return ids;
  };

  const prepareSegments = async (requiredIds: string[]) => {
    const requiredSegments = requiredIds
      .map((id) => segments.find((segment) => segment.id === id))
      .filter((segment): segment is EditorSegment => Boolean(segment));
    const missing = requiredSegments.filter((segment) => !segment.file);
    if (missing.length) throw new Error(`Envie o arquivo de ${missing[0]!.label} antes de gerar.`);
    setPhase("loading");
    setProgress("Conectando ao editor local...");
    const ffmpeg = await loadVideoEngine({
      onProgress: (msg) => setProgress(msg),
    });
    const pending = requiredSegments.filter((segment) => !normalizedRef.current.has(segment.id));
    setNormalizationProgress({ done: 0, total: pending.length });
    if (!pending.length) return ffmpeg;
    setPhase("normalizing");

    for (const [index, segment] of pending.entries()) {
      if (cancelRef.current) throw new Error("Processamento cancelado pelo usuário.");
      const stepLabel = `Preparando cena ${index + 1} de ${pending.length}: ${segment.label}`;
      setProgress(stepLabel);

      const onProgress = ({ progress: ratio }: { progress: number }) => {
        const pct = Math.round(ratio * 100);
        if (pct > 0 && pct <= 100) {
          setProgress(`${stepLabel} (${pct}%)`);
        }
      };
      ffmpeg.on("progress", onProgress);

      try {
        const output = await normalizeSegment(ffmpeg, segment, {
          removeAudio,
          width,
          fitMode: fillFrame ? "cover" : "contain",
          normalizeAudio: normalizeAudio && !removeAudio,
        });
        normalizedRef.current.set(segment.id, output);
        setNormalizationProgress({ done: index + 1, total: pending.length });
      } finally {
        ffmpeg.off("progress", onProgress);
      }
    }
    return ffmpeg;
  };

  const renderAndDownload = async (combination: EditorCombination, keepBusy = false) => {
    try {
      cancelRef.current = false;
      const segmentIds = segmentOrderFor(combination);
      const ffmpeg = await prepareSegments(segmentIds);
      setPhase("rendering");
      setProgress(`Montando ${combination.label}...`);

      const onProgress = ({ progress: ratio }: { progress: number }) => {
        const pct = Math.round(ratio * 100);
        if (pct > 0 && pct <= 100) {
          setProgress(`Montando ${combination.label} (${pct}%)...`);
        }
      };
      ffmpeg.on("progress", onProgress);

      try {
        const output = await renderCombination(ffmpeg, combination, normalizedRef.current, {
          segments: renderSegments,
          textOverlays: [],
          audioLayers: [],
          segmentIds,
          width,
          removeAudio,
        });
        downloadVideo(output.blob, output.filename);
        setCompleted((current) => new Set(current).add(combination.number));
        if (!keepBusy) toast.success(`Vídeo ${combination.number} gerado e baixado.`);
      } finally {
        ffmpeg.off("progress", onProgress);
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível gerar o vídeo.");
    } finally {
      if (!keepBusy) {
        setPhase("idle");
        setProgress("");
      }
    }
  };

  const renderAll = async () => {
    try {
      cancelRef.current = false;
      const validCombinations = combinations.filter((combination) => {
        const ids = segmentOrderFor(combination);
        return ids.every((id) => {
          const seg = segments.find((s) => s.id === id);
          return Boolean(seg?.file);
        });
      });

      if (!validCombinations.length) {
        toast.error(
          "Envie os arquivos de vídeo para pelo menos uma combinação inteira de Gancho, Corpo e CTA.",
        );
        return;
      }

      const requiredSegmentIds = Array.from(
        new Set(validCombinations.flatMap((c) => segmentOrderFor(c))),
      );

      const ffmpeg = await prepareSegments(requiredSegmentIds);
      const { Zip, ZipPassThrough } = await import("fflate");
      const chunks: Uint8Array[] = [];
      let generatedCount = 0;
      const archivePromise = new Promise<Blob>((resolve, reject) => {
        const archive = new Zip((error, data, final) => {
          if (error) {
            reject(error);
            return;
          }
          chunks.push(data);
          if (final) {
            resolve(
              new Blob(
                chunks.map((chunk) => chunk.slice().buffer as ArrayBuffer),
                { type: "application/zip" },
              ),
            );
          }
        });

        void (async () => {
          try {
            for (const [idx, combination] of validCombinations.entries()) {
              if (cancelRef.current) break;
              setPhase("rendering");
              setProgress(
                `Gerando vídeo ${idx + 1} de ${validCombinations.length} · ${combination.label}`,
              );

              const onProgress = ({ progress: ratio }: { progress: number }) => {
                const pct = Math.round(ratio * 100);
                if (pct > 0 && pct <= 100) {
                  setProgress(
                    `Gerando vídeo ${idx + 1} de ${validCombinations.length} (${pct}%) · ${combination.label}`,
                  );
                }
              };
              ffmpeg.on("progress", onProgress);

              try {
                const output = await renderCombination(ffmpeg, combination, normalizedRef.current, {
                  segments: renderSegments,
                  textOverlays: [],
                  audioLayers: [],
                  segmentIds: segmentOrderFor(combination),
                  width,
                  removeAudio,
                });
                const entry = new ZipPassThrough(output.filename);
                archive.add(entry);
                entry.push(new Uint8Array(await output.blob.arrayBuffer()), true);
                generatedCount += 1;
                setCompleted((current) => new Set(current).add(combination.number));
              } catch (singleErr) {
                console.error(
                  `[Video Combiner] Erro ao renderizar vídeo ${combination.number}:`,
                  singleErr,
                );
              } finally {
                ffmpeg.off("progress", onProgress);
              }
            }
            archive.end();
          } catch (cause) {
            archive.terminate();
            reject(cause);
          }
        })();
      });

      const archive = await archivePromise;
      if (generatedCount > 0) {
        downloadVideo(archive, `tik-supremo-${generatedCount}-videos.zip`);
        toast.success(
          cancelRef.current
            ? `${generatedCount} vídeos foram reunidos em um ZIP antes da interrupção.`
            : `${generatedCount} vídeos foram gerados e reunidos em um arquivo ZIP!`,
        );
      } else {
        toast.error(
          "Não foi possível renderizar os vídeos. Verifique se os arquivos estão íntegros.",
        );
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível gerar o lote.");
    } finally {
      setPhase("idle");
      setProgress("");
    }
  };

  const resetEditor = () => {
    cancelRef.current = true;
    disposeVideoEngine();
    normalizedRef.current = new Map();
    setSegments(initialSegments(hookCount, bodyCount, ctaCount));
    setCompleted(new Set());
    setTimelineOrders({});
    setProgress("");
    setPhase("idle");
    toast.success("Arquivos temporários removidos.");
  };

  const busy = phase !== "idle";
  const progressPercent =
    phase === "rendering"
      ? Math.round((completed.size / combinations.length) * 100)
      : phase === "normalizing"
        ? Math.round((normalizationProgress.done / Math.max(1, normalizationProgress.total)) * 100)
        : phase === "loading"
          ? 3
          : 0;

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#07080c] px-4 py-7 text-slate-100 md:-mx-8 md:-my-10 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_85%_15%,rgba(139,92,246,.22),transparent_32%),linear-gradient(135deg,#151226_0%,#0b0d14_55%,#07161a_100%)] p-6 shadow-2xl shadow-black/40 md:p-8">
          <div className="absolute -right-24 -top-24 size-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                <Sparkles className="size-3.5" /> Studio de montagem inteligente
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Crie dezenas de vídeos com ritmo de creator
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Combine ganchos, corpos e CTAs com enquadramento, áudio e transições consistentes. O
                processamento acontece no seu navegador e o lote chega pronto em um único ZIP.
              </p>
            </div>
            <Badge variant="outline" className="w-fit bg-background/60 px-3 py-1.5 backdrop-blur">
              {uploadedCount}/{segments.length} arquivos enviados
            </Badge>
          </div>
          <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
            <Metric label="Ganchos" value={hookCount} />
            <Metric label="Corpos" value={bodyCount} />
            <Metric label="CTAs" value={ctaCount} />
            <Metric label="Vídeos finais" value={combinations.length} accent />
          </div>
        </header>

        <nav
          className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#0d1018]/90 shadow-lg shadow-black/20 sm:grid-cols-3"
          aria-label="Etapas da montagem"
        >
          {[
            ["01", "Configure", "Estrutura e acabamento"],
            ["02", "Importe", `${uploadedCount} de ${segments.length} cenas prontas`],
            ["03", "Exporte", `${combinations.length} variações em MP4`],
          ].map(([number, title, detail], index) => {
            const active =
              index === 0 || (index === 1 && uploadedCount > 0) || (index === 2 && allReady);
            return (
              <div
                key={number}
                className={`flex items-center gap-3 px-4 py-3.5 ${index ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-[10px] font-bold ${active ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25" : "bg-white/5 text-slate-500"}`}
                >
                  {number}
                </span>
                <span>
                  <span className="block text-xs font-semibold text-white">{title}</span>
                  <span className="block text-[10px] text-slate-500">{detail}</span>
                </span>
              </div>
            );
          })}
        </nav>

        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#0d1018] p-5 shadow-xl shadow-black/20 md:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Estrutura e saída</h2>
              <p className="text-xs text-muted-foreground">
                Escolha a quantidade de módulos. Cada corpo usa duas cenas.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <CountControl
              label="Ganchos"
              value={hookCount}
              disabled={busy}
              onChange={(value) => changeStructure({ hooks: value })}
            />
            <CountControl
              label="Corpos"
              value={bodyCount}
              disabled={busy}
              onChange={(value) => changeStructure({ bodies: value })}
            />
            <CountControl
              label="CTAs"
              value={ctaCount}
              disabled={busy}
              onChange={(value) => changeStructure({ ctas: value })}
            />
          </div>
          <div className="grid gap-5 border-t border-border/70 pt-5 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              Qualidade de saída
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={width}
                disabled={busy}
                onChange={(event) => {
                  normalizedRef.current = new Map();
                  setWidth(Number(event.target.value) as 720 | 1080);
                }}
              >
                <option value="720">720 × 1280 · mais rápido</option>
                <option value="1080">1080 × 1920 · maior qualidade</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary/20 p-4 text-sm">
              <input
                type="checkbox"
                className="size-4"
                checked={removeAudio}
                disabled={busy}
                onChange={(event) => {
                  normalizedRef.current = new Map();
                  setRemoveAudio(event.target.checked);
                }}
              />
              {removeAudio ? (
                <VolumeX className="text-primary" />
              ) : (
                <Volume2 className="text-primary" />
              )}
              Remover o áudio de todos os vídeos
            </label>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="w-full" disabled={busy} onClick={resetEditor}>
                <Trash2 /> Limpar tudo
              </Button>
            </div>
          </div>
          <div className="grid gap-3 border-t border-white/10 pt-5 md:grid-cols-4">
            <PolishToggle
              icon={Lightbulb}
              title="Variações com propósito"
              description="Escolhe sete montagens: agressiva, emocional, demonstração, preço, prova social, curta e longa."
              active={purposefulVariations}
              disabled={busy}
              onClick={() => setPurposefulVariations((value) => !value)}
            />
            <PolishToggle
              icon={Sparkles}
              title="Montagem inteligente"
              description="Aplica transições curtas para os cortes fluírem sem perder ritmo."
              active={smartPolish}
              disabled={busy}
              onClick={() => setSmartPolish((value) => !value)}
            />
            <PolishToggle
              icon={Layers3}
              title="Preencher o quadro"
              description="Ocupa todo o 9:16 e evita barras pretas nas cenas horizontais."
              active={fillFrame}
              disabled={busy}
              onClick={() => {
                normalizedRef.current = new Map();
                setFillFrame((value) => !value);
              }}
            />
            <PolishToggle
              icon={Volume2}
              title="Nivelar as vozes"
              description="Equilibra o volume entre gancho, corpo e CTA para um lote consistente."
              active={normalizeAudio && !removeAudio}
              disabled={busy || removeAudio}
              onClick={() => {
                normalizedRef.current = new Map();
                setNormalizeAudio((value) => !value);
              }}
            />
          </div>
          {combinations.length > 100 && (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              Este lote tem {combinations.length} vídeos. Para reduzir o uso de memória e o tempo de
              processamento, prefira gerar em lotes menores.
            </p>
          )}
        </section>

        <section className="bento-card overflow-hidden border-cyan/20">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                <Trophy className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {hasMinimumCombination
                    ? "Combinações históricas recomendadas"
                    : "Recomendações disponíveis após importar as cenas"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {hasMinimumCombination
                    ? "Ranking baseado nos resultados anteriores da página Desempenho. Ele não analisa o conteúdo dos arquivos importados."
                    : "Importe pelo menos um gancho, um corpo e um CTA. Antes disso, nenhum ranking será exibido como se tivesse analisado seus arquivos."}
                </p>
              </div>
            </div>
            <Badge className="w-fit bg-cyan/10 text-cyan">
              <TrendingUp className="mr-1 size-3" /> Dados reais da sua conta
            </Badge>
          </div>
          {!hasMinimumCombination ? (
            <div className="p-6 text-center text-xs leading-5 text-muted-foreground">
              Nenhum vídeo deste lote foi analisado. As sugestões só serão liberadas quando houver
              cenas suficientes para formar uma combinação.
            </div>
          ) : recommendedCombinations.length ? (
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3 md:p-6">
              {recommendedCombinations.map((item, index) => (
                <button
                  key={item.combination.number}
                  type="button"
                  className={`rounded-xl border p-4 text-left transition hover:border-cyan/40 hover:bg-cyan/[0.05] ${selectedRecommendation === item.combination.number ? "border-cyan/60 bg-cyan/[0.08] ring-1 ring-cyan/20" : "border-border bg-secondary/20"}`}
                  onClick={() => {
                    setSelectedRecommendation(item.combination.number);
                    document
                      .getElementById("batch-imports")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={index === 0 ? "bg-cyan text-black" : "bg-cyan/10 text-cyan"}>
                      {index === 0 ? "Postar primeiro" : `Recomendação ${index + 1}`}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {item.evidence} vídeo(s) de base
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    Vídeo {item.combination.number} · {item.combination.label}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Maior sinal: {recommendationReason(item.strongest)} · score {item.score}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs leading-5 text-muted-foreground">
              Ainda não há publicações suficientes para recomendar sem inventar dados. Importe links
              na página de Desempenho e este ranking será preenchido automaticamente.
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.055] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Quer editar um vídeo na timeline?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              O editor completo agora tem uma página própria, com textos, áudio, atalhos e
              animações.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/video-editor">
              <Film /> Abrir Editor de vídeo
            </Link>
          </Button>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Lightbulb className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Dicas enquanto você edita</h2>
                <p className="text-xs text-muted-foreground">
                  Um caminho simples para não se perder.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: MousePointer2,
                  title: "1. Organize",
                  text: "Arraste os clipes na faixa Vídeo para trocar a ordem das quatro falas.",
                },
                {
                  icon: Scissors,
                  title: "2. Corte",
                  text: "Mova o cursor vermelho, visualize o ponto e use Aparar início ou fim.",
                },
                {
                  icon: Type,
                  title: "3. Dê contexto",
                  text: "Use texto curto para benefício, prova ou CTA; mantenha longe das bordas.",
                },
                {
                  icon: Music2,
                  title: "4. Finalize o áudio",
                  text: "Importe música em volume baixo e use fade para não cobrir a voz.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-xl border border-border bg-secondary/20 p-4"
                >
                  <Icon className="size-4 text-primary" />
                  <h3 className="mt-2 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-card p-5 md:p-6">
            <Badge className="bg-cyan/10 text-cyan">Áudio liberado para creators</Badge>
            <h2 className="mt-3 font-semibold">Bibliotecas online</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Escolha uma faixa, confirme a licença para uso comercial, baixe e use “Importar áudio”
              no editor. Evitamos copiar músicas protegidas automaticamente.
            </p>
            <div className="mt-4 space-y-2">
              {[
                {
                  name: "TikTok Commercial Music Library",
                  note: "Fonte oficial para conteúdo comercial",
                  url: "https://ads.tiktok.com/business/creativecenter/music/pc/en",
                },
                {
                  name: "Pixabay Music",
                  note: "Trilhas gratuitas com busca por estilo",
                  url: "https://pixabay.com/music/",
                },
                {
                  name: "Mixkit Music",
                  note: "Músicas e efeitos sonoros gratuitos",
                  url: "https://mixkit.co/free-stock-music/",
                },
              ].map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-3 transition hover:border-cyan/30"
                >
                  <span>
                    <span className="block text-xs font-semibold">{source.name}</span>
                    <span className="text-[10px] text-muted-foreground">{source.note}</span>
                  </span>
                  <ExternalLink className="size-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="batch-imports" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Biblioteca de cenas</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Organize todas as variações usadas nas combinações do lote.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.key} className="surface-card overflow-hidden p-5 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{group.title}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <Badge
                  className={
                    group.key === "hook"
                      ? "bg-fuchsia-500/10 text-fuchsia-300"
                      : group.key === "body"
                        ? "bg-sky-500/10 text-sky-300"
                        : "bg-emerald-500/10 text-emerald-300"
                  }
                >
                  {segments.filter((segment) => segment.group === group.key && segment.file).length}
                  /{segments.filter((segment) => segment.group === group.key).length} prontos
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {segments
                  .filter((segment) => segment.group === group.key)
                  .map((segment) => (
                    <SegmentCard
                      key={segment.id}
                      segment={segment}
                      disabled={busy}
                      onFile={(file) => void selectFile(segment.id, file)}
                      onChange={(patch) => updateSegment(segment.id, patch)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </section>

        {busy && (
          <section className="glass-card border-primary/25 p-5">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Processando localmente</p>
                <p className="mt-1 text-xs text-muted-foreground">{progress}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  cancelRef.current = true;
                }}
              >
                Parar após este vídeo
              </Button>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.max(3, progressPercent)}%` }}
              />
            </div>
          </section>
        )}

        <section className="surface-card space-y-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {combinations.length} combinações disponíveis
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                O primeiro processamento prepara os {segments.length} clipes; depois, todos os
                vídeos são reunidos em um arquivo ZIP e descartados da memória.
              </p>
            </div>
            <Button variant="hero" disabled={!allReady || busy} onClick={() => void renderAll()}>
              {busy ? <Loader2 className="animate-spin" /> : <Archive />}
              Gerar ZIP com {combinations.length}
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {combinations.map((combination) => {
              const combinationReady = segmentIdsForCombination(combination).every((id) =>
                segments.some((segment) => segment.id === id && segment.file),
              );
              return (
                <button
                  key={combination.number}
                  type="button"
                  disabled={!combinationReady || busy}
                  onClick={() => void renderAndDownload(combination)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.05] disabled:opacity-50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {combination.number}
                  </span>
                  <span className="min-w-0 flex-1 text-xs font-medium">{combination.label}</span>
                  {completed.has(combination.number) ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <Download className="size-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-5 text-xs leading-5 text-muted-foreground">
          <Film className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>
            O lote completo gera apenas um download em formato ZIP. Mantenha esta aba aberta durante
            o processamento. Ao limpar ou fechar a página, os arquivos temporários são eliminados da
            memória.
          </p>
        </section>
      </div>
    </div>
  );
}

function SegmentCard({
  segment,
  disabled,
  onFile,
  onChange,
}: {
  segment: EditorSegment;
  disabled: boolean;
  onFile: (file: File | null) => void;
  onChange: (patch: Partial<EditorSegment>) => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-secondary/15 p-4 transition-colors hover:border-primary/30 ${
        segment.group === "hook"
          ? "border-fuchsia-500/20"
          : segment.group === "body"
            ? "border-sky-500/20"
            : "border-emerald-500/20"
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-0.5 ${
          segment.group === "hook"
            ? "bg-fuchsia-400"
            : segment.group === "body"
              ? "bg-sky-400"
              : "bg-emerald-400"
        }`}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{segment.label}</p>
        {segment.file && <CheckCircle2 className="size-4 text-emerald-400" />}
      </div>
      <Input
        className="mt-3"
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        disabled={disabled}
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      <p className="mt-2 truncate text-[11px] text-muted-foreground">
        {segment.file?.name ?? "Nenhum vídeo selecionado"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="text-[11px] text-muted-foreground">
          Início
          <Input
            className="mt-1 h-8"
            type="number"
            min="0"
            max={segment.duration}
            step="0.1"
            disabled={disabled || !segment.file}
            value={segment.start}
            onChange={(event) => {
              const start = Math.min(
                Math.max(0, Number(event.target.value)),
                Math.max(0, segment.duration - 0.1),
              );
              onChange({ start, end: Math.max(segment.end, start + 0.1) });
            }}
          />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Fim
          <Input
            className="mt-1 h-8"
            type="number"
            min={segment.start + 0.1}
            max={segment.duration}
            step="0.1"
            disabled={disabled || !segment.file}
            value={segment.end}
            onChange={(event) =>
              onChange({
                end: Math.max(
                  segment.start + 0.1,
                  Math.min(segment.duration, Number(event.target.value)),
                ),
              })
            }
          />
        </label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={segment.mute}
          disabled={disabled || !segment.file}
          onChange={(event) => onChange({ mute: event.target.checked })}
        />
        <Scissors className="size-3.5" /> Silenciar esta cena
      </label>

      <details className="mt-4 border-t border-border/70 pt-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-primary">
          <SlidersHorizontal className="size-3.5" /> Ajustes profissionais
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] text-muted-foreground">
              Velocidade
              <select
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={segment.playbackRate}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ playbackRate: Number(event.target.value) })}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-muted-foreground">
              Volume · {segment.volume}%
              <input
                className="mt-2 w-full accent-primary"
                type="range"
                min="0"
                max="200"
                step="5"
                value={segment.volume}
                disabled={disabled || !segment.file || segment.mute}
                onChange={(event) => onChange({ volume: Number(event.target.value) })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={segment.mirror}
              disabled={disabled || !segment.file}
              onChange={(event) => onChange({ mirror: event.target.checked })}
            />
            Espelhar o vídeo horizontalmente
          </label>

          <RangeControl
            label="Brilho"
            value={segment.brightness}
            display={segment.brightness.toFixed(2)}
            min={-1}
            max={1}
            step={0.05}
            disabled={disabled || !segment.file}
            onChange={(brightness) => onChange({ brightness })}
          />
          <RangeControl
            label="Contraste"
            value={segment.contrast}
            display={`${segment.contrast.toFixed(2)}×`}
            min={0.5}
            max={2}
            step={0.05}
            disabled={disabled || !segment.file}
            onChange={(contrast) => onChange({ contrast })}
          />
          <RangeControl
            label="Saturação"
            value={segment.saturation}
            display={`${segment.saturation.toFixed(2)}×`}
            min={0}
            max={2}
            step={0.05}
            disabled={disabled || !segment.file}
            onChange={(saturation) => onChange({ saturation })}
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] text-muted-foreground">
              Entrada suave
              <select
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={segment.fadeIn}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ fadeIn: Number(event.target.value) })}
              >
                <option value="0">Sem efeito</option>
                <option value="0.25">0,25 s</option>
                <option value="0.5">0,5 s</option>
                <option value="1">1 s</option>
                <option value="2">2 s</option>
              </select>
            </label>
            <label className="text-[11px] text-muted-foreground">
              Saída suave
              <select
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={segment.fadeOut}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ fadeOut: Number(event.target.value) })}
              >
                <option value="0">Sem efeito</option>
                <option value="0.25">0,25 s</option>
                <option value="0.5">0,5 s</option>
                <option value="1">1 s</option>
                <option value="2">2 s</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <label className="flex items-start gap-2 text-[11px] font-medium">
              <input
                className="mt-0.5"
                type="checkbox"
                checked={segment.hideOverlay}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ hideOverlay: event.target.checked })}
              />
              <span>
                Ocultar marca ou elemento fixo
                <span className="mt-0.5 block font-normal text-muted-foreground">
                  Use somente em conteúdo próprio ou com autorização.
                </span>
              </span>
            </label>
            {segment.hideOverlay && (
              <div className="mt-3 space-y-3">
                <label className="block text-[11px] text-muted-foreground">
                  Posição
                  <select
                    className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                    value={segment.overlayPosition}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange({
                        overlayPosition: event.target.value as EditorSegment["overlayPosition"],
                      })
                    }
                  >
                    <option value="top-left">Superior esquerda</option>
                    <option value="top-right">Superior direita</option>
                    <option value="bottom-left">Inferior esquerda</option>
                    <option value="bottom-right">Inferior direita</option>
                  </select>
                </label>
                <RangeControl
                  label="Largura da área"
                  value={segment.overlayWidth}
                  display={`${segment.overlayWidth}%`}
                  min={5}
                  max={40}
                  step={1}
                  disabled={disabled}
                  onChange={(overlayWidth) => onChange({ overlayWidth })}
                />
                <RangeControl
                  label="Altura da área"
                  value={segment.overlayHeight}
                  display={`${segment.overlayHeight}%`}
                  min={3}
                  max={25}
                  step={1}
                  disabled={disabled}
                  onChange={(overlayHeight) => onChange({ overlayHeight })}
                />
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

function CountControl({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-xl border border-border bg-secondary/15 p-3 text-xs font-medium text-muted-foreground">
      {label}
      <select
        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
          <option key={count} value={count}>
            {count}
          </option>
        ))}
      </select>
    </label>
  );
}

function PolishToggle({
  icon: Icon,
  title,
  description,
  active,
  disabled,
  onClick,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`group flex items-start gap-3 rounded-xl border p-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${active ? "border-violet-400/40 bg-violet-500/10 shadow-[inset_0_1px_rgba(255,255,255,.04)]" : "border-white/10 bg-black/15 hover:border-white/20"}`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "bg-white/5 text-slate-500"}`}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-xs font-semibold text-white">
          {title}
          <span
            className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-600"}`}
          />
        </span>
        <span className="mt-1 block text-[10px] leading-4 text-slate-500">{description}</span>
      </span>
    </button>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur ${accent ? "border-primary/30 bg-primary/15" : "border-border/70 bg-background/45"}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function RangeControl({
  label,
  value,
  display,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-[11px] text-muted-foreground">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-medium text-foreground">{display}</span>
      </span>
      <input
        className="mt-2 w-full accent-primary"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
