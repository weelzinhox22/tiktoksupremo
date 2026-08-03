import { createServerFn } from "@tanstack/react-start";
import { generationRequestSchema } from "./schemas";
import { rankDiverseCombinations } from "./diversity";

type CoherenceModule = {
  title: string;
  strategy: string;
  scenes: Array<{ spoken_text: string; veo_prompt: string }>;
};

function validateModularCoherence(
  hooks: CoherenceModule[],
  bodies: CoherenceModule[],
  ctas: CoherenceModule[],
) {
  const samples: Array<{
    number: number;
    label: string;
    spoken_script: string[];
    score: number;
    issues: string[];
  }> = [];
  const abruptStart =
    /^(isso|ele|ela|eles|elas|esse|essa|aí|daí|por isso|como eu (falei|disse))\b/i;
  const action = /(confira|veja|toque|clique|escolha|garanta|aproveite|abre|clica|olha|testa)/i;
  let number = 0;
  hooks.forEach((hook, hookIndex) =>
    bodies.forEach((body, bodyIndex) =>
      ctas.forEach((cta, ctaIndex) => {
        number += 1;
        const spokenScript = [hook.scenes[0], body.scenes[0], body.scenes[1], cta.scenes[0]].map(
          (scene) => scene?.spoken_text?.trim() ?? "",
        );
        const issues: string[] = [];
        if (spokenScript.some((text) => text.split(/\s+/).filter(Boolean).length < 3)) {
          issues.push("Há uma fala curta ou incompleta.");
        }
        if (spokenScript.slice(1).some((text) => abruptStart.test(text))) {
          issues.push("Uma fala começa com referência que pode ficar sem antecedente.");
        }
        if (new Set(spokenScript.map((text) => text.toLowerCase())).size !== spokenScript.length) {
          issues.push("Há falas repetidas na sequência.");
        }
        if (!action.test(spokenScript[3] ?? "")) {
          issues.push("O CTA não traz uma ação clara.");
        }
        const score = Math.max(0, 100 - issues.length * 18);
        samples.push({
          number,
          label: `Gancho ${hookIndex + 1} + Corpo ${bodyIndex + 1} + CTA ${ctaIndex + 1}`,
          spoken_script: spokenScript,
          score,
          issues,
        });
      }),
    ),
  );
  const automatedScore = samples.length
    ? Math.round(samples.reduce((sum, sample) => sum + sample.score, 0) / samples.length)
    : 0;
  const commonIssues = [...new Set(samples.flatMap((sample) => sample.issues))];
  return {
    status: "needs_user_review" as const,
    automated_score: automatedScore,
    passed: automatedScore >= 70,
    issues: commonIssues,
    sample: samples[0] ?? null,
    validated_combinations: samples.length,
  };
}

