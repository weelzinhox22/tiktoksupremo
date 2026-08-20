import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Upload,
  UserRound,
  Wand2,
  PackageCheck,
  PersonStanding,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateProjectScript } from "@/features/script-generation/server";
import { extractVideoFrames } from "@/features/video-analysis/extract-frames";
import { importProductFromUrl } from "@/features/products/import-server";
import { suggestProductFields, type ProductSuggestions } from "@/features/products/suggest-server";
import { generateAvatarImage } from "@/features/avatars/server";
import {
  listAvatarLibrary,
  listMovementLibrary,
  listProductLibrary,
  type AvatarWithPreview,
  type ProductLibraryWithPreview,
} from "@/features/libraries/queries";
import type { Avatar, MovementPreset } from "@/lib/supabase/types";
import { FormatStepSelector } from "@/features/script-formats/components/FormatStepSelector";
import type { SelectedFormat } from "@/features/script-formats/types";

const schema = z.object({
  projectName: z.string().max(160, "O nome do projeto deve ter no máximo 160 caracteres."),
  productName: z.string().min(2, "Informe o produto."),
  productUrl: z.string(),
  category: z.string().min(1),
  price: z.string(),
  promotion: z.string(),
  productVariation: z.string(),
  commission: z.string(),
  rating: z.string(),
  reviewCount: z.string(),
  knownSales: z.string(),
  description: z.string().min(10),
  benefits: z.string().min(3),
  problems: z.string(),
  objections: z.string(),
  audience: z.string().min(3),
  competition: z.string(),
  productNotes: z.string(),
  copy: z.string(),
  duration: z.string(),
  tone: z.string(),
  character: z.string(),
  setting: z.string(),
  recordingStyle: z.string(),
  objective: z.string(),
  variations: z.string(),
  sceneCount: z.string(),
  videoFormat: z.string(),
  apparentAge: z.string(),
  outfit: z.string(),
  appearance: z.string(),
  characterEnergy: z.string(),
  voiceSpeed: z.string(),
  bottleHand: z.string(),
  rotateBottle: z.string(),
  bringBottleClose: z.string(),
  bottleClosed: z.string(),
  continuity: z.string(),
  sameCamera: z.string(),
  cleanScreen: z.string(),
  finalCta: z.string(),
  requiredInformation: z.string(),
  forbiddenWords: z.string(),
  modularVariations: z.boolean(),
  notes: z.string(),
});
type FormData = z.infer<typeof schema>;
const steps = ["Produto", "Referência", "Formato", "Configuração", "Gerar"];
const list = (value: string) =>
  value
    .split(/\n|,/)
    .map((v) => v.trim())
    .filter(Boolean);
const nullableNumber = (value: string) => (value.trim() ? Number(value.replace(",", ".")) : null);
const safeName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-100);
const buildProjectName = (customName: string, productName: string) => {
  const requestedName = customName.trim() || `Roteiro — ${productName.trim()}`;
  return requestedName.slice(0, 160).trim() || "Novo roteiro";
};

