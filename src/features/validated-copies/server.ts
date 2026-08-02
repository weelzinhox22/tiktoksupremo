import { createServerFn } from "@tanstack/react-start";
import {
  sceneRevisionRequestSchema,
  transcriptionRequestSchema,
} from "@/features/script-generation/schemas";

export const processTranscription = createServerFn({ method: "POST" })
  .validator(transcriptionRequestSchema)
  .handler(async ({ data }) => {
    const [{ getSupabaseServerClient }, { getAIProvider }] = await Promise.all([
      import("@/lib/supabase/server"),
      import("@/lib/ai/factory"),
    ]);
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");
    const userId = auth.user.id;

    const { data: transcription, error } = await supabase
      .from("transcriptions")
      .select("*")
      .eq("id", data.transcriptionId)
      .eq("user_id", userId)
      .single();
    if (error || !transcription) throw new Error("Transcrição não encontrada ou sem permissão.");

    await supabase
      .from("transcriptions")
      .update({ processing_status: "processing", processing_error: null })
      .eq("id", transcription.id)
      .eq("user_id", userId);

    try {
      const { provider } = getAIProvider();
      let transcript = transcription.transcript ?? "";
      if (!transcript) {
        if (provider.transcribeMediaUrl) {
          const signed = await supabase.storage
            .from("reference-videos")
            .createSignedUrl(transcription.storage_path, 1_800);
          if (signed.error || !signed.data?.signedUrl)
            throw new Error("Não foi possível abrir o vídeo para transcrição.");
          try {
            transcript = await provider.transcribeMediaUrl(signed.data.signedUrl);
          } catch (urlError) {
            const downloaded = await supabase.storage
              .from("reference-videos")
              .download(transcription.storage_path);
            if (downloaded.error || !downloaded.data) throw urlError;
            transcript = await provider.transcribeMedia(
              downloaded.data,
              transcription.original_filename,
            );
          }
        } else {
          const downloaded = await supabase.storage
            .from("reference-videos")
            .download(transcription.storage_path);
          if (downloaded.error || !downloaded.data)
            throw new Error("Não foi possível baixar o vídeo para transcrição.");
          transcript = await provider.transcribeMedia(
            downloaded.data,
            transcription.original_filename,
          );
        }
      }
      if (!transcript.trim()) throw new Error("Nenhuma fala foi encontrada no vídeo.");

      const analysis = await provider.analyzeValidatedCopy(transcript);
      const enrichedAnalysis = {
        ...analysis,
        source_filename: transcription.original_filename,
      };
      const libraryEntry = await supabase.from("copy_library").upsert(
        {
          user_id: userId,
          source_transcription_id: transcription.id,
          title: transcription.original_filename.slice(0, 180),
          content: transcript.trim(),
          hook: analysis.hook,
          body: analysis.body,
          cta: analysis.cta,
          analysis: enrichedAnalysis,
          language_style: [analysis.tone, analysis.audience].filter(Boolean),
          tags: ["transcrição", "copy validada"],
          source: "transcription",
        },
        { onConflict: "source_transcription_id" },
      );
      if (libraryEntry.error)
        throw new Error(
          `A copy foi analisada, mas não entrou na biblioteca: ${libraryEntry.error.message}`,
        );
      const update = await supabase
        .from("transcriptions")
        .update({
          transcript: transcript.trim(),
          processing_status: "completed",
          processing_error: null,
          analysis: enrichedAnalysis,
        })
        .eq("id", transcription.id)
        .eq("user_id", userId);
      if (update.error) throw new Error("A transcrição foi criada, mas não pôde ser salva.");
      return { transcriptionId: transcription.id };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha inesperada na transcrição.";
      await supabase
        .from("transcriptions")
        .update({ processing_status: "failed", processing_error: message })
        .eq("id", transcription.id)
        .eq("user_id", userId);
      throw new Error(message);
    }
  });

export const reviseScenePrompt = createServerFn({ method: "POST" })
  .validator(sceneRevisionRequestSchema)
  .handler(async ({ data }) => {
    const [{ getSupabaseServerClient }, { getAIProvider }] = await Promise.all([
      import("@/lib/supabase/server"),
      import("@/lib/ai/factory"),
    ]);
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");
    const userId = auth.user.id;

    const { data: scene, error: sceneError } = await supabase
      .from("script_scenes")
      .select("*")
      .eq("id", data.sceneId)
      .single();
    if (sceneError || !scene) throw new Error("Cena não encontrada.");
    const { data: generation } = await supabase
      .from("script_generations")
      .select("project_id,user_id")
      .eq("id", scene.generation_id)
      .eq("project_id", data.projectId)
      .eq("user_id", userId)
      .single();
    if (!generation) throw new Error("Cena não encontrada ou sem permissão.");
    const { data: product } = await supabase
      .from("products")
      .select("name,description,target_audience,benefits")
      .eq("project_id", data.projectId)
      .eq("user_id", userId)
      .single();

    const { provider } = getAIProvider();
    const revision = await provider.reviseScenePrompt({
      instruction: data.instruction,
      product,
      scene: {
        scene_number: scene.scene_number,
        spoken_text: scene.spoken_text,
        speech_direction: scene.speech_direction,
        character_direction: scene.character_direction,
        veo_prompt: scene.veo_prompt,
      },
    });
    let veoPrompt = revision.veo_prompt.trim();
    if (!veoPrompt.includes(revision.spoken_text)) {
      const dialogue = `DIALOGUE:\n"${revision.spoken_text}"`;
      veoPrompt = /DIALOGUE:\s*["“][\s\S]*?["”](?=\s*\n[A-Z]+:|$)/.test(veoPrompt)
        ? veoPrompt.replace(/DIALOGUE:\s*["“][\s\S]*?["”](?=\s*\n[A-Z]+:|$)/, dialogue)
        : `${veoPrompt}\n\n${dialogue}`;
    }
    const { error: updateError } = await supabase
      .from("script_scenes")
      .update({
        spoken_text: revision.spoken_text,
        speech_direction: revision.speech_direction,
        character_direction: revision.character_direction,
        veo_prompt: veoPrompt,
      })
      .eq("id", data.sceneId);
    if (updateError) throw new Error("A correção foi criada, mas não pôde ser salva.");
    return { sceneId: data.sceneId };
  });
