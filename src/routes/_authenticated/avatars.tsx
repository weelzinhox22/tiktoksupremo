import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAvatarBrief, generateAvatarImage } from "@/features/avatars/server";
import { listAvatarLibrary } from "@/features/libraries/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/avatars")({
  component: AvatarsPage,
  head: () => ({ meta: [{ title: "Biblioteca de avatares — Tik Supremo" }] }),
});

const safeName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-100);

function AvatarsPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["avatars", user.id],
    queryFn: () => listAvatarLibrary(user.id),
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [brief, setBrief] = useState<{
    visual_description: string;
    image_prompt: string;
    preservation_rules: string[];
  } | null>(null);

  const briefMutation = useMutation({
    mutationFn: () => createAvatarBrief({ data: { name, description } }),
    onSuccess: (result) => {
      setBrief(result);
      toast.success("Briefing de avatar criado com sucesso.");
    },
    onError: (error) => toast.error(error.message),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateAvatarImage({ data: { name, description } }),
    onSuccess: async () => {
      setName("");
      setDescription("");
      setBrief(null);
      toast.success("Avatar criado com FLUX e salvo na biblioteca.");
      await queryClient.invalidateQueries({ queryKey: ["avatars", user.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Escolha uma foto para o avatar.");
      if (name.trim().length < 2) throw new Error("Dê um nome ao avatar.");
      const supabase = getSupabaseBrowserClient();
      const imagePath = `${user.id}/avatars/uploaded/${crypto.randomUUID()}-${safeName(file.name)}`;
      const upload = await supabase.storage
        .from("product-images")
        .upload(imagePath, file, { contentType: file.type, upsert: false });
      if (upload.error) throw new Error(`Falha ao enviar a foto: ${upload.error.message}`);
      const insert = await supabase.from("avatars").insert({
        user_id: user.id,
        name: name.trim(),
        description: brief?.visual_description || description.trim(),
        image_path: imagePath,
        source: "upload",
        generation_prompt: brief?.image_prompt ?? null,
        metadata: {
          reference_purpose: "ugc_video_identity_anchor",
          preservation_rules: brief?.preservation_rules ?? [],
          brief_provider: brief ? "gemini_free_text" : null,
        },
      });
      if (insert.error) {
        await supabase.storage.from("product-images").remove([imagePath]);
        throw new Error("A foto foi enviada, mas não pôde entrar na biblioteca.");
      }
    },
    onSuccess: async () => {
      setName("");
      setDescription("");
      setFile(null);
      setBrief(null);
      toast.success("Avatar salvo na biblioteca.");
      await queryClient.invalidateQueries({ queryKey: ["avatars", user.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, imagePath }: { id: string; imagePath: string }) => {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase.from("avatars").delete().eq("id", id).eq("user_id", user.id);
      if (result.error) throw new Error("Não foi possível remover o avatar.");
      await supabase.storage.from("product-images").remove([imagePath]);
    },
    onSuccess: async () => {
      toast.success("Avatar removido.");
      await queryClient.invalidateQueries({ queryKey: ["avatars", user.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="bento-hero relative overflow-hidden p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="mr-1 size-3" />
            Identidade consistente
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Sua equipe de creators, sempre com o mesmo rosto.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Gere com FLUX no Cloudflare ou envie uma foto. Depois reutilize o avatar em qualquer
            produto e roteiro.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="feature-pill">
              <CheckCircle2 />
              FLUX Schnell
            </span>
            <span className="feature-pill">
              <CheckCircle2 />
              Franquia grátis diária
            </span>
            <span className="feature-pill">
              <CheckCircle2 />
              Referência privada
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bento-card space-y-5 p-5 lg:p-7">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Criar ou enviar avatar</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Descreva uma personagem adulta fictícia. O FLUX cria e salva a imagem
                automaticamente.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome do avatar</Label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Marina UGC"
                />
              </div>
              <div className="space-y-2">
                <Label>Foto pronta</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Como deve ser a personagem?</Label>
              <Textarea
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex.: mulher brasileira adulta, cabelo cacheado castanho, roupa casual neutra, aparência espontânea e confiante"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="hero"
                disabled={
                  name.trim().length < 2 ||
                  description.trim().length < 20 ||
                  generateMutation.isPending
                }
                onClick={() => generateMutation.mutate()}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <WandSparkles />
                )}
                {generateMutation.isPending ? "Criando avatar..." : "Gerar com FLUX"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={
                  name.trim().length < 2 ||
                  description.trim().length < 20 ||
                  briefMutation.isPending
                }
                onClick={() => briefMutation.mutate()}
              >
                {briefMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Gerar somente o prompt
              </Button>
              <Button
                type="button"
                variant="hero"
                disabled={!file || name.trim().length < 2 || uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
              >
                {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
                Enviar foto pronta
              </Button>
            </div>
          </div>
        </div>
        <div className="bento-card bento-card-accent p-5 lg:p-7">
          {brief ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Prompt criado</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(brief.image_prompt);
                    toast.success("Prompt copiado.");
                  }}
                >
                  <Copy /> Copiar
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">{brief.visual_description}</p>
              <div className="max-h-52 overflow-y-auto rounded-xl bg-background/70 p-4 text-xs leading-5">
                {brief.image_prompt}
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {brief.preservation_rules.map((rule) => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <WandSparkles className="size-7" />
              </span>
              <p className="mt-4 text-sm font-semibold">Duas formas de começar</p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                Gere a imagem diretamente com IA ou peça somente um prompt detalhado
                para usar em outra ferramenta.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seus avatares</h2>
          <span className="text-xs text-muted-foreground">{query.data?.length ?? 0} salvo(s)</span>
        </div>
        {query.isLoading ? (
          <div className="surface-card flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : query.data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {query.data.map((avatar) => (
              <article key={avatar.id} className="avatar-card group overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary/30">
                  {avatar.previewUrl ? (
                    <AvatarImage src={avatar.previewUrl} alt={avatar.name} />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <UserRound className="size-10 text-muted-foreground" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <Badge className="bg-black/45 text-white backdrop-blur">
                      {avatar.source === "generated" ? "FLUX" : "Upload"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold transition-colors group-hover:text-primary">
                        {avatar.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {avatar.description || "Sem descrição"}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remover ${avatar.name}`}
                      disabled={deleteMutation.isPending}
                      onClick={() =>
                        deleteMutation.mutate({ id: avatar.id, imagePath: avatar.image_path })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface-card flex flex-col items-center p-12 text-center">
            <ImagePlus className="size-8 text-primary" />
            <p className="mt-3 font-medium">Nenhum avatar salvo</p>
            <p className="mt-1 text-xs text-muted-foreground">Envie sua primeira foto acima.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex size-full items-center justify-center">
        <UserRound className="size-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      onError={() => setFailed(true)}
      className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
    />
  );

}