export const Route = createFileRoute("/_authenticated/projects/new")({
  validateSearch: (search: Record<string, unknown>): {
    projectName?: string | undefined;
    productName?: string | undefined;
    description?: string | undefined;
    copy?: string | undefined;
    benefits?: string | undefined;
    audience?: string | undefined;
    problems?: string | undefined;
    objections?: string | undefined;
    setting?: string | undefined;
    character?: string | undefined;
    tone?: string | undefined;
    duration?: string | undefined;
  } => {
    return {
      projectName: typeof search["projectName"] === "string" ? search["projectName"] : undefined,
      productName: typeof search["productName"] === "string" ? search["productName"] : undefined,
      description: typeof search["description"] === "string" ? search["description"] : undefined,
      copy: typeof search["copy"] === "string" ? search["copy"] : undefined,
      benefits: typeof search["benefits"] === "string" ? search["benefits"] : undefined,
      audience: typeof search["audience"] === "string" ? search["audience"] : undefined,
      problems: typeof search["problems"] === "string" ? search["problems"] : undefined,
      objections: typeof search["objections"] === "string" ? search["objections"] : undefined,
      setting: typeof search["setting"] === "string" ? search["setting"] : undefined,
      character: typeof search["character"] === "string" ? search["character"] : undefined,
      tone: typeof search["tone"] === "string" ? search["tone"] : undefined,
      duration: typeof search["duration"] === "string" ? search["duration"] : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Novo roteiro — Tik Supremo" }] }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const { user } = Route.useRouteContext();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<ProductSuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsPending, setSuggestionsPending] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [labelImages, setLabelImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [progress, setProgress] = useState("Preparando...");
  const [lastImportedUrl, setLastImportedUrl] = useState("");
  const [avatars, setAvatars] = useState<AvatarWithPreview[]>([]);
  const [libraryProducts, setLibraryProducts] = useState<ProductLibraryWithPreview[]>([]);
  const [selectedLibraryProductId, setSelectedLibraryProductId] = useState<string | null>(null);
  const [saveProductToLibrary, setSaveProductToLibrary] = useState(true);
  const [movements, setMovements] = useState<MovementPreset[]>([]);
  const [selectedMovementIds, setSelectedMovementIds] = useState<string[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [selectedStylePreset, setSelectedStylePreset] = useState<string>("Venda rápida");
  const [avatarMode, setAvatarMode] = useState<"none" | "library" | "upload" | "generate">("none");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState("");
  const [avatarDescription, setAvatarDescription] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<SelectedFormat | null>(null);
  const selectedAvatar = avatars.find((avatar) => avatar.id === selectedAvatarId) ?? null;
  const selectedLibraryProduct =
    libraryProducts.find((product) => product.id === selectedLibraryProductId) ?? null;
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: searchParams.projectName || "",
      productName: searchParams.productName || "",
      productUrl: "",
      category: "Beleza e cuidados pessoais",
      price: "",
      promotion: "",
      productVariation: "",
      commission: "",
      rating: "",
      reviewCount: "",
      knownSales: "",
      description: searchParams.description || searchParams.copy || "Produto inovador para o dia a dia",
      benefits: searchParams.benefits || "Praticidade, alta qualidade e economia de tempo",
      problems: searchParams.problems || "",
      objections: searchParams.objections || "",
      audience: searchParams.audience || "Público brasileiro interessado em solução prática e bom custo-benefício",
      competition: "",
      productNotes: "",
      copy: searchParams.copy || "",
      duration: searchParams.duration || "30",
      tone: searchParams.tone || "Natural, direto e curioso",
      character: searchParams.character || "Creator brasileiro autêntico",
      setting: searchParams.setting || "Ambiente doméstico bem iluminado",
      recordingStyle: "UGC com câmera de celular",
      objective: "Conversão para TikTok Shop",
      variations: "3",
      sceneCount: "4",
      videoFormat: "UGC",
      apparentAge: "",
      outfit: "",
      appearance: "",
      characterEnergy: "",
      voiceSpeed: "Normal",
      bottleHand: "",
      rotateBottle: "",
      bringBottleClose: "",
      bottleClosed: "",
      continuity: "",
      sameCamera: "",
      cleanScreen: "Sim",
      finalCta: "",
      requiredInformation: "",
      forbiddenWords: "",
      modularVariations: false,
      notes: "",
    },
  });
  useEffect(() => {
    let active = true;
    const loadLibraries = async () => {
      const [avatarResult, productResult, movementResult] = await Promise.allSettled([
        listAvatarLibrary(user.id),
        listProductLibrary(),
        listMovementLibrary(),
      ]);
      if (!active) return;
      if (avatarResult.status === "fulfilled") setAvatars(avatarResult.value);
      if (productResult.status === "fulfilled") setLibraryProducts(productResult.value);
      if (movementResult.status === "fulfilled") setMovements(movementResult.value);
    };
    void loadLibraries();
    return () => {
      active = false;
    };
  }, [user.id]);
  const productImportMutation = useMutation({
    mutationFn: (url: string) => importProductFromUrl({ data: { url } }),
    onSuccess: (data) => {
      setValue("productName", data.name, { shouldValidate: true });
      if (data.description) setValue("description", data.description, { shouldValidate: true });
      if (data.price) setValue("price", data.price);
      if (data.category) setValue("category", data.category);
      setLastImportedUrl(data.sourceUrl);
      toast.success("Dados públicos do produto preenchidos.");
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Não foi possível importar o produto."),
  });
  const uploadAvatarMutation = useMutation({
    mutationFn: async () => {
      if (!avatarFile) throw new Error("Escolha a foto do avatar.");
      if (avatarName.trim().length < 2) throw new Error("Dê um nome ao avatar.");
      const supabase = getSupabaseBrowserClient();
      const imagePath = `${user.id}/avatars/uploaded/${crypto.randomUUID()}-${safeName(avatarFile.name)}`;
      const upload = await supabase.storage
        .from("product-images")
        .upload(imagePath, avatarFile, { contentType: avatarFile.type, upsert: false });
      if (upload.error) throw new Error(`Falha ao enviar o avatar: ${upload.error.message}`);
      const result = await supabase
        .from("avatars")
        .insert({
          user_id: user.id,
          name: avatarName.trim(),
          description: avatarDescription.trim(),
          image_path: imagePath,
          source: "upload",
          generation_prompt: null,
          metadata: {
            reference_purpose: "ugc_video_identity_anchor",
          },
        })
        .select(
          "id,user_id,name,description,image_path,source,generation_prompt,metadata,created_at,updated_at",
        )
        .single();
      if (result.error || !result.data) {
        await supabase.storage.from("product-images").remove([imagePath]);
        throw new Error("A foto foi enviada, mas o avatar não pôde ser salvo.");
      }
      const signed = await supabase.storage
        .from("product-images")
        .createSignedUrl(imagePath, 3_600);
      const { formatSupabaseUrl } = await import("@/features/libraries/queries");
      const previewUrl =
        formatSupabaseUrl(signed.data?.signedUrl) ??
        formatSupabaseUrl(supabase.storage.from("product-images").getPublicUrl(imagePath).data?.publicUrl) ??
        null;
      return { ...(result.data as Avatar), previewUrl };
    },




    onSuccess: (avatar) => {
      setAvatars((current) => [avatar, ...current]);
      setSelectedAvatarId(avatar.id);
      setAvatarMode("library");
      setAvatarFile(null);
      toast.success("Avatar salvo e selecionado.");
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Não foi possível salvar o avatar."),
  });
  const generateAvatarMutation = useMutation({
    mutationFn: () =>
      generateAvatarImage({
        data: { name: avatarName.trim(), description: avatarDescription.trim() },
      }),
    onSuccess: (avatar) => {
      const complete = avatar as AvatarWithPreview;
      setAvatars((current) => [complete, ...current]);
      setSelectedAvatarId(complete.id);
      setAvatarMode("library");
      toast.success("Avatar criado com FLUX, salvo e selecionado.");
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Não foi possível criar o avatar."),
  });
  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      setProgress("Criando o projeto...");
      if (
        !values.copy.trim() &&
        !video &&
        !images.length &&
        !labelImages.length &&
        !selectedLibraryProduct?.image_paths.length
      ) {
        throw new Error(
          "Adicione uma foto do produto, uma copy, um vídeo ou combine essas referências.",
        );
      }
      const supabase = getSupabaseBrowserClient();
      const projectInsert = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: buildProjectName(values.projectName, values.productName),
          status: "draft",
          settings: {
            duration_seconds: Number(values.duration),
            tone: values.tone,
            character: values.character,
            setting: values.setting,
            recording_style: values.recordingStyle,
            objective: values.objective,
            variations: Number(values.variations),
            scene_count: Math.max(1, Number(values.sceneCount) || 4),
            video_format: values.videoFormat,
            promotion: values.promotion,
            product_variation: values.productVariation,
            apparent_age: values.apparentAge,
            outfit: values.outfit,
            appearance: values.appearance,
            character_energy: values.characterEnergy,
            voice_speed: values.voiceSpeed,
            bottle_hand: values.bottleHand,
            rotate_bottle: values.rotateBottle,
            bring_bottle_close: values.bringBottleClose,
            bottle_closed: values.bottleClosed,
            continuity: values.continuity,
            same_camera: values.sameCamera,
            clean_screen: values.cleanScreen,
            final_cta: values.finalCta,
            required_information: values.requiredInformation,
            forbidden_words: values.forbiddenWords,
            modular_variations: values.modularVariations,
            avatar_id: selectedAvatarId,
            movement_ids: selectedMovementIds,
            notes: values.notes,
            script_format: selectedFormat ?? null,

          },
        })
        .select("id")
        .single();
      if (projectInsert.error || !projectInsert.data)
        throw new Error(
          `Não foi possível criar o projeto: ${projectInsert.error?.message ?? "erro desconhecido"}`,
        );
      const projectId = projectInsert.data.id as string;
      const imagePaths: string[] = [...(selectedLibraryProduct?.image_paths ?? [])];
      const labelImagePaths: string[] = Array.isArray(
        selectedLibraryProduct?.raw_data?.["label_image_paths"],
      )
        ? (selectedLibraryProduct.raw_data["label_image_paths"] as string[])
        : [];
      if (images.length) setProgress("Enviando fotos do produto...");
      for (const [index, file] of images.entries()) {
        const path = `${user.id}/${projectId}/${crypto.randomUUID()}-${index}-${safeName(file.name)}`;
        const upload = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upload.error) throw new Error(`Falha ao enviar ${file.name}: ${upload.error.message}`);
        imagePaths.push(path);
      }
      for (const [index, file] of labelImages.entries()) {
        const path = `${user.id}/${projectId}/label/${crypto.randomUUID()}-${index}-${safeName(file.name)}`;
        const upload = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upload.error)
          throw new Error(`Falha ao enviar o rótulo ${file.name}: ${upload.error.message}`);
        imagePaths.push(path);
        labelImagePaths.push(path);
      }
      setProgress("Salvando informações do produto...");
      const productRawData = {
        source: selectedLibraryProductId ? "library" : "manual",
        trend_data_available: false,
        promotion: values.promotion,
        product_variation: values.productVariation,
        label_image_paths: labelImagePaths,
      };
      let libraryProductId = selectedLibraryProductId;
      const reusableProduct = {
        user_id: user.id,
        name: values.productName,
        product_url: values.productUrl || null,
        category: values.category,
        price: nullableNumber(values.price),
        commission_rate: nullableNumber(values.commission),
        rating: nullableNumber(values.rating),
        review_count: nullableNumber(values.reviewCount),
        known_sales: nullableNumber(values.knownSales),
        description: values.description,
        benefits: list(values.benefits),
        problems_solved: list(values.problems),
        objections: list(values.objections),
        target_audience: values.audience,
        perceived_competition: values.competition || null,
        notes: values.productNotes || null,
        image_paths: imagePaths,
        raw_data: productRawData,
      };
      if (selectedLibraryProduct) {
        await supabase
          .from("product_library")
          .update({
            ...reusableProduct,
            usage_count: selectedLibraryProduct.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", selectedLibraryProduct.id)
          .eq("user_id", user.id);
      } else if (saveProductToLibrary) {
        const savedLibraryProduct = await supabase
          .from("product_library")
          .insert({ ...reusableProduct, usage_count: 1, last_used_at: new Date().toISOString() })
          .select("id")
          .single();
        if (savedLibraryProduct.error || !savedLibraryProduct.data) {
          throw new Error("O projeto foi iniciado, mas o produto não pôde entrar na biblioteca.");
        }
        libraryProductId = savedLibraryProduct.data.id as string;
      }
      const product = await supabase.from("products").insert({
        project_id: projectId,
        user_id: user.id,
        library_product_id: libraryProductId,
        name: values.productName,
        product_url: values.productUrl || null,
        category: values.category,
        price: nullableNumber(values.price),
        commission_rate: nullableNumber(values.commission),
        rating: nullableNumber(values.rating),
        review_count: nullableNumber(values.reviewCount),
        known_sales: nullableNumber(values.knownSales),
        description: values.description,
        benefits: list(values.benefits),
        problems_solved: list(values.problems),
        objections: list(values.objections),
        target_audience: values.audience,
        perceived_competition: values.competition || null,
        notes: values.productNotes || null,
        image_paths: imagePaths,
        raw_data: productRawData,
      });
      if (product.error) throw new Error(`Falha ao salvar o produto: ${product.error.message}`);
      if (values.copy.trim()) {
        const copyInsert = await supabase.from("copies").insert({
          project_id: projectId,
          user_id: user.id,
          content: values.copy.trim(),
          source_type: "validated_copy",
        });
        if (copyInsert.error)
          throw new Error(`Falha ao salvar a copy: ${copyInsert.error.message}`);
      }
      if (video) {
        setProgress("Enviando vídeo de referência...");
        const videoPath = `${user.id}/${projectId}/${crypto.randomUUID()}-${safeName(video.name)}`;
        const upload = await supabase.storage
          .from("reference-videos")
          .upload(videoPath, video, { contentType: video.type, upsert: false });
        if (upload.error) throw new Error(`Falha no vídeo: ${upload.error.message}`);
        setProgress("Extraindo amostras visuais...");
        const frames = await extractVideoFrames(video);
        const framePaths: string[] = [];
        for (const [index, frame] of frames.entries()) {
          const path = `${user.id}/${projectId}/frames/${crypto.randomUUID()}-${index}.jpg`;
          const frameUpload = await supabase.storage
            .from("project-files")
            .upload(path, frame, { contentType: "image/jpeg" });
          if (!frameUpload.error) framePaths.push(path);
        }
        const videoInsert = await supabase.from("reference_videos").insert({
          project_id: projectId,
          user_id: user.id,
          storage_path: videoPath,
          original_filename: video.name,
          duration_seconds: null,
          processing_status: "pending",
          analysis: { frame_paths: framePaths, sampling_method: "browser_even_intervals" },
        });
        if (videoInsert.error)
          throw new Error(`Falha ao registrar o vídeo: ${videoInsert.error.message}`);
      }
      const count = values.modularVariations
        ? 1
        : Math.min(6, Math.max(1, Number(values.variations) || 3));
      for (let i = 0; i < count; i++) {
        setProgress(`Analisando e gerando versão ${i + 1} de ${count}...`);
        await generateProjectScript({ data: { projectId } });
      }
      return projectId;
    },
    onSuccess: async (projectId) => {
      toast.success("Projeto e roteiro salvos.");
      await navigate({ to: "/projects/$projectId", params: { projectId } });
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Não foi possível concluir."),
  });
  const next = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      0: ["productName", "description", "benefits"],
      1: [],
      2: [], // Format step — selectedFormat is validated separately
      3: [
        "duration",
        "tone",
        "character",
        "setting",
        "recordingStyle",
        "objective",
        "variations",
        "sceneCount",
        "videoFormat",
      ],
    };
    // Step 2: format selection — warn but don't block
    if (step === 2 && !selectedFormat) {
      toast.warning("Escolha um formato de vídeo antes de continuar, ou pule esta etapa.", {
        action: { label: "Pular", onClick: () => setStep((v) => Math.min(4, v + 1)) },
      });
      return;
    }
    if (await trigger(fields[step] ?? [])) setStep((v) => Math.min(4, v + 1));
  };
  const productUrlField = register("productUrl");
  const tryImportProduct = (url: string) => {
    const normalized = url.trim();
    if (!normalized || normalized === lastImportedUrl || productImportMutation.isPending) return;
    try {
      const host = new URL(normalized).hostname.toLowerCase();
      if (
        host === "tiktok.com" ||
        host.endsWith(".tiktok.com") ||
        host === "kalodata.com" ||
        host.endsWith(".kalodata.com")
      ) {
        productImportMutation.mutate(normalized);
      }
    } catch {
      // A validação normal do formulário orientará o usuário.
    }
  };
  const selectLibraryProduct = (id: string) => {
    const product = libraryProducts.find((item) => item.id === id);
    if (!product) return;
    setSelectedLibraryProductId(product.id);
    setImages([]);
    setLabelImages([]);
    setValue("productName", product.name, { shouldValidate: true });
    setValue("productUrl", product.product_url ?? "");
    setValue("category", product.category);
    setValue("price", product.price === null ? "" : String(product.price));
    setValue("commission", product.commission_rate === null ? "" : String(product.commission_rate));
    setValue("rating", product.rating === null ? "" : String(product.rating));
    setValue("reviewCount", product.review_count === null ? "" : String(product.review_count));
    setValue("knownSales", product.known_sales === null ? "" : String(product.known_sales));
    setValue("description", product.description, { shouldValidate: true });
    setValue("benefits", product.benefits.join("\n"), { shouldValidate: true });
    setValue("problems", product.problems_solved.join("\n"));
    setValue("objections", product.objections.join("\n"));
    setValue("audience", product.target_audience, { shouldValidate: true });
    setValue("competition", product.perceived_competition ?? "");
    setValue("productNotes", product.notes ?? "");
    const raw = product.raw_data ?? {};
    setValue("promotion", typeof raw["promotion"] === "string" ? raw["promotion"] : "");
    setValue(
      "productVariation",
      typeof raw["product_variation"] === "string" ? raw["product_variation"] : "",
    );
    toast.success(`${product.name} carregado da biblioteca.`);
  };
  const toggleMovement = (id: string) => {
    setSelectedMovementIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-6),
    );
  };
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">
      <header className="bento-hero p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Novo projeto
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Criar roteiro</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Produto + referência → análise → roteiro → prompts Veo → Supabase.
        </p>
      </header>
      <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-card p-1.5">
        {steps.map((label, index) => (
          <div
            key={label}
            className={`rounded-lg px-2 py-2.5 text-center text-xs font-medium transition-colors ${index === step ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="bento-card space-y-6 p-5 md:p-8"
      >
        {step === 0 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
              <p className="text-sm font-semibold text-primary">Modo rápido</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Preencha só o essencial. O nome do projeto, público e configuração já têm valores
                inteligentes.
              </p>
            </div>
            {libraryProducts.length > 0 && (
              <section className="rounded-2xl border border-border bg-secondary/15 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <PackageCheck className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold">Usar produto da biblioteca</h2>
                      <p className="text-xs text-muted-foreground">
                        Preenche dados, fotos e análise já existente.
                      </p>
                    </div>
                  </div>
                  {selectedLibraryProductId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLibraryProductId(null)}
                    >
                      Cadastrar outro produto
                    </Button>
                  )}
                </div>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {libraryProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => selectLibraryProduct(product.id)}
                      className={`flex min-w-56 items-center gap-3 rounded-xl border p-3 text-left transition ${selectedLibraryProductId === product.id ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:border-primary/30"}`}
                    >
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {product.previewUrl ? (
                          <img
                            src={product.previewUrl}
                            alt={product.name}
                            crossOrigin="anonymous"
                            className="size-full object-cover"
                          />

                        ) : (
                          <PackageCheck className="m-3 size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        <p className="mt-1 truncate text-[11px] text-muted-foreground">
                          {product.category} · {product.usage_count} uso(s)
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Qual é o produto?" error={errors.productName?.message}>
                <div className="flex gap-2">
                  <Input placeholder="Ex.: escova secadora 5 em 1" {...register("productName")} />
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    disabled={suggestionsPending || watch("productName").trim().length < 2}
                    onClick={async () => {
                      const name = watch("productName").trim();
                      if (name.length < 2) return;
                      setSuggestionsPending(true);
                      setShowSuggestions(false);
                      try {
                        const result = await suggestProductFields({ data: { productName: name } });
                        setAiSuggestions(result);
                        setShowSuggestions(true);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Não foi possível gerar sugestões.");
                      } finally {
                        setSuggestionsPending(false);
                      }
                    }}
                    className="shrink-0 gap-1.5"
                  >
                    {suggestionsPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    <span className="hidden sm:inline">{suggestionsPending ? "Analisando..." : "Sugerir"}</span>
                  </Button>
                </div>
                {suggestionsPending && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                    <Sparkles className="size-3 animate-pulse" />
                    Gemini está analisando o produto...
                  </p>
                )}
              </Field>
              {showSuggestions && aiSuggestions && (
                <div className="md:col-span-2">
                  <AiSuggestionsPanel
                    suggestions={aiSuggestions}
                    onApplyAll={() => {
                      setValue("description", aiSuggestions.description, { shouldValidate: true });
                      setValue("benefits", aiSuggestions.benefits.join("\n"), { shouldValidate: true });
                      setValue("problems", aiSuggestions.problems.join("\n"));
                      setValue("objections", aiSuggestions.objections.join("\n"));
                      setValue("audience", aiSuggestions.audience, { shouldValidate: true });
                      if (aiSuggestions.category) setValue("category", aiSuggestions.category);
                      setShowSuggestions(false);
                      toast.success("Sugestões aplicadas! Revise e ajuste conforme necessário.");
                    }}
                    onApplyField={(field, value) => {
                      if (field === "description") setValue("description", value, { shouldValidate: true });
                      if (field === "benefits") setValue("benefits", value, { shouldValidate: true });
                      if (field === "problems") setValue("problems", value);
                      if (field === "objections") setValue("objections", value);
                      if (field === "audience") setValue("audience", value, { shouldValidate: true });
                      if (field === "category") setValue("category", value);
                    }}
                    onClose={() => setShowSuggestions(false)}
                  />
                </div>
              )}
              <Field label="Link do produto (opcional)">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="TikTok Shop ou Kalodata"
                    {...productUrlField}
                    onBlur={(event) => {
                      void productUrlField.onBlur(event);
                      tryImportProduct(event.target.value);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!watch("productUrl").trim() || productImportMutation.isPending}
                    onClick={() => tryImportProduct(watch("productUrl"))}
                  >
                    {productImportMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Search />
                    )}
                    <span className="hidden sm:inline">Puxar dados</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Preenche automaticamente os dados públicos disponíveis. Páginas privadas do
                  Kalodata exigem integração autorizada.
                </p>
              </Field>
              <Field label="Cole a descrição do produto" error={errors.description?.message} wide>
                <Textarea
                  rows={5}
                  placeholder="Pode colar a descrição do anúncio ou escrever do seu jeito. Não precisa organizar."
                  {...register("description")}
                />
              </Field>
              <Field label="Principais benefícios" error={errors.benefits?.message}>
                <Textarea
                  rows={4}
                  placeholder="Ex.: seca rápido, reduz frizz, fácil de usar"
                  {...register("benefits")}
                />
              </Field>
              <Field label="Fotos do produto">
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files ?? []))}
                />
                <p className="text-xs text-muted-foreground">
                  {images.length
                    ? `${images.length} foto(s) selecionada(s). A IA vai analisar tipo de produto, cores, material aparente, formato, estampa, acabamento e regras de preservação.`
                    : selectedLibraryProduct?.image_paths.length
                      ? `${selectedLibraryProduct.image_paths.length} foto(s) reutilizada(s) da biblioteca. Você pode adicionar novas fotos.`
                      : "Opcional, mas recomendado. Use fotos nítidas da frente, verso e detalhes."}
                </p>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {images.slice(0, 6).map((file) => (
                      <FilePreview
                        key={`${file.name}-${file.lastModified}`}
                        file={file}
                        alt={file.name}
                      />
                    ))}
                  </div>
                )}
              </Field>
            </div>
            {!selectedLibraryProductId && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/15 p-4">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4"
                  checked={saveProductToLibrary}
                  onChange={(event) => setSaveProductToLibrary(event.target.checked)}
                />
                <span>
                  <strong className="block text-sm">Salvar este produto na biblioteca</strong>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Deixa dados, fotos e análise disponíveis para os próximos roteiros.
                  </span>
                </span>
              </label>
            )}
            <details className="group rounded-xl border border-border bg-secondary/20 p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Adicionar detalhes avançados{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </summary>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Nome personalizado do projeto">
                  <Input
                    placeholder="Gerado automaticamente se ficar vazio"
                    {...register("projectName")}
                  />
                </Field>
                <Field label="Categoria">
                  <Input {...register("category")} />
                </Field>
                <Field label="Preço">
                  <Input inputMode="decimal" {...register("price")} />
                </Field>
                <Field label="Desconto ou promoção">
                  <Input placeholder="Ex.: 20% OFF ou leve 3, pague 2" {...register("promotion")} />
                </Field>
                <Field label="Variação mostrada no vídeo">
                  <Input
                    placeholder="Ex.: frasco com 60, 90 ou 120 cápsulas"
                    {...register("productVariation")}
                  />
                </Field>
                <Field label="Comissão %">
                  <Input inputMode="decimal" {...register("commission")} />
                </Field>
                <Field label="Avaliação">
                  <Input inputMode="decimal" {...register("rating")} />
                </Field>
                <Field label="Quantidade de avaliações">
                  <Input inputMode="numeric" {...register("reviewCount")} />
                </Field>
                <Field label="Vendas conhecidas">
                  <Input inputMode="numeric" {...register("knownSales")} />
                </Field>
                <Field label="Concorrência percebida">
                  <Input {...register("competition")} />
                </Field>
                <Field label="Problemas que resolve">
                  <Textarea rows={4} {...register("problems")} />
                </Field>
                <Field label="Objeções do comprador">
                  <Textarea rows={4} {...register("objections")} />
                </Field>
                <Field label="Público-alvo">
                  <Textarea rows={4} {...register("audience")} />
                </Field>
                <Field label="Outras observações">
                  <Textarea rows={4} {...register("productNotes")} />
                </Field>
                <Field label="Foto legível do verso do rótulo" wide>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => setLabelImages(Array.from(event.target.files ?? []))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Ajuda a mencionar composição, modo de uso e informações realmente
                    presentes no rótulo.
                  </p>
                </Field>
              </div>
            </details>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Copy validada">
              <Textarea
                rows={16}
                placeholder="Cole aqui a copy que já funciona..."
                {...register("copy")}
              />
            </Field>
            <Field label="Vídeo de referência">
              <div className="rounded-xl border border-dashed border-border bg-secondary/15 p-6">
                <Upload className="mb-3 text-primary" />
                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  {video
                    ? video.name
                    : "Opcional. Você pode gerar usando as fotos do produto, uma copy, um vídeo ou combinar tudo."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Frames serão amostrados no navegador; áudio e texto serão processados no backend.
                </p>
              </div>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <FormatStepSelector
              category={watch("category")}
              description={watch("description")}
              benefits={watch("benefits")}
              audience={watch("audience")}
              price={watch("price") ? Number(watch("price").replace(",", ".")) : null}
              productVariation={watch("productVariation")}
              value={selectedFormat}
              onChange={setSelectedFormat}
              hasPhysicalProduct={false}
              realPersonAvailable={false}
            />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Escolha um estilo pronto</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Você pode continuar sem mudar nada.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <PresetButton
                  title="Venda rápida"
                  description="30s, direto e curioso"
                  active={selectedStylePreset === "Venda rápida"}
                  onClick={() => {
                    setSelectedStylePreset("Venda rápida");
                    setValue("duration", "30");
                    setValue("tone", "Natural, direto e curioso");
                    setValue("recordingStyle", "UGC com câmera de celular");
                  }}
                />
                <PresetButton
                  title="Demonstração"
                  description="45s, mostra o produto em uso"
                  active={selectedStylePreset === "Demonstração"}
                  onClick={() => {
                    setSelectedStylePreset("Demonstração");
                    setValue("duration", "45");
                    setValue("tone", "Didático, espontâneo e convincente");
                    setValue("recordingStyle", "Demonstração prática em cortes rápidos");
                  }}
                />
                <PresetButton
                  title="Prova social"
                  description="35s, experiência pessoal"
                  active={selectedStylePreset === "Prova social"}
                  onClick={() => {
                    setSelectedStylePreset("Prova social");
                    setValue("duration", "35");
                    setValue("tone", "Depoimento natural e entusiasmado");
                    setValue("recordingStyle", "UGC em primeira pessoa com antes e depois");
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Formato do vídeo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Isso muda personagem, câmera, mãos e toda a construção do prompt.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <PresetButton
                  title="UGC"
                  description="Creator aparece e fala diretamente para a câmera"
                  active={watch("videoFormat") === "UGC"}
                  onClick={() => {
                    setValue("videoFormat", "UGC");
                    setValue("recordingStyle", "UGC com câmera de celular");
                  }}
                />
                <PresetButton
                  title="POV"
                  description="A câmera representa os olhos e as mãos da pessoa"
                  active={watch("videoFormat") === "POV"}
                  onClick={() => {
                    setValue("videoFormat", "POV");
                    setValue("recordingStyle", "POV em primeira pessoa");
                  }}
                />
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-border bg-secondary/15">
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">Avatar de referência</h2>
                    <p className="text-xs text-muted-foreground">
                      Opcional. O avatar escolhido será preservado em todas as cenas UGC.
                    </p>
                  </div>
                </div>
                {selectedAvatar && (
                  <div className="text-right">
                    <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-400">
                      <Check className="size-4" /> {selectedAvatar.name}
                    </span>
                    <p className="mt-1 max-w-64 text-[10px] text-muted-foreground">
                      Use esta mesma foto como referência ao gerar cada cena no VEO.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
                <AvatarModeButton
                  active={avatarMode === "none"}
                  icon={<UserRound />}
                  label="Sem avatar"
                  onClick={() => {
                    setAvatarMode("none");
                    setSelectedAvatarId(null);
                  }}
                />
                <AvatarModeButton
                  active={avatarMode === "library"}
                  icon={<Check />}
                  label="Meus avatares"
                  onClick={() => setAvatarMode("library")}
                />
                <AvatarModeButton
                  active={avatarMode === "upload"}
                  icon={<ImagePlus />}
                  label="Enviar avatar"
                  onClick={() => setAvatarMode("upload")}
                />
                <AvatarModeButton
                  active={avatarMode === "generate"}
                  icon={<Sparkles />}
                  label="Gerar com FLUX"
                  onClick={() => setAvatarMode("generate")}
                />
              </div>

              {avatarMode === "library" && (
                <div className="border-t border-border p-4">
                  {avatars.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatarId(avatar.id)}
                          className={`overflow-hidden rounded-xl border text-left transition ${selectedAvatarId === avatar.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/35"}`}
                        >
                          <div className="aspect-[4/5] bg-secondary">
                            {avatar.previewUrl ? (
                              <img
                                src={avatar.previewUrl}
                                alt={avatar.name}
                                crossOrigin="anonymous"
                                className="size-full object-cover"
                              />

                            ) : (
                              <div className="flex size-full items-center justify-center text-muted-foreground">
                                <UserRound />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="truncate text-sm font-semibold">{avatar.name}</p>
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                              {avatar.description || "Avatar enviado pelo usuário"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                      Sua biblioteca está vazia. Envie uma foto ou gere um avatar com FLUX.
                    </p>
                  )}
                </div>
              )}

              {(avatarMode === "upload" || avatarMode === "generate") && (
                <div className="grid gap-5 border-t border-border p-4 md:grid-cols-[180px_1fr]">
                  <div className="overflow-hidden rounded-xl border border-dashed border-border bg-background/30">
                    {avatarMode === "upload" && avatarFile ? (
                      <FilePreview file={avatarFile} alt="Prévia do avatar" tall />
                    ) : (
                      <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                        {avatarMode === "generate" ? <Sparkles /> : <ImagePlus />}
                        <span className="max-w-28 text-[11px]">
                          {avatarMode === "generate"
                            ? "O avatar aparecerá na biblioteca"
                            : "Prévia da foto"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Field label="Nome do avatar">
                      <Input
                        value={avatarName}
                        maxLength={100}
                        placeholder="Ex.: Marina UGC"
                        onChange={(event) => setAvatarName(event.target.value)}
                      />
                    </Field>
                    <Field
                      label={
                        avatarMode === "generate"
                          ? "Como deve ser o avatar?"
                          : "Descrição visual ou observações"
                      }
                    >
                      <Textarea
                        rows={4}
                        value={avatarDescription}
                        placeholder={
                          avatarMode === "generate"
                            ? "Ex.: mulher brasileira adulta, cabelo cacheado castanho, camiseta branca lisa, aparência natural e confiante, em um quarto bem iluminado"
                            : "Ex.: manter cabelo, rosto, camiseta e acessórios exatamente como na foto"
                        }
                        onChange={(event) => setAvatarDescription(event.target.value)}
                      />
                    </Field>
                    {avatarMode === "upload" ? (
                      <>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            uploadAvatarMutation.isPending ||
                            !avatarFile ||
                            avatarName.trim().length < 2
                          }
                          onClick={() => uploadAvatarMutation.mutate()}
                        >
                          {uploadAvatarMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Upload />
                          )}
                          Salvar na biblioteca
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs leading-5 text-muted-foreground">
                          O FLUX Schnell usa a franquia gratuita diária do Cloudflare Workers AI e
                          salva a imagem automaticamente na sua biblioteca.
                        </p>
                        <Button
                          type="button"
                          variant="hero"
                          disabled={
                            generateAvatarMutation.isPending ||
                            avatarName.trim().length < 2 ||
                            avatarDescription.trim().length < 20
                          }
                          onClick={() => generateAvatarMutation.mutate()}
                        >
                          {generateAvatarMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Sparkles />
                          )}
                          {generateAvatarMutation.isPending
                            ? "Criando avatar..."
                            : "Gerar e salvar avatar"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-secondary/15">
              <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                    <PersonStanding className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">Poses e movimentos</h2>
                    <p className="text-xs text-muted-foreground">
                      Opcional. Escolha até 6 direções para a IA distribuir entre cenas e versões.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedMovementIds.length}/6
                </span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {movements
                  .filter((movement) => {
                    const currentFormat = (watch("videoFormat") || "").toUpperCase();
                    if (!currentFormat) return true;
                    return movement.formats.some((f) =>
                      f.toUpperCase().includes(currentFormat) || currentFormat.includes(f.toUpperCase()) || f === "UGC"
                    );
                  })
                  .map((movement) => {
                    const selected = selectedMovementIds.includes(movement.id);
                    const productText = `${watch("category")} ${watch("productName")} ${watch("description")}`.toLowerCase();
                    const isFemaleClothing = /roupa|blusa|top|cropped|vestido|feminin|moda|saia|short|calça|look|sutiã|lingerie|alça/i.test(productText);
                    const isRecommended = isFemaleClothing && (
                      movement.id === "10000000-0000-4000-8000-000000000034" ||
                      movement.id === "10000000-0000-4000-8000-000000000035" ||
                      movement.name.includes("Puxando Alça") ||
                      movement.name.includes("Gira 45")
                    );

                    return (
                      <button
                        type="button"
                        key={movement.id}
                        onClick={() => toggleMovement(movement.id)}
                        className={`relative rounded-xl border p-4 text-left transition ${selected ? "border-cyan bg-cyan/[0.08] ring-1 ring-cyan/20" : "border-border bg-background/30 hover:border-cyan/30"}`}
                      >
                        {isRecommended && (
                          <span className="mb-2 inline-block rounded bg-cyan/20 px-2 py-0.5 text-[10px] font-semibold text-cyan">
                            Recomendado para Roupa Feminina
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{movement.name}</p>
                          {selected && <Check className="size-4 text-cyan" />}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                          {movement.description}
                        </p>
                      </button>
                    );
                  })}

              </div>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Duração aproximada (segundos)">
                <Input inputMode="numeric" {...register("duration")} />
              </Field>
              <Field label="Quantas versões?">
                <Input inputMode="numeric" min="1" max="6" {...register("variations")} />
                <p className="text-xs text-muted-foreground">Padrão: 3 versões no modo normal.</p>
              </Field>
              <Field label="Quantidade de cenas">
                <Input inputMode="numeric" min="1" max="8" {...register("sceneCount")} />
                <p className="text-xs text-muted-foreground">
                  Padrão: 4 cenas de exatamente 8 segundos.
                </p>
              </Field>
            </div>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-4">
              <input type="checkbox" className="mt-1 size-4" {...register("modularVariations")} />
              <span>
                <strong className="block text-sm text-foreground">
                  Gerar pacote modular de 48 vídeos
                </strong>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Cria 4 ganchos × 4 corpos × 3 CTAs em três ações separadas de IA. Cada combinação
                  terá 4 cenas de 8 segundos.
                </span>
              </span>
            </label>
            {(watch("modularVariations") || Number(watch("variations")) > 1) && (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Lightbulb className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Como conseguir um lote mais consistente
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                      <li>
                        Use o mesmo avatar e fotos nítidas do produto como âncoras de identidade.
                      </li>
                      <li>Mantenha uma ação principal por cena de 8 segundos.</li>
                      <li>
                        Varie gancho, argumento e CTA; preserve produto, cenário e identidade.
                      </li>
                      <li>
                        Para roupas, envie uma foto de corpo inteiro e outra aproximada da estampa
                        ou tecido.
                      </li>
                      <li>
                        Faça primeiro poucas versões para validar a direção e depois expanda o lote
                        modular.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <details className="rounded-xl border border-border bg-secondary/20 p-4">
              <summary className="cursor-pointer font-medium">
                Personalizar direção criativa
              </summary>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Tom de voz">
                  <Input {...register("tone")} />
                </Field>
                <Field label="Tipo de personagem">
                  <Input {...register("character")} />
                </Field>
                <Field label="Cenário">
                  <Input
                    placeholder="Quarto, cozinha, sala, banheiro, academia..."
                    {...register("setting")}
                  />
                </Field>
                <Field label="Idade aparente da personagem">
                  <Input placeholder="Ex.: 30 a 35 anos" {...register("apparentAge")} />
                </Field>
                <Field label="Roupa">
                  <Input placeholder="Ex.: camiseta preta casual" {...register("outfit")} />
                </Field>
                <Field label="Cabelo e aparência">
                  <Input
                    placeholder="Ex.: cabelo curto, barba feita, aparência natural"
                    {...register("appearance")}
                  />
                </Field>
                <Field label="Energia da personagem">
                  <OptionSelect
                    field={register("characterEnergy")}
                    options={["", "Calma", "Espontânea", "Curiosa", "Indignada", "Empolgada"]}
                  />
                </Field>
                <Field label="Velocidade da voz">
                  <OptionSelect
                    field={register("voiceSpeed")}
                    options={["Normal", "Rápida", "Extremamente rápida"]}
                  />
                </Field>
                <Field label="Mão que segura o frasco">
                  <OptionSelect
                    field={register("bottleHand")}
                    options={["", "Direita", "Esquerda"]}
                  />
                </Field>
                <Field label="Pode girar o frasco para mostrar o rótulo?">
                  <OptionSelect field={register("rotateBottle")} options={["", "Sim", "Não"]} />
                </Field>
                <Field label="Pode aproximar o frasco da câmera?">
                  <OptionSelect field={register("bringBottleClose")} options={["", "Sim", "Não"]} />
                </Field>
                <Field label="O frasco deve permanecer fechado?">
                  <OptionSelect field={register("bottleClosed")} options={["", "Sim", "Não"]} />
                </Field>
                <Field label="As cenas precisam ter continuidade?">
                  <OptionSelect field={register("continuity")} options={["", "Sim", "Não"]} />
                </Field>
                <Field label="A câmera fica na mesma posição?">
                  <OptionSelect field={register("sameCamera")} options={["", "Sim", "Não"]} />
                </Field>
                <Field label="Tela completamente limpa?">
                  <OptionSelect field={register("cleanScreen")} options={["Sim", "Não"]} />
                </Field>
                <Field label="Estilo de gravação">
                  <Input {...register("recordingStyle")} />
                </Field>
                <Field label="Objetivo principal">
                  <Input {...register("objective")} />
                </Field>
                <Field label="CTA final">
                  <Input
                    placeholder="Abrir o carrinho, conferir opções ou aproveitar o desconto"
                    {...register("finalCta")}
                  />
                </Field>
                <Field label="Informações obrigatórias" wide>
                  <Textarea
                    rows={3}
                    placeholder="Feno-grego, arginina, boro, sem açúcar, sem lactose, quantidade de cápsulas..."
                    {...register("requiredInformation")}
                  />
                </Field>
                <Field label="Palavras ou promessas proibidas" wide>
                  <Textarea rows={3} {...register("forbiddenWords")} />
                </Field>
                <Field label="Observações adicionais">
                  <Textarea {...register("notes")} />
                </Field>
              </div>
            </details>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pronto para processar</h2>
            <p className="text-sm text-muted-foreground">
              Projeto:{" "}
              <strong className="text-foreground">
                {buildProjectName(watch("projectName"), watch("productName"))}
              </strong>
              . O sistema salvará os dados e arquivos, transcreverá o vídeo se houver, analisará as
              fotos reais do produto
              {selectedAvatar ? ` e usará o avatar ${selectedAvatar.name}` : ""}, analisará as
              referências e criará{" "}
              {watch("modularVariations")
                ? "um pacote modular com 48 combinações"
                : `${watch("variations")} versão(ões)`}
            </p>
            {selectedFormat && (
              <div className="rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3">
                <p className="text-xs font-medium text-primary">
                  Formato selecionado:{" "}
                  <span className="capitalize">{selectedFormat.formatId.replace(/_/g, " ")}</span>
                  {" — "}
                  <span className="text-muted-foreground">
                    {selectedFormat.choiceMode === "auto" ? "recomendado automaticamente" : "escolhido manualmente"}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || mutation.isPending}
            onClick={() => setStep((v) => v - 1)}
          >
            <ArrowLeft />
            Voltar
          </Button>
          {step < 4 ? (
            <Button type="button" variant="hero" onClick={next}>
              Continuar
              <ArrowRight />
            </Button>
          ) : (
            <Button type="submit" variant="hero" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {mutation.isPending ? progress : "Salvar e gerar"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function AvatarModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition [&_svg]:size-4 ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilePreview({ file, alt, tall = false }: { file: File; alt: string; tall?: boolean }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <img
      src={url}
      alt={alt}
      className={`${tall ? "aspect-[4/5]" : "aspect-square rounded-lg"} size-full object-cover`}
    />
  );
}

function Field({
  label,
  error,
  wide,
  children,
}: {
  label: string;
  error?: string | undefined;
  wide?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PresetButton({
  title,
  description,
  onClick,
  active = false,
}: {
  title: string;
  description: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
          : "border-border bg-secondary/20 hover:border-primary/40 hover:bg-primary/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-semibold ${active ? "text-primary" : "text-foreground"}`}>
          {title}
        </span>
        {active && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3" />
          </span>
        )}
      </div>
      <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

function OptionSelect({ field, options }: { field: UseFormRegisterReturn; options: string[] }) {
  return (
    <select
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
      {...field}
    >
      {options.map((option) => (
        <option key={option || "empty"} value={option}>
          {option || "Não definido"}
        </option>
      ))}
    </select>
  );
}

function AiSuggestionsPanel({
  suggestions,
  onApplyAll,
  onApplyField,
  onClose,
}: {
  suggestions: import("@/features/products/suggest-server").ProductSuggestions;
  onApplyAll: () => void;
  onApplyField: (field: string, value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.07] via-background to-primary/[0.04] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary/20 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Sugestões do Gemini</p>
            <p className="text-[11px] text-muted-foreground">
              Clique em "Aplicar" para preencher cada campo, ou use "Aplicar tudo"
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="hero"
            onClick={onApplyAll}
            className="gap-1.5 text-xs"
          >
            <Check className="size-3.5" />
            Aplicar tudo
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fechar sugestões"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Suggestion rows */}
      <div className="divide-y divide-border/50 px-5">
        {/* Description */}
        <SuggestionRow
          icon="📝"
          label="Descrição"
          onApply={() => onApplyField("description", suggestions.description)}
        >
          <p className="text-sm leading-6 text-foreground/90">{suggestions.description}</p>
        </SuggestionRow>

        {/* Benefits */}
        <SuggestionRow
          icon="✅"
          label="Benefícios"
          onApply={() => onApplyField("benefits", suggestions.benefits.join("\n"))}
        >
          <div className="flex flex-wrap gap-1.5">
            {suggestions.benefits.map((b) => (
              <span
                key={b}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
              >
                {b}
              </span>
            ))}
          </div>
        </SuggestionRow>

        {/* Problems */}
        <SuggestionRow
          icon="🎯"
          label="Problemas que resolve"
          onApply={() => onApplyField("problems", suggestions.problems.join("\n"))}
        >
          <div className="flex flex-wrap gap-1.5">
            {suggestions.problems.map((p) => (
              <span
                key={p}
                className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400"
              >
                {p}
              </span>
            ))}
          </div>
        </SuggestionRow>

        {/* Objections */}
        <SuggestionRow
          icon="🤔"
          label="Objeções do comprador"
          onApply={() => onApplyField("objections", suggestions.objections.join("\n"))}
        >
          <div className="flex flex-wrap gap-1.5">
            {suggestions.objections.map((o) => (
              <span
                key={o}
                className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400"
              >
                {o}
              </span>
            ))}
          </div>
        </SuggestionRow>

        {/* Audience */}
        <SuggestionRow
          icon="👥"
          label="Público-alvo"
          onApply={() => onApplyField("audience", suggestions.audience)}
        >
          <p className="text-sm leading-6 text-foreground/90">{suggestions.audience}</p>
        </SuggestionRow>

        {/* Category */}
        <SuggestionRow
          icon="🏷️"
          label="Categoria"
          onApply={() => onApplyField("category", suggestions.category)}
        >
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {suggestions.category}
          </span>
        </SuggestionRow>
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          💡 Sugestões geradas por IA com base no nome do produto. Revise antes de publicar.
        </p>
      </div>
    </div>
  );
}

function SuggestionRow({
  icon,
  label,
  children,
  onApply,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  onApply: () => void;
}) {
  return (
    <div className="flex items-start gap-4 py-3.5">
      <span className="mt-0.5 text-base leading-none">{icon}</span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {children}
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onApply}
        className="mt-0.5 shrink-0 gap-1 text-xs text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Check className="size-3" />
        Aplicar
      </Button>
    </div>
  );
}

