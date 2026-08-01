import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function listProjects() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("projects")
    .select("id,name,status,created_at,updated_at,products(name),script_generations(id)")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Não foi possível carregar os projetos: ${error.message}`);
  return data ?? [];
}

export async function getProject(projectId: string) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("projects")
    .select("*,products(*),copies(*),reference_videos(*),script_generations(*,script_scenes(*))")
    .eq("id", projectId)
    .single();
  if (error)
    throw new Error(
      error.code === "PGRST116"
        ? "Projeto não encontrado ou sem acesso."
        : `Falha ao abrir o projeto: ${error.message}`,
    );
  return data;
}

export async function listTranscriptions() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("transcriptions")
    .select("id,project_id,original_filename,transcript,analysis,processing_status,processing_error,created_at,projects(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Não foi possível carregar as transcrições: ${error.message}`);
  return data ?? [];
}
