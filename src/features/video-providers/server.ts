import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import {
  PROVIDER_CATALOG,
  VIDEO_PROVIDER_IDS,
  type JsonValue,
  type VideoProviderId,
  type VideoProviderPublicConfig,
} from "./types";

type ProviderRow = {
  provider: VideoProviderId;
  display_name: string;
  enabled: boolean;
  is_default: boolean;
  secret_ciphertext: string | null;
  secret_hint: string | null;
  settings: Record<string, unknown> | null;
  last_test_status: "untested" | "success" | "error";
  last_test_message: string | null;
  last_tested_at: string | null;
};

const providerIdSchema = z.enum(VIDEO_PROVIDER_IDS);
const saveSchema = z.object({
  provider: providerIdSchema,
  displayName: z.string().min(2).max(80),
  enabled: z.boolean(),
  isDefault: z.boolean(),
  secret: z.string().max(500).optional(),
  clearSecret: z.boolean().optional(),
  settings: z.record(z.unknown()),
});

function isAdminUser(user: {
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  const role = user.app_metadata?.["role"] ?? user.user_metadata?.["role"];
  const flagged = user.app_metadata?.["is_admin"] ?? user.user_metadata?.["is_admin"];
  const emails = (process.env["ADMIN_EMAILS"] || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return (
    role === "admin" ||
    flagged === true ||
    (!!user.email && emails.includes(user.email.toLowerCase()))
  );
}

async function requireUser() {
  const { data, error } = await (await getSupabaseServerClient()).auth.getUser();
  if (error || !data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminUser(user)) throw new Error("Acesso restrito ao administrador da plataforma.");
  return user;
}

async function encryptionKey() {
  const raw =
    process.env["PROVIDER_CONFIG_ENCRYPTION_KEY"] || process.env["TIKTOK_TOKEN_ENCRYPTION_KEY"];
  if (!raw || raw.length < 24) {
    throw new Error(
      "Defina PROVIDER_CONFIG_ENCRYPTION_KEY (mínimo de 24 caracteres) no servidor antes de salvar chaves.",
    );
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return globalThis.crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encryptSecret(secret: string) {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    new TextEncoder().encode(secret),
  );
  return [
    "v2",
    Buffer.from(iv).toString("base64url"),
    Buffer.from(encrypted).toString("base64url"),
  ].join(".");
}

export async function decryptProviderSecret(ciphertext: string) {
  const [version, ivText, encryptedText] = ciphertext.split(".");
  if (version !== "v2" || !ivText || !encryptedText)
    throw new Error("Credencial cifrada inválida.");
  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(ivText, "base64url") },
    await encryptionKey(),
    Buffer.from(encryptedText, "base64url"),
  );
  return new TextDecoder().decode(decrypted);
}

function toPublic(row: ProviderRow): VideoProviderPublicConfig {
  return {
    provider: row.provider,
    displayName: row.display_name,
    enabled: row.enabled,
    isDefault: row.is_default,
    configured:
      row.provider === "comfyui"
        ? Boolean((row.settings || {})["baseUrl"])
        : Boolean(row.secret_ciphertext),
    secretHint: row.secret_hint,
    settings: (row.settings || {}) as Record<string, JsonValue>,
    lastTestStatus: row.last_test_status,
    lastTestMessage: row.last_test_message,
    lastTestedAt: row.last_tested_at,
  };
}

async function fetchRows() {
  const { data, error } = await getSupabaseAdminClient()
    .from("video_provider_configs")
    .select(
      "provider,display_name,enabled,is_default,secret_ciphertext,secret_hint,settings,last_test_status,last_test_message,last_tested_at",
    )
    .order("is_default", { ascending: false });
  if (error)
    throw new Error(
      `Não foi possível carregar os provedores: ${error.message}. Aplique a migration mais recente.`,
    );
  return (data || []) as ProviderRow[];
}

export const listVideoProviderStatus = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  return (await fetchRows()).map(toPublic);
});

export const listVideoProviderConfigs = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return (await fetchRows()).map(toPublic);
});

