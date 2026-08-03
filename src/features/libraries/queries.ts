import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import type {
  Avatar,
  ContentPerformance,
  MovementPreset,
  ProductLibraryItem,
} from "@/lib/supabase/types";

export type ProductLibraryWithPreview = ProductLibraryItem & { previewUrl: string | null };
export type AvatarWithPreview = Avatar & { previewUrl: string | null };

function isDirectUrl(path: string | null | undefined): boolean {
  if (!path) return false;
  return /^https?:\/\//i.test(path) || /^data:/i.test(path) || /^blob:/i.test(path);
}

export function formatSupabaseUrl(signedUrl: string | null | undefined): string | null {
  if (!signedUrl) return null;
  if (isDirectUrl(signedUrl)) return signedUrl;
  try {
    const { url: supabaseUrl } = getPublicSupabaseConfig();
    const cleanBase = supabaseUrl.replace(/\/$/, "");
    const cleanPath = signedUrl.replace(/^\//, "");
    if (cleanPath.startsWith("storage/v1/")) {
      return `${cleanBase}/${cleanPath}`;
    }
    return `${cleanBase}/storage/v1/${cleanPath}`;
  } catch {
    return signedUrl;
  }
}

async function signFirstImages<T extends { image_paths: string[] }>(rows: T[]) {
  const supabase = getSupabaseBrowserClient();
  const rawPaths = rows.map((row) => row.image_paths[0]).filter((p): p is string => Boolean(p));
  const storagePaths = Array.from(new Set(rawPaths.filter((p) => !isDirectUrl(p))));

  const urls = new Map<string, string>();

  if (storagePaths.length > 0) {
    try {
      const signed = await supabase.storage
        .from("product-images")
        .createSignedUrls(storagePaths, 3_600);

      if (signed.data) {
        signed.data.forEach((item, index) => {
          const originalPath = storagePaths[index];
          if (originalPath && item?.signedUrl) {
            urls.set(originalPath, formatSupabaseUrl(item.signedUrl) ?? item.signedUrl);
          }
          if (item?.path && item?.signedUrl) {
            urls.set(item.path, formatSupabaseUrl(item.signedUrl) ?? item.signedUrl);
          }
        });
      }
    } catch {
      // Ignore batch error
    }

    for (const path of storagePaths) {
      if (!urls.has(path)) {
        try {
          const single = await supabase.storage
            .from("product-images")
            .createSignedUrl(path, 3_600);
          if (single.data?.signedUrl) {
            const formatted = formatSupabaseUrl(single.data.signedUrl) ?? single.data.signedUrl;
            urls.set(path, formatted);
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return rows.map((row) => {
    const firstPath = row.image_paths[0];
    if (!firstPath) return { ...row, previewUrl: null };
    if (isDirectUrl(firstPath)) return { ...row, previewUrl: firstPath };
    const signedUrl = urls.get(firstPath) ?? null;
    return { ...row, previewUrl: signedUrl };
  });
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

  const storagePaths = Array.from(
    new Set(
      rows
        .map((avatar) => avatar.image_path)
        .filter((p): p is string => Boolean(p) && !isDirectUrl(p)),
    ),
  );

  const urls = new Map<string, string>();
  if (storagePaths.length > 0) {
    try {
      const signed = await supabase.storage
        .from("product-images")
        .createSignedUrls(storagePaths, 3_600);
      if (signed.data) {
        signed.data.forEach((item, index) => {
          const originalPath = storagePaths[index];
          if (originalPath && item?.signedUrl) {
            urls.set(originalPath, formatSupabaseUrl(item.signedUrl) ?? item.signedUrl);
          }
          if (item?.path && item?.signedUrl) {
            urls.set(item.path, formatSupabaseUrl(item.signedUrl) ?? item.signedUrl);
          }
        });
      }
    } catch {
      // Ignore batch error
    }

    for (const path of storagePaths) {
      if (!urls.has(path)) {
        try {
          const single = await supabase.storage
            .from("product-images")
            .createSignedUrl(path, 3_600);
          if (single.data?.signedUrl) {
            const formatted = formatSupabaseUrl(single.data.signedUrl) ?? single.data.signedUrl;
            urls.set(path, formatted);
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return rows.map((avatar) => {
    const path = avatar.image_path;
    if (!path) return { ...avatar, previewUrl: null };
    if (isDirectUrl(path)) return { ...avatar, previewUrl: path };
    const previewUrl = urls.get(path) ?? null;
    return { ...avatar, previewUrl };
  });
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
