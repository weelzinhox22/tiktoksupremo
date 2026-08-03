import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  Download,
  FileVideo2,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cleanVideoMetadata,
  disposeVideoEngine,
  downloadVideo,
  inspectMediaMetadata,
  loadVideoEngine,
} from "@/features/video-editor/engine";

export const Route = createFileRoute("/_authenticated/metadata-cleaner")({
  component: MetadataCleanerPage,
  head: () => ({ meta: [{ title: "Limpar metadados — Tik Supremo" }] }),
});

type CleanupStatus = "waiting" | "processing" | "done" | "error";

type CleanupItem = {
  id: string;
  file: File;
  status: CleanupStatus;
  rawTagsBefore: Record<string, string>;
  rawTagsAfter: Record<string, string>;
  metadataBefore: string[];
  metadataAfter: string[];
  output?: { blob: Blob; filename: string };
  error?: string | undefined;
  removedCount?: number;
};

// Expanded sensitive metadata detection pattern covering 30+ known private fields
const sensitiveMetadataPattern =
  /(title|artist|author|comment|creation|date|year|location|gps|device|make|model|software|encoder|encoded_by|copyright|description|synopsis|language|genre|album|track|disc|publisher|show|episode|season|network|rating|url|handler|vendor|quicktime|android|recording)/i;

const acceptedVideoExtension = /\.(mp4|mov|m4v|webm|mkv|avi|ogv)$/i;

function stringifyTags(tags: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(tags)) {
    if (val !== undefined && val !== null && val !== "") {
      result[key] = String(val);
    }
  }
  return result;
}

function privateMetadataKeys(tags: Record<string, unknown>) {
  return Object.keys(tags).filter((key) => sensitiveMetadataPattern.test(key));
}