export const saveVideoProviderConfig = createServerFn({ method: "POST" })
  .validator(saveSchema)
  .handler(async ({ data }) => {
    const user = await requireAdmin();
    if (data.provider === "comfyui" && data.enabled) {
      const baseUrl = String(data.settings["baseUrl"] || "");
      const workflow = data.settings["workflow"];
      if (
        !baseUrl ||
        baseUrl.includes("/admin/video-providers") ||
        /localhost:3000/i.test(baseUrl)
      ) {
        throw new Error(
          "A URL do ComfyUI deve apontar para a API dele (ex.: http://127.0.0.1:8188), não para a página do Tik Supremo.",
        );
      }
      if (!workflow || typeof workflow !== "object") {
        throw new Error(
          "Exporte o workflow no ComfyUI com Save (API Format) e cole o objeto JSON em workflow antes de ativar.",
        );
      }
    }
    const admin = getSupabaseAdminClient();
    if (data.isDefault) {
      const { error } = await admin
        .from("video_provider_configs")
        .update({ is_default: false })
        .eq("is_default", true);
      if (error) throw new Error(error.message);
    }
    const update: Record<string, unknown> = {
      display_name: data.displayName,
      enabled: data.enabled,
      is_default: data.isDefault,
      settings: data.settings,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      last_test_status: "untested",
      last_test_message: null,
    };
    if (data.clearSecret) {
      update["secret_ciphertext"] = null;
      update["secret_hint"] = null;
    } else if (data.secret?.trim()) {
      const secret = data.secret.trim();
      update["secret_ciphertext"] = await encryptSecret(secret);
      update["secret_hint"] = `••••${secret.slice(-4)}`;
    }
    const catalog = PROVIDER_CATALOG.find((item) => item.id === data.provider)!;
    const { error } = await admin.from("video_provider_configs").upsert(
      {
        provider: data.provider,
        display_name: data.displayName || catalog.name,
        ...update,
      },
      { onConflict: "provider" },
    );
    if (error) throw new Error(`Falha ao salvar: ${error.message}`);
    return { success: true };
  });

async function testProvider(
  provider: VideoProviderId,
  secret: string | null,
  settings: Record<string, unknown>,
) {
  const baseUrl = String(settings["baseUrl"] || "").replace(/\/$/, "");
  let response: Response;
  if (provider === "comfyui") {
    try {
      response = await fetch(`${baseUrl}/system_stats`, {
        headers: secret ? { Authorization: `Bearer ${secret}` } : {},
      });
    } catch {
      throw new Error(
        baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")
          ? "O servidor publicado não alcança o ComfyUI do seu computador. Teste localmente pelo navegador ou use uma URL HTTPS/túnel acessível pelo servidor."
          : "Não foi possível alcançar o ComfyUI. Confirme a URL, o proxy e se o serviço está online.",
      );
    }
  } else if (provider === "ltx") {
    response = await fetch(`${baseUrl || "https://api.ltx.io"}/v2/text-to-video/test-connection`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (response.status === 404)
      return "Credencial e URL salvas; o teste completo ocorrerá na primeira geração.";
  } else if (provider === "veo") {
    response = await fetch(
      `${baseUrl || "https://generativelanguage.googleapis.com/v1beta"}/models?key=${encodeURIComponent(secret || "")}`,
    );
  } else if (provider === "replicate") {
    response = await fetch(`${baseUrl || "https://api.replicate.com/v1"}/account`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
  } else if (provider === "huggingface") {
    response = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${secret}` },
    });
  } else {
    response = await fetch(`${baseUrl || "https://api.minimaxi.chat/v1"}/models`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
  }
  if (!response.ok)
    throw new Error(
      `HTTP ${response.status}: ${(await response.text()).slice(0, 180) || response.statusText}`,
    );
  return "Conexão validada com sucesso.";
}

export const testVideoProviderConfig = createServerFn({ method: "POST" })
  .validator(z.object({ provider: providerIdSchema }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const rows = await fetchRows();
    const row = rows.find((item) => item.provider === data.provider);
    if (!row) throw new Error("Provedor não encontrado.");
    const secret = row.secret_ciphertext
      ? await decryptProviderSecret(row.secret_ciphertext)
      : null;
    let status: "success" | "error" = "success";
    let message: string;
    try {
      message = await testProvider(row.provider, secret, row.settings || {});
    } catch (error) {
      status = "error";
      message = error instanceof Error ? error.message : "Falha desconhecida no teste.";
    }
    await getSupabaseAdminClient()
      .from("video_provider_configs")
      .update({
        last_test_status: status,
        last_test_message: message,
        last_tested_at: new Date().toISOString(),
      })
      .eq("provider", data.provider);
    return { success: status === "success", message };
  });

export async function loadEnabledProviderSecrets() {
  const rows = await fetchRows();
  const enabledRows = rows
    .filter((row) => row.enabled)
    .sort((a, b) => Number(b.is_default) - Number(a.is_default));
  return Promise.all(
    enabledRows.map(async (row) => ({
      id: row.provider,
      name: row.display_name,
      settings: row.settings || {},
      secret: row.secret_ciphertext ? await decryptProviderSecret(row.secret_ciphertext) : null,
    })),
  );
}