export const generateProjectScript = createServerFn({ method: "POST" })
  .validator(generationRequestSchema)
  .handler(async ({ data }) => {
    const [{ getSupabaseServerClient }, { getAIProvider }] = await Promise.all([
      import("@/lib/supabase/server"),
      import("@/lib/ai/factory"),
    ]);
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");
    const userId = auth.user.id;

    const [
      projectResult,
      productResult,
      copiesResult,
      videosResult,
      transcriptionsResult,
      copyLibraryResult,
      versionsResult,
      performanceResult,
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.projectId).eq("user_id", userId).single(),
      supabase
        .from("products")
        .select("*")
        .eq("project_id", data.projectId)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("copies")
        .select("*")
        .eq("project_id", data.projectId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("reference_videos")
        .select("*")
        .eq("project_id", data.projectId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("transcriptions")
        .select("id,original_filename,transcript,analysis")
        .eq("project_id", data.projectId)
        .eq("user_id", userId)
        .eq("processing_status", "completed")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("copy_library")
        .select("title,content,hook,body,cta,analysis,language_style,tags")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("script_generations")
        .select("version")
        .eq("project_id", data.projectId)
        .eq("user_id", userId)
        .order("version", { ascending: false })
        .limit(1),
      supabase
        .from("content_performance")
        .select("hook_index,body_index,cta_index,views,likes,shares,clicks,orders")
        .eq("project_id", data.projectId)
        .eq("user_id", userId),
    ]);
    if (projectResult.error || !projectResult.data)
      throw new Error("Projeto não encontrado ou sem permissão.");
    if (productResult.error || !productResult.data)
      throw new Error("Cadastre o produto antes de gerar.");
    const settings = projectResult.data.settings as Record<string, unknown>;
    const avatarId = typeof settings["avatar_id"] === "string" ? settings["avatar_id"] : null;
    const movementIds = Array.isArray(settings["movement_ids"])
      ? settings["movement_ids"].filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];
    const selectedMovements = movementIds.length
      ? await supabase
          .from("movement_library")
          .select("id,name,category,formats,description,prompt_instruction,movement_json,tags")
          .in("id", movementIds)
      : null;
    if (selectedMovements?.error) {
      throw new Error("As poses e movimentos selecionados não puderam ser carregados.");
    }
    const selectedAvatar = avatarId
      ? await supabase
          .from("avatars")
          .select("id,name,description,image_path,source,metadata")
          .eq("id", avatarId)
          .eq("user_id", userId)
          .maybeSingle()
      : null;
    if (avatarId && (selectedAvatar?.error || !selectedAvatar?.data)) {
      throw new Error("O avatar selecionado não está mais disponível na sua biblioteca.");
    }
    const copy = copiesResult.data?.[0] ?? null;
    const video = videosResult.data?.[0] ?? null;
    const standaloneTranscription = transcriptionsResult.data?.[0] ?? null;
    const hasProductImages =
      Array.isArray(productResult.data.image_paths) && productResult.data.image_paths.length > 0;
    if (!copy && !video && !standaloneTranscription && !hasProductImages) {
      throw new Error(
        "Adicione uma foto do produto, uma copy, um vídeo ou associe uma transcrição ao projeto.",
      );
    }
    const version = (versionsResult.data?.[0]?.version ?? 0) + 1;
    const rawScriptFormat = (settings["script_format"] ?? null) as {
      formatId?: string;
      choiceMode?: string;
      treadmillConfig?: unknown;
    } | null;
    const { getFormatById } = await import("@/features/script-formats/formats-data");
    const formatDef = rawScriptFormat?.formatId ? getFormatById(rawScriptFormat.formatId) : null;
    const selectedFormatData = formatDef
      ? {
          format_id: formatDef.id,
          name: formatDef.name,
          category: formatDef.category,
          full_description: formatDef.fullDescription,
          scene_structure: formatDef.sceneStructure,
          prompt_rules: formatDef.promptRules,
          negative_prompt_rules: formatDef.negativePromptRules,
          requires_real_product: formatDef.requiresRealProduct,
          requires_real_person: formatDef.requiresRealPerson,
          choice_mode: rawScriptFormat?.choiceMode ?? "auto",
          treadmill_config: rawScriptFormat?.treadmillConfig ?? null,
        }
      : null;

    const snapshot = {
      project: projectResult.data,
      product: productResult.data,
      selected_format: selectedFormatData,

      selected_avatar: selectedAvatar?.data
        ? {
            id: selectedAvatar.data.id,
            name: selectedAvatar.data.name,
            description: selectedAvatar.data.description,
            source: selectedAvatar.data.source,
            metadata: selectedAvatar.data.metadata,
            reference_image_available: true,
          }
        : null,
      selected_movements: selectedMovements?.data ?? [],
      copy: copy?.content ?? null,
      copy_library_examples: (copyLibraryResult.data ?? []).map((example) => ({
        title: example.title,
        hook: example.hook,
        body: example.body,
        cta: example.cta,
        analysis: example.analysis,
        language_style: example.language_style,
        tags: example.tags,
        reference_excerpt: example.content.slice(0, 1_200),
      })),
      transcription: standaloneTranscription
        ? {
            id: standaloneTranscription.id,
            filename: standaloneTranscription.original_filename,
            transcript: standaloneTranscription.transcript,
            analysis: standaloneTranscription.analysis,
          }
        : null,
      video: video
        ? { id: video.id, filename: video.original_filename, storage_path: video.storage_path }
        : null,
    };
    const { data: generation, error: generationError } = await supabase
      .from("script_generations")
      .insert({
        project_id: data.projectId,
        user_id: userId,
        version,
        status: "processing",
        input_snapshot: snapshot,
      })
      .select("id")
      .single();
    if (generationError || !generation) throw new Error("Não foi possível iniciar a geração.");
    await supabase
      .from("projects")
      .update({ status: "generating" })
      .eq("id", data.projectId)
      .eq("user_id", userId);

    try {
      const { name: providerName, provider } = getAIProvider();
      const productImagePaths = Array.isArray(productResult.data.image_paths)
        ? productResult.data.image_paths.filter(
            (value: unknown): value is string => typeof value === "string",
          )
        : [];
      const productImageAccess = productImagePaths.length
        ? await supabase.storage.from("product-images").createSignedUrls(productImagePaths, 900)
        : null;
      if (productImageAccess?.error) {
        throw new Error(
          "As fotos do produto foram salvas, mas não puderam ser abertas para análise.",
        );
      }
      const productImageUrls =
        productImageAccess?.data?.flatMap((item) => (item.signedUrl ? [item.signedUrl] : [])) ?? [];
      if (productImagePaths.length && productImageUrls.length === 0) {
        throw new Error("Nenhuma foto do produto pôde ser aberta para análise visual.");
      }
      const avatarImageAccess = selectedAvatar?.data
        ? await supabase.storage
            .from("product-images")
            .createSignedUrl(selectedAvatar.data.image_path, 900)
        : null;
      if (
        selectedAvatar?.data &&
        (avatarImageAccess?.error || !avatarImageAccess?.data?.signedUrl)
      ) {
        throw new Error("A foto do avatar selecionado não pôde ser aberta para análise.");
      }
      const storedProductAnalysis = (productResult.data.analysis ?? {}) as Record<string, unknown>;
      const cachedProductVisual =
        storedProductAnalysis["visual_reference"] &&
        typeof storedProductAnalysis["visual_reference"] === "object"
          ? (storedProductAnalysis["visual_reference"] as Record<string, unknown>)
          : null;
      const storedAvatarMetadata = (selectedAvatar?.data?.metadata ?? {}) as Record<
        string,
        unknown
      >;
      const cachedAvatarVisual =
        storedAvatarMetadata["visual_reference"] &&
        typeof storedAvatarMetadata["visual_reference"] === "object"
          ? (storedAvatarMetadata["visual_reference"] as Record<string, unknown>)
          : null;
      const productVisualAnalysis =
        cachedProductVisual ??
        (productImageUrls.length
          ? await provider.analyzeReferenceImages(productImageUrls, "product", {
              name: productResult.data.name,
              category: productResult.data.category,
              description: productResult.data.description,
              variation: settings["product_variation"],
              user_notes: productResult.data.notes,
            })
          : null);
      const avatarVisualAnalysis =
        cachedAvatarVisual ??
        (avatarImageAccess?.data?.signedUrl
          ? await provider.analyzeReferenceImages([avatarImageAccess.data.signedUrl], "avatar", {
              name: selectedAvatar?.data?.name,
              user_description: selectedAvatar?.data?.description,
              requested_character: settings["character"],
              requested_outfit: settings["outfit"],
            })
          : null);
      if (selectedAvatar?.data && avatarVisualAnalysis && !cachedAvatarVisual) {
        await supabase
          .from("avatars")
          .update({ metadata: { ...storedAvatarMetadata, visual_reference: avatarVisualAnalysis } })
          .eq("id", selectedAvatar.data.id)
          .eq("user_id", userId);
      }
      const enrichedSnapshot = {
        ...snapshot,
        product_visual_analysis: productVisualAnalysis,
        avatar_visual_analysis: avatarVisualAnalysis,
      };
      await supabase
        .from("script_generations")
        .update({ input_snapshot: enrichedSnapshot })
        .eq("id", generation.id)
        .eq("user_id", userId);
      let transcript = video?.transcription ?? standaloneTranscription?.transcript ?? "";
      let frameUrls: string[] = [];
      if (video) {
        await supabase
          .from("reference_videos")
          .update({ processing_status: "processing", processing_error: null })
          .eq("id", video.id)
          .eq("user_id", userId);
        if (!transcript) {
          if (provider.transcribeMediaUrl) {
            const signedVideo = await supabase.storage
              .from("reference-videos")
              .createSignedUrl(video.storage_path, 900);
            if (signedVideo.error || !signedVideo.data?.signedUrl) {
              throw new Error(
                `Falha ao criar acesso temporário ao vídeo: ${signedVideo.error?.message ?? "arquivo indisponível"}`,
              );
            }
            try {
              transcript = await provider.transcribeMediaUrl(signedVideo.data.signedUrl);
            } catch (urlError) {
              const downloaded = await supabase.storage
                .from("reference-videos")
                .download(video.storage_path);
              if (downloaded.error || !downloaded.data) throw urlError;
              if (downloaded.data.size > 25 * 1024 * 1024) {
                throw new Error(
                  "O Groq recusou a URL privada e o vídeo excede 25 MB para envio direto. Use um vídeo menor ou apenas a copy.",
                );
              }
              transcript = await provider.transcribeMedia(downloaded.data, video.original_filename);
            }
          } else {
            const downloaded = await supabase.storage
              .from("reference-videos")
              .download(video.storage_path);
            if (downloaded.error || !downloaded.data)
              throw new Error(
                `Falha ao abrir o vídeo: ${downloaded.error?.message ?? "arquivo indisponível"}`,
              );
            transcript = await provider.transcribeMedia(downloaded.data, video.original_filename);
          }
        }
        const paths = Array.isArray(video.analysis?.frame_paths)
          ? video.analysis.frame_paths.filter((v: unknown): v is string => typeof v === "string")
          : [];
        if (paths.length) {
          const signed = await supabase.storage.from("project-files").createSignedUrls(paths, 600);
          frameUrls =
            signed.data?.flatMap((item) => (item.signedUrl ? [item.signedUrl] : [])) ?? [];
        }
        await supabase
          .from("reference_videos")
          .update({
            transcription: transcript,
            processing_status: "completed",
            analysis: {
              ...(video.analysis ?? {}),
              frame_count: frameUrls.length,
              analysis_method: "browser_frame_sampling_plus_audio_transcription",
            },
          })
          .eq("id", video.id)
          .eq("user_id", userId);
      }
      const videoFrameAnalysis = frameUrls.length
        ? await provider.analyzeVideoFrames(frameUrls, transcript)
        : null;
      const result = await provider.generateScript({
        ...enrichedSnapshot,
        generation_variant_number: version,
        requested_variation_count: settings["variations"],
        variation_instruction:
          version > 1
            ? "Use a hook, sales angle, body development, visual action sequence and CTA materially different from previous versions while preserving verified product and avatar details."
            : "Establish the strongest first variation using the verified references.",
        transcript: transcript || null,
        sampled_frame_urls: frameUrls,
        video_frame_analysis: videoFrameAnalysis,
        ai_provider: providerName,
        video_analysis_limitations:
          video && frameUrls.length === 0
            ? "Sem frames amostrados; análise visual não disponível."
            : null,
      });
      let modularVariations: Record<string, unknown> | null = null;
      if (settings["modular_variations"] === true) {
        const modularContext = {
          project: projectResult.data,
          product: productResult.data,
          source_copy: copy?.content ?? standaloneTranscription?.transcript ?? transcript,
          copy_library_examples: snapshot.copy_library_examples,
          approved_strategy: result.strategy,
          product_visual_analysis: productVisualAnalysis,
          avatar_visual_analysis: avatarVisualAnalysis,
          selected_avatar: snapshot.selected_avatar,
          selected_movements: snapshot.selected_movements,
          required_information: settings["required_information"],
          forbidden_words: settings["forbidden_words"],
          format: settings["video_format"],
          creative_direction: settings,
        };
        const hookBatch = await provider.generateCopyModules(modularContext, "hook", 4);
        const hooks = hookBatch.modules.slice(0, 4);
        const bodyBatch = await provider.generateCopyModules(
          {
            ...modularContext,
            generated_hook_modules: hooks,
            continuity_contract:
              "Cada corpo deve funcionar depois de qualquer gancho e conter Corpo 1 + Corpo 2 conectados.",
          },
          "body",
          4,
        );
        const bodies = bodyBatch.modules.slice(0, 4);
        const ctaBatch = await provider.generateCopyModules(
          {
            ...modularContext,
            generated_hook_modules: hooks,
            generated_body_modules: bodies,
            continuity_contract:
              "Cada CTA deve concluir naturalmente qualquer sequência Gancho 1 + Corpo 1 + Corpo 2.",
          },
          "cta",
          3,
        );
        const ctas = ctaBatch.modules.slice(0, 3);
        if (
          hooks.length !== 4 ||
          bodies.length !== 4 ||
          ctas.length !== 3 ||
          hooks.some((module) => module.scenes.length !== 1) ||
          bodies.some((module) => module.scenes.length !== 2) ||
          ctas.some((module) => module.scenes.length !== 1)
        ) {
          throw new Error("A IA não entregou a estrutura modular completa de 4 × 4 × 3.");
        }
        const combinations = rankDiverseCombinations(
          hooks,
          bodies,
          ctas,
          performanceResult.data ?? [],
          12,
        );
        const coherenceValidation = validateModularCoherence(hooks, bodies, ctas);
        modularVariations = {
          format: settings["video_format"] || "UGC",
          scene_duration_seconds: 8,
          scenes_per_video: 4,
          hook_modules: hooks,
          body_modules: bodies,
          cta_modules: ctas,
          combinations,
          diversity_method: "local_lexical_and_component_distance",
          recommended_count: combinations.filter((item) => item.recommended).length,
          total_combinations: combinations.length,
          coherence_validation: coherenceValidation,
        };
      }
      const persistedResult = { ...result, modular_variations: modularVariations };
      const sceneRows = result.scenes.map((scene) => ({ ...scene, generation_id: generation.id }));
      const sceneInsert = await supabase.from("script_scenes").insert(sceneRows);
      if (sceneInsert.error)
        throw new Error("O roteiro foi gerado, mas as cenas não puderam ser salvas.");
      const update = await supabase
        .from("script_generations")
        .update({
          status: "completed",
          strategy: result.strategy,
          full_script: result.full_script,
          headline: result.headline,
          caption: result.caption,
          hashtags: result.hashtags,
          result: persistedResult,
        })
        .eq("id", generation.id)
        .eq("user_id", userId);
      if (update.error) throw new Error("Não foi possível salvar o resultado.");
      await supabase
        .from("projects")
        .update({
          status: "completed",
          product_analysis: {
            ...result.product_diagnosis,
            visual_reference: productVisualAnalysis,
          },
          reference_analysis: { copy: result.copy_analysis, video: result.video_analysis },
        })
        .eq("id", data.projectId)
        .eq("user_id", userId);
      await supabase
        .from("products")
        .update({
          analysis: {
            ...result.product_diagnosis,
            visual_reference: productVisualAnalysis,
          },
        })
        .eq("project_id", data.projectId)
        .eq("user_id", userId);
      if (copy)
        await supabase
          .from("copies")
          .update({ analysis: result.copy_analysis })
          .eq("id", copy.id)
          .eq("user_id", userId);
      if (video)
        await supabase
          .from("reference_videos")
          .update({
            analysis: {
              ...(video.analysis ?? {}),
              frame_count: frameUrls.length,
              analysis_method: "browser_frame_sampling_plus_audio_transcription",
              consolidated: result.video_analysis,
            },
            processing_status: "completed",
            processing_error: null,
          })
          .eq("id", video.id)
          .eq("user_id", userId);
      return { generationId: generation.id, version };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha inesperada na geração.";
      await supabase
        .from("script_generations")
        .update({ status: "failed", processing_error: message })
        .eq("id", generation.id)
        .eq("user_id", userId);
      await supabase
        .from("projects")
        .update({ status: "failed" })
        .eq("id", data.projectId)
        .eq("user_id", userId);
      if (video)
        await supabase
          .from("reference_videos")
          .update({ processing_status: "failed", processing_error: message })
          .eq("id", video.id)
          .eq("user_id", userId);
      throw new Error(message);
    }
  });