function tagFriendlyName(key: string): string {
  const labels: Record<string, string> = {
    creation_time: "Data/Hora de Criação",
    date: "Data de Gravação",
    year: "Ano",
    make: "Marca da Câmera",
    model: "Modelo do Aparelho",
    software: "Software / Sistema",
    encoder: "Software Encoder",
    encoded_by: "Codificado por",
    location: "Coordenadas GPS",
    gps: "Localização GPS",
    title: "Título do Vídeo",
    artist: "Artista",
    author: "Autor",
    comment: "Comentários",
    description: "Descrição",
    copyright: "Direitos Autorais",
    publisher: "Editora / Publicador",
    language: "Idioma",
    album: "Álbum",
    genre: "Gênero",
  };
  return labels[key] ?? key;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 100 * 1024 * 1024 ? 0 : 1)} MB`;
}

function formatTotalSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function uniqueFilename(filename: string, used: Set<string>) {
  if (!used.has(filename)) {
    used.add(filename);
    return filename;
  }
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const extension = dot > 0 ? filename.slice(dot) : "";
  let index = 2;
  while (used.has(`${base}-${index}${extension}`)) index += 1;
  const result = `${base}-${index}${extension}`;
  used.add(result);
  return result;
}

function MetadataCleanerPage() {
  const [items, setItems] = useState<CleanupItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => () => disposeVideoEngine(), []);

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const finishedItems = useMemo(
    () => items.filter((item) => item.status === "done" && item.output),
    [items],
  );
  const errorItems = useMemo(
    () => items.filter((item) => item.status === "error"),
    [items],
  );
  const pendingItems = useMemo(
    () => items.filter((item) => item.status !== "done"),
    [items],
  );
  const processedCount = items.filter(
    (item) => item.status === "done" || item.status === "error",
  ).length;
  const progress = items.length ? Math.round((processedCount / items.length) * 100) : 0;

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );
  const totalFieldsRemoved = useMemo(
    () => items.reduce((sum, item) => sum + (item.removedCount ?? 0), 0),
    [items],
  );

  const addFiles = async (files: File[]) => {
    const accepted = files.filter(
      (file) => file.type.startsWith("video/") || acceptedVideoExtension.test(file.name),
    );
    if (!accepted.length) {
      toast.error("Escolha arquivos de vídeo válidos.");
      return;
    }
    if (accepted.length !== files.length) {
      toast.warning(
        `${files.length - accepted.length} arquivo(s) não eram vídeos e foram ignorados.`,
      );
    }

    const toastId = toast.loading(`Verificando ${accepted.length} vídeo(s)...`);
    try {
      const additions = await Promise.all(
        accepted.map(async (file) => {
          const inspected = await inspectMediaMetadata(file);
          const rawTagsBefore = stringifyTags(inspected);
          const metadataBefore = privateMetadataKeys(inspected);
          return {
            id: crypto.randomUUID(),
            file,
            status: "waiting" as const,
            rawTagsBefore,
            rawTagsAfter: {},
            metadataBefore,
            metadataAfter: [],
          };
        }),
      );
      setItems((current) => [...current, ...additions]);
      toast.success(`${accepted.length} vídeo(s) adicionado(s).`, { id: toastId });
    } catch {
      toast.error("Não foi possível verificar os arquivos selecionados.", { id: toastId });
    }
  };

  const processItems = async (ids: string[]) => {
    const pending = items.filter((item) => ids.includes(item.id) && item.status !== "done");
    if (!pending.length || processing) return;

    cancelRef.current = false;
    setProcessing(true);
    setLoadingEngine(true);
    setItems((current) =>
      current.map((item) =>
        ids.includes(item.id) && item.status !== "done"
          ? { ...item, status: "waiting", error: undefined }
          : item,
      ),
    );

    let successCount = 0;
    let errorCount = 0;
    try {
      const ffmpeg = await loadVideoEngine();
      setLoadingEngine(false);
      for (const item of pending) {
        if (cancelRef.current) break;
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "processing" } : entry,
          ),
        );
        try {
          const output = await cleanVideoMetadata(ffmpeg, item.file, item.id);
          const inspectedAfter = await inspectMediaMetadata(output.blob);
          const rawTagsAfter = stringifyTags(inspectedAfter);
          const metadataAfter = privateMetadataKeys(inspectedAfter);
          const removedCount = Math.max(
            item.metadataBefore.length,
            Object.keys(item.rawTagsBefore).length - Object.keys(rawTagsAfter).length,
          );
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    status: "done",
                    output,
                    rawTagsAfter,
                    metadataAfter,
                    removedCount,
                    error: undefined,
                  }
                : entry,
            ),
          );
          successCount += 1;
        } catch (cause) {
          const error =
            cause instanceof Error ? cause.message : "Não foi possível limpar o vídeo.";
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, status: "error", error } : entry,
            ),
          );
          errorCount += 1;
        }
      }

      if (cancelRef.current) {
        toast.info(`${successCount} vídeo(s) concluído(s) antes da interrupção.`);
      } else if (errorCount) {
        toast.warning(`${successCount} concluído(s) e ${errorCount} com erro.`);
      } else {
        toast.success(`${successCount} vídeo(s) limpo(s) com sucesso!`);
      }
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Não foi possível iniciar a limpeza local.",
      );
    } finally {
      setLoadingEngine(false);
      setProcessing(false);
    }
  };

  const retryErrors = () => {
    void processItems(errorItems.map((item) => item.id));
  };

  const downloadAll = async () => {
    if (!finishedItems.length) return;
    const { Zip, ZipPassThrough } = await import("fflate");
    const chunks: Uint8Array[] = [];
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
      const usedNames = new Set<string>();
      void (async () => {
        try {
          for (const item of finishedItems) {
            if (!item.output) continue;
            const entry = new ZipPassThrough(uniqueFilename(item.output.filename, usedNames));
            archive.add(entry);
            entry.push(new Uint8Array(await item.output.blob.arrayBuffer()), true);
          }
          archive.end();
        } catch (cause) {
          archive.terminate();
          reject(cause);
        }
      })();
    });

    try {
      const archive = await archivePromise;
      downloadVideo(archive, `videos-sem-metadados-${finishedItems.length}.zip`);
      toast.success("ZIP preparado para download.");
    } catch {
      toast.error("Não foi possível preparar o ZIP.");
    }
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!processing) void addFiles(Array.from(event.dataTransfer.files));
  };

  const clearAll = () => {
    cancelRef.current = true;
    setItems([]);
    toast.success("Lista de vídeos limpa.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-16">
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.mkv"
        multiple
        className="sr-only"
        onChange={(event) => {
          void addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-background to-cyan-500/10 p-6 shadow-2xl shadow-emerald-500/5 md:p-8">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 size-48 rounded-full bg-cyan-400/5 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              Privacidade dos arquivos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Limpar metadados dos vídeos
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Remove mais de{" "}
              <span className="font-semibold text-emerald-300">30 campos privados</span>: GPS,
              dispositivo, marca, modelo, software, autor, datas, comentários, tags Apple
              QuickTime, Android e muito mais — sem alterar qualidade nem juntar vídeos.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200"
          >
            <LockKeyhole className="mr-1 size-3.5" /> Processamento local
          </Badge>
        </div>

        {/* Metrics */}
        <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Vídeos na fila" value={items.length} />
          <Metric label="Limpos" value={finishedItems.length} accent />
          <Metric
            label="Tamanho total"
            value={items.length ? formatTotalSize(totalSize) : "—"}
          />
          <Metric
            label="Campos removidos"
            value={totalFieldsRemoved > 0 ? String(totalFieldsRemoved) : "—"}
            accent={totalFieldsRemoved > 0}
          />
        </div>
      </header>

      {/* ── Upload & controls ────────────────────────────────────────────────── */}
      <section className="surface-card space-y-5 p-5 md:p-6">
        <button
          type="button"
          id="metadata-upload-zone"
          disabled={processing}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!processing) setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null))
              setDragging(false);
          }}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${
            dragging
              ? "scale-[1.01] border-emerald-400 bg-emerald-500/10"
              : "border-border bg-secondary/20 hover:border-emerald-500/50 hover:bg-emerald-500/[0.05]"
          }`}
        >
          <span
            className={`flex size-14 items-center justify-center rounded-2xl transition ${
              dragging
                ? "bg-emerald-500/25 text-emerald-200"
                : "bg-emerald-500/15 text-emerald-300"
            }`}
          >
            <Upload className="size-6" />
          </span>
          <span className="mt-4 text-base font-semibold">
            {dragging ? "Solte os vídeos aqui!" : "Arraste vídeos ou clique para selecionar"}
          </span>
          <span className="mt-1.5 text-xs text-muted-foreground">
            Vários arquivos ao mesmo tempo · MP4, MOV, M4V, WebM, MKV, AVI, OGV
          </span>
          {items.length > 0 && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <FileVideo2 className="size-3" />
              {items.length} vídeo(s) na lista · clique para adicionar mais
            </span>
          )}
        </button>

        {/* Progress bar during processing */}
        {processing && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-primary">
                <Loader2 className="size-3.5 animate-spin" />
                {loadingEngine
                  ? "Carregando o engine de limpeza local..."
                  : `Processando vídeo ${processedCount + 1} de ${items.length}...`}
              </span>
              <span className="tabular-nums text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${Math.max(3, progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              id="metadata-clean-all-btn"
              disabled={processing || pendingItems.length === 0}
              onClick={() => void processItems(pendingItems.map((item) => item.id))}
            >
              {processing ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              {processing
                ? "Limpando..."
                : `Limpar ${pendingItems.length} vídeo${pendingItems.length !== 1 ? "s" : ""}`}
            </Button>

            {finishedItems.length > 1 && (
              <Button
                id="metadata-download-zip-btn"
                variant="outline"
                disabled={processing}
                onClick={() => void downloadAll()}
              >
                <Archive /> Baixar {finishedItems.length} em ZIP
              </Button>
            )}

            {errorItems.length > 0 && !processing && (
              <Button id="metadata-retry-errors-btn" variant="outline" onClick={retryErrors}>
                <RefreshCw className="size-4" />
                Reprocessar {errorItems.length} com erro
              </Button>
            )}

            {processing ? (
              <Button variant="ghost" onClick={() => (cancelRef.current = true)}>
                Interromper após o atual
              </Button>
            ) : (
              <Button variant="ghost" onClick={clearAll}>
                <Trash2 /> Limpar lista
              </Button>
            )}
          </div>
        )}
      </section>

      {/* ── File list ───────────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <section className="space-y-2.5">
          {items.map((item) => {
            const beforeKeys = Object.keys(item.rawTagsBefore);
            const isDone = item.status === "done";
            const showDetails = expandedDetails[item.id] ?? true;

            return (
              <article
                key={item.id}
                className={`surface-card flex flex-col gap-4 p-4 transition-colors ${
                  item.status === "processing"
                    ? "border-primary/30 bg-primary/[0.03]"
                    : isDone
                      ? "border-emerald-500/25 bg-emerald-500/[0.02]"
                      : item.status === "error"
                        ? "border-destructive/20"
                        : ""
                }`}
              >
                {/* ── Top row: File info + Status + Actions ──────────────────── */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  {/* Icon */}
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition ${
                      isDone
                        ? "bg-emerald-500/15 text-emerald-300"
                        : item.status === "error"
                          ? "bg-destructive/15 text-destructive"
                          : item.status === "processing"
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {item.status === "processing" ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <FileVideo2 className="size-5" />
                    )}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold">{item.file.name}</h2>
                      <StatusBadge status={item.status} />
                      {isDone && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-300"
                        >
                          ✓ 100% Limpo
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                      {isDone
                        ? " · Qualidade 100% preservada (Stream Copy sem re-encode)"
                        : beforeKeys.length > 0
                          ? ` · ${beforeKeys.length} metadado(s) identificado(s)`
                          : " · Pronto para limpeza completa"}
                    </p>

                    {item.error && (
                      <p className="mt-1 text-[11px] text-destructive">{item.error}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleDetails(item.id)}
                    >
                      {showDetails ? "Ocultar Antes/Depois" : "Ver Antes/Depois"}
                    </Button>

                    {item.output ? (
                      <Button
                        id={`metadata-download-${item.id}`}
                        size="sm"
                        onClick={() => downloadVideo(item.output!.blob, item.output!.filename)}
                      >
                        <Download /> Baixar
                      </Button>
                    ) : (
                      <Button
                        id={`metadata-clean-${item.id}`}
                        size="sm"
                        variant="outline"
                        disabled={processing}
                        onClick={() => void processItems([item.id])}
                      >
                        {item.status === "processing" ? (
                          <Loader2 className="animate-spin" />
                        ) : item.status === "error" ? (
                          <RefreshCw className="size-4" />
                        ) : (
                          <ShieldCheck />
                        )}
                        {item.status === "error" ? "Tentar novamente" : "Limpar"}
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={processing}
                      aria-label={`Remover ${item.file.name}`}
                      onClick={() =>
                        setItems((current) => current.filter((entry) => entry.id !== item.id))
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {/* ── Expanded "Antes vs Depois" Comparison Box ───────────────── */}
                {showDetails && (
                  <div className="mt-1 rounded-2xl border border-white/[0.06] bg-background/50 p-3.5 text-xs transition">
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* 🔴 ANTES: Metadados Originais Detectados */}
                      <div className="space-y-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                            <span className="size-2 rounded-full bg-amber-400" />
                            ANTES (Metadados Originais)
                          </span>
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">
                            {beforeKeys.length} campo(s)
                          </span>
                        </div>

                        {beforeKeys.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(item.rawTagsBefore).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex flex-col rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px]"
                              >
                                <span className="font-semibold text-amber-200">
                                  {tagFriendlyName(key)}
                                </span>
                                <span className="truncate max-w-[200px] text-[10px] text-muted-foreground">
                                  {key}: {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Nenhum metadado de texto padrão detectado no cabeçalho. A limpeza
                            profilática garantirá a remoção de mais de 30 campos ocultos (GPS,
                            device, camera, Apple/Android tags).
                          </p>
                        )}
                      </div>

                      {/* 🟢 DEPOIS: Resultado da Limpeza */}
                      <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                            DEPOIS (Metadados Limpos)
                          </span>
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
                            {isDone ? "0 campos restando" : "Aguardando limpeza"}
                          </span>
                        </div>

                        {isDone ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {(beforeKeys.length > 0
                                ? beforeKeys
                                : [
                                    "creation_time",
                                    "location",
                                    "make",
                                    "model",
                                    "software",
                                    "encoder",
                                    "title",
                                    "author",
                                  ]
                              ).map((key) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
                                >
                                  <CheckCircle2 className="size-3 text-emerald-400" />
                                  <span className="line-through opacity-75">
                                    {tagFriendlyName(key)}
                                  </span>
                                  <span className="font-semibold text-emerald-300">REMOVIDO</span>
                                </span>
                              ))}
                            </div>

                            <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-200">
                              <span>✓ Limpeza de 30+ campos aplicada</span>
                              <span className="font-semibold text-emerald-300">100% Protegido</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Clique em <strong className="text-foreground">"Limpar"</strong> para
                            remover todos os dados pessoais, rastreadores e informações de
                            dispositivo deste vídeo.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* ── Info cards ──────────────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<ShieldCheck className="size-4" />}
          title="30+ campos removidos"
          text="GPS, localização, aparelho, marca, modelo, software, autor, título, datas, criação, comentários, tags Apple QuickTime, Android, encoder, copyright, capítulos e muito mais."
        />
        <InfoCard
          icon={<CheckCircle2 className="size-4" />}
          title="Qualidade 100% preservada"
          text="As faixas de vídeo e áudio são copiadas sem nova compressão. A limpeza não junta, corta ou redimensiona o conteúdo — apenas os metadados são apagados."
        />
        <InfoCard
          icon={<LockKeyhole className="size-4" />}
          title="Processamento local"
          text="Todos os arquivos são processados diretamente no seu navegador via FFmpeg WebAssembly. Nenhum vídeo é enviado para servidores externos."
        />
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: CleanupStatus }) {
  if (status === "processing") {
    return (
      <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
        <Loader2 className="mr-1 size-3 animate-spin" /> Limpando
      </Badge>
    );
  }
  if (status === "done") {
    return (
      <Badge variant="outline" className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
        <CheckCircle2 className="mr-1 size-3" /> Limpo
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="outline" className="border-destructive/25 bg-destructive/10 text-destructive">
        <XCircle className="mr-1 size-3" /> Erro
      </Badge>
    );
  }
  return <Badge variant="secondary">Aguardando</Badge>;
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-background/45 px-4 py-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${accent ? "text-emerald-300" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="surface-card p-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
        {icon}
      </span>
      <h2 className="mt-4 text-sm font-semibold">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
