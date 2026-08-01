import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Avatar,
  ContentPerformance,
  MovementPreset,
  ProductLibraryItem,
} from "@/lib/supabase/types";

export type ProductLibraryWithPreview = ProductLibraryItem & { previewUrl: string | null };
export type AvatarWithPreview = Avatar & { previewUrl: string | null };

async function signFirstImages<T extends { image_paths: string[] }>(rows: T[]) {
  const paths = rows.flatMap((row) => row.image_paths.slice(0, 1));
  if (!paths.length) return rows.map((row) => ({ ...row, previewUrl: null }));
  const signed = await getSupabaseBrowserClient()
    .storage.from("product-images")
    .createSignedUrls(paths, 3_600);
  const urls = new Map(
    signed.data?.map((item) => [item.path, item.signedUrl ?? null] as const) ?? [],
  );
  return rows.map((row) => ({
    ...row,
    previewUrl: row.image_paths[0] ? (urls.get(row.image_paths[0]) ?? null) : null,
  }));
}

export async function listProductLibrary(): Promise<ProductLibraryWithPreview[]> {
  const result = await getSupabaseBrowserClient()
    .from("product_library")
    .select("*")
    .order("updated_at", { ascending: false });
  if (result.error)
    throw new Error(`Não foi possível carregar os produtos: ${result.error.message}`);
  return signFirstImages((result.data ?? []) as ProductLibraryItem[]);
}

export async function listMovementLibrary(): Promise<MovementPreset[]> {
  const result = await getSupabaseBrowserClient()
    .from("movement_library")
    .select("*")
    .order("user_id", { ascending: true, nullsFirst: true })
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (result.error)
    throw new Error(`Não foi possível carregar poses e movimentos: ${result.error.message}`);
  return (result.data ?? []) as MovementPreset[];
}

export async function listAvatarLibrary(userId: string): Promise<AvatarWithPreview[]> {
  const supabase = getSupabaseBrowserClient();
  const result = await supabase
    .from("avatars")
    .select(
      "id,user_id,name,description,image_path,source,generation_prompt,metadata,created_at,updated_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (result.error)
    throw new Error(`Não foi possível carregar os avatares: ${result.error.message}`);
  const rows = (result.data ?? []) as Avatar[];
  const signed = rows.length
    ? await supabase.storage.from("product-images").createSignedUrls(
        rows.map((avatar) => avatar.image_path),
        3_600,
      )
    : null;
  const urls = new Map(
    signed?.data?.map((item) => [item.path, item.signedUrl ?? null] as const) ?? [],
  );
  return rows.map((avatar) => ({
    ...avatar,
    previewUrl: urls.get(avatar.image_path) ?? null,
  }));
}

export type PerformanceWithProject = ContentPerformance & {
  projects?: { name?: string } | null;
  script_generations?: { version?: number } | null;
};

export async function listPerformance(): Promise<PerformanceWithProject[]> {
  const result = await getSupabaseBrowserClient()
    .from("content_performance")
    .select("*,projects(name),script_generations(version)")
    .order("published_at", { ascending: false });
  if (result.error)
    throw new Error(`Não foi possível carregar o desempenho: ${result.error.message}`);
  return (result.data ?? []) as PerformanceWithProject[];
}

export async function listGenerationPerformance(generationId: string) {
  const result = await getSupabaseBrowserClient()
    .from("content_performance")
    .select("*")
    .eq("generation_id", generationId)
    .order("published_at", { ascending: false });
  if (result.error)
    throw new Error(`Não foi possível carregar o desempenho: ${result.error.message}`);
  return (result.data ?? []) as ContentPerformance[];
}
