import { createServerFn } from "@tanstack/react-start";
import { generationRequestSchema } from "./schemas";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/factory";

export const generateProjectScript = createServerFn({ method: "POST" })
  .validator(generationRequestSchema)
  .handler(async ({ data }) => {
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
    ] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("id", data.projectId)
          .eq("user_id", userId)
          .single(),
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
      ]);
    if (projectResult.error || !projectResult.data)
      throw new Error("Projeto não encontrado ou sem permissão.");
    if (productResult.error || !productResult.data)
      throw new Error("Cadastre o produto antes de gerar.");
    const copy = copiesResult.data?.[0] ?? null;
    const video = videosResult.data?.[0] ?? null;
    const standaloneTranscription = transcriptionsResult.data?.[0] ?? null;
    if (!copy && !video && !standaloneTranscription)
      throw new Error("Adicione uma copy, um vídeo ou associe uma transcrição ao projeto.");
    const version = (versionsResult.data?.[0]?.version ?? 0) + 1;
    const snapshot = {
      project: projectResult.data,
      product: productResult.data,
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
        ...snapshot,
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
      const settings = projectResult.data.settings as Record<string, unknown>;
      if (settings["modular_variations"] === true) {
        const modularContext = {
          project: projectResult.data,
          product: productResult.data,
          source_copy: copy?.content ?? standaloneTranscription?.transcript ?? transcript,
          copy_library_examples: snapshot.copy_library_examples,
          approved_strategy: result.strategy,
          required_information: settings["required_information"],
          forbidden_words: settings["forbidden_words"],
          format: settings["video_format"],
          creative_direction: settings,
        };
        const hookBatch = await provider.generateCopyModules(modularContext, "hook", 4);
        const bodyBatch = await provider.generateCopyModules(modularContext, "body", 4);
        const ctaBatch = await provider.generateCopyModules(modularContext, "cta", 3);
        const hooks = hookBatch.modules.slice(0, 4);
        const bodies = bodyBatch.modules.slice(0, 4);
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
        const combinations = hooks.flatMap((_, hookIndex) =>
          bodies.flatMap((__, bodyIndex) =>
            ctas.map((___, ctaIndex) => ({
              number: hookIndex * 12 + bodyIndex * 3 + ctaIndex + 1,
              label: `Gancho ${hookIndex + 1} + Corpo ${bodyIndex + 1} + CTA ${ctaIndex + 1}`,
              hook_index: hookIndex,
              body_index: bodyIndex,
              cta_index: ctaIndex,
            })),
          ),
        );
        modularVariations = {
          format: settings["video_format"] || "UGC",
          scene_duration_seconds: 8,
          scenes_per_video: 4,
          hook_modules: hooks,
          body_modules: bodies,
          cta_modules: ctas,
          combinations,
          total_combinations: combinations.length,
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
          product_analysis: result.product_diagnosis,
          reference_analysis: { copy: result.copy_analysis, video: result.video_analysis },
        })
        .eq("id", data.projectId)
        .eq("user_id", userId);
      await supabase
        .from("products")
        .update({ analysis: result.product_diagnosis })
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
