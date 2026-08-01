import { useMemo, useState } from "react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  FileVideo2,
  History,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listProjects, listTranscriptions } from "@/features/projects/queries";
import { processTranscription } from "@/features/validated-copies/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/copies")({
  component: TranscriptionsPage,
  head: () => ({ meta: [{ title: "Transcrever vídeos — Tik Supremo" }] }),
});

const safeName = (name: string) =>
  name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100);

type CopyAnalysis = {
  hook?: string;
  body?: string;
  cta?: string;
  markings?: Array<{ label: "Gancho" | "Corpo" | "CTA"; excerpt: string }>;
  why_it_worked?: string[];
  audience?: string;
  tone?: string;
  source_filename?: string;
};

function TranscriptionsPage() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const transcriptionsQuery = useQuery({
    queryKey: ["transcriptions"],
    queryFn: listTranscriptions,
  });
  const [projectId, setProjectId] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [videoInputKey, setVideoInputKey] = useState(0);
  const [progress, setProgress] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const projects = projectsQuery.data ?? [];
  const transcriptions = transcriptionsQuery.data ?? [];
  const transcriptionCount = useMemo(() => transcriptions.length, [transcriptions]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!video) throw new Error("Selecione um vídeo para transcrever.");
      if (video.size > 500 * 1024 * 1024)
        throw new Error("O arquivo excede a capacidade de 500 MB do armazenamento.");
      setProgress("Enviando o vídeo...");
      const path = `${user.id}/transcriptions/${crypto.randomUUID()}-${safeName(video.name)}`;
      const supabase = getSupabaseBrowserClient();
      const upload = await supabase.storage
        .from("reference-videos")
        .upload(path, video, { contentType: video.type, upsert: false });
      if (upload.error) throw new Error(`Falha no envio: ${upload.error.message}`);
      const record = await supabase
        .from("transcriptions")
        .insert({
          project_id: projectId || null,
          user_id: user.id,
          storage_path: path,
          original_filename: video.name,
          processing_status: "pending",
        })
        .select("id")
        .single();
      if (record.error || !record.data) {
        await supabase.storage.from("reference-videos").remove([path]);
        if (record.error?.code === "PGRST205" || record.error?.code === "42P01") {
          throw new Error(
            "A estrutura de transcrições ainda não está disponível no banco. Atualize a página e tente novamente.",
          );
        }
        throw new Error(
          `O vídeo foi enviado, mas não pôde ser registrado: ${record.error?.message ?? "erro desconhecido"}`,
        );
      }
      setProgress("Transcrevendo e analisando o conteúdo...");
      await processTranscription({ data: { transcriptionId: record.data.id } });
    },
    onSuccess: async () => {
      toast.success("Vídeo transcrito, analisado e salvo no histórico.");
      setVideo(null);
      setVideoInputKey((value) => value + 1);
      setProgress("");
      await queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
      if (projectId) await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (cause) => {
      setProgress("");
      toast.error(cause instanceof Error ? cause.message : "Não foi possível transcrever.");
    },
  });

  const linkMutation = useMutation({
    mutationFn: async ({ transcriptionId, nextProjectId }: { transcriptionId: string; nextProjectId: string }) => {
      const update = await getSupabaseBrowserClient()
        .from("transcriptions")
        .update({ project_id: nextProjectId || null })
        .eq("id", transcriptionId)
        .eq("user_id", user.id);
      if (update.error) throw new Error(`Não foi possível alterar o projeto: ${update.error.message}`);
    },
    onSuccess: async () => {
      toast.success("Associação atualizada.");
      await queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
    onError: (cause) => toast.error(cause instanceof Error ? cause.message : "Não foi possível associar."),
  });

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copy copiada.");
    setTimeout(() => setCopiedId(null), 1_500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Biblioteca de conteúdo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Transcrever vídeos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Envie qualquer vídeo para transcrever e analisar. Cada transcrição fica independente no
          histórico; você só associa a um projeto se quiser utilizá-la em um roteiro.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="surface-card p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Novo vídeo</h2>
              <p className="text-xs text-muted-foreground">Sem limite de quantidade de transcrições.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Associar a um projeto <span className="text-muted-foreground">(opcional)</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                disabled={projectsQuery.isLoading || mutation.isPending}
              >
                <option value="">Sem projeto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Vídeo da copy validada
              <Input
                key={videoInputKey}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                disabled={mutation.isPending}
                onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          {video && (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <FileVideo2 className="size-4 text-primary" /> {video.name}
            </p>
          )}
          <Button
            className="mt-6"
            variant="hero"
            disabled={!video || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {mutation.isPending ? progress : "Transcrever, analisar e salvar"}
          </Button>
        </div>
        <div className="surface-card flex min-w-48 items-center gap-4 p-6">
          <History className="size-7 text-primary" />
          <div>
            <p className="text-3xl font-semibold">{transcriptionCount}</p>
            <p className="text-xs text-muted-foreground">vídeos transcritos</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Histórico</h2>
          <Badge variant="outline">{transcriptions.length} transcrições salvas</Badge>
        </div>
        {transcriptionsQuery.isLoading ? (
          <div className="surface-card flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : transcriptionsQuery.error ? (
          <div className="surface-card p-5 text-destructive">{transcriptionsQuery.error.message}</div>
        ) : transcriptions.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            Sua primeira transcrição aparecerá aqui, mesmo sem projeto associado.
          </div>
        ) : (
          <div className="space-y-4">
            {transcriptions.map((transcription) => {
              const analysis = (transcription.analysis ?? {}) as CopyAnalysis;
              const project = Array.isArray(transcription.projects) ? transcription.projects[0] : transcription.projects;
              return (
                <article key={transcription.id} className="surface-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>Vídeo transcrito</Badge>
                        <span className="text-xs text-muted-foreground">{project?.name || "Sem projeto"}</span>
                      </div>
                      {analysis.source_filename && <p className="mt-2 text-xs text-muted-foreground">{analysis.source_filename}</p>}
                    </div>
                    <Button variant="outline" size="sm" disabled={!transcription.transcript} onClick={() => copyText(transcription.id, transcription.transcript || "")}>
                      {copiedId === transcription.id ? <Check /> : <Copy />} Copiar texto
                    </Button>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-6">
                    {transcription.transcript || "Transcrição indisponível."}
                  </p>
                  <label className="mt-4 block space-y-2 text-xs font-medium text-muted-foreground">
                    Usar em um projeto
                    <select
                      className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      value={transcription.project_id ?? ""}
                      disabled={linkMutation.isPending}
                      onChange={(event) =>
                        linkMutation.mutate({ transcriptionId: transcription.id, nextProjectId: event.target.value })
                      }
                    >
                      <option value="">Sem projeto</option>
                      {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                  {(analysis.hook || analysis.body || analysis.cta) && (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <AnalysisBlock label="Gancho" value={analysis.hook} />
                      <AnalysisBlock label="Corpo" value={analysis.body} />
                      <AnalysisBlock label="CTA" value={analysis.cta} />
                    </div>
                  )}
                  {!!analysis.markings?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysis.markings.map((mark, index) => (
                        <span key={`${mark.label}-${index}`} className="rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-xs">
                          <strong className="text-primary">{mark.label}:</strong> {mark.excerpt}
                        </span>
                      ))}
                    </div>
                  )}
                  {!!analysis.why_it_worked?.length && (
                    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                      <h3 className="text-sm font-semibold text-emerald-400">O que deu certo</h3>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {analysis.why_it_worked.map((reason, index) => <li key={index}>• {reason}</li>)}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function AnalysisBlock({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/90">{value || "Não identificado"}</p>
    </div>
  );
}
