import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const emptySchema = z.object({});
const callbackSchema = z.object({
  code: z.string().trim().min(4).max(2_000),
  state: z.string().uuid(),
});

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};
type ValidTokenResponse = TokenResponse & { access_token: string };

type ConnectionRecord = {
  user_id: string;
  open_id: string;
  display_name: string;
  avatar_url: string | null;
  access_token_ciphertext: string;
  refresh_token_ciphertext: string;
  scopes: string[];
  access_expires_at: string;
  refresh_expires_at: string;
};

function requireConfig() {
  const clientKey = process.env["TIKTOK_CLIENT_KEY"];
  const clientSecret = process.env["TIKTOK_CLIENT_SECRET"];
  const redirectUri = process.env["TIKTOK_REDIRECT_URI"];
  const encryptionKey = process.env["TIKTOK_TOKEN_ENCRYPTION_KEY"];
  if (!clientKey || !clientSecret || !redirectUri || !encryptionKey) {
    throw new Error(
      "A conexão aguarda TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI e TIKTOK_TOKEN_ENCRYPTION_KEY.",
    );
  }
  return { clientKey, clientSecret, redirectUri, encryptionKey };
}

async function authenticatedUser() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return { supabase, user: data.user };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function cryptoKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptToken(token: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await cryptoKey(secret),
    new TextEncoder().encode(token),
  );
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptToken(ciphertext: string, secret: string) {
  const [ivPart, dataPart] = ciphertext.split(".");
  if (!ivPart || !dataPart) throw new Error("Token cifrado inválido.");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivPart) },
    await cryptoKey(secret),
    base64ToBytes(dataPart),
  );
  return new TextDecoder().decode(decrypted);
}

async function exchangeToken(body: URLSearchParams): Promise<ValidTokenResponse> {
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json().catch(() => null)) as TokenResponse | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error_description ||
        "O TikTok não concluiu a autorização. Tente conectar novamente.",
    );
  }
  return payload as ValidTokenResponse;
}

async function activeAccessToken(connection: ConnectionRecord) {
  const { clientKey, clientSecret, encryptionKey } = requireConfig();
  if (new Date(connection.access_expires_at).getTime() > Date.now() + 5 * 60_000) {
    return decryptToken(connection.access_token_ciphertext, encryptionKey);
  }
  if (new Date(connection.refresh_expires_at).getTime() <= Date.now()) {
    throw new Error("A autorização do TikTok expirou. Conecte a conta novamente.");
  }
  const refreshToken = await decryptToken(connection.refresh_token_ciphertext, encryptionKey);
  const payload = await exchangeToken(
    new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
  if (!payload.refresh_token) throw new Error("O TikTok não retornou o token de renovação.");
  const accessExpiresAt = new Date(Date.now() + (payload.expires_in ?? 86_400) * 1_000);
  const refreshExpiresAt = new Date(
    Date.now() + (payload.refresh_expires_in ?? 31_536_000) * 1_000,
  );
  const supabase = getSupabaseServerClient();
  const update = await supabase
    .from("tiktok_connections")
    .update({
      access_token_ciphertext: await encryptToken(payload.access_token, encryptionKey),
      refresh_token_ciphertext: await encryptToken(payload.refresh_token, encryptionKey),
      scopes: (payload.scope ?? connection.scopes.join(",")).split(",").filter(Boolean),
      access_expires_at: accessExpiresAt.toISOString(),
      refresh_expires_at: refreshExpiresAt.toISOString(),
    })
    .eq("user_id", connection.user_id);
  if (update.error) throw new Error("O token foi renovado, mas não pôde ser salvo.");
  return payload.access_token;
}

export const getTikTokConnectionStatus = createServerFn({ method: "GET" })
  .validator(emptySchema)
  .handler(async () => {
    const { supabase, user } = await authenticatedUser();
    const result = await supabase
      .from("tiktok_connections")
      .select("display_name,avatar_url,scopes,access_expires_at,refresh_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) throw new Error("Não foi possível consultar a conexão com o TikTok.");
    return {
      configured: Boolean(
        process.env["TIKTOK_CLIENT_KEY"] &&
        process.env["TIKTOK_CLIENT_SECRET"] &&
        process.env["TIKTOK_REDIRECT_URI"] &&
        process.env["TIKTOK_TOKEN_ENCRYPTION_KEY"],
      ),
      connected: Boolean(result.data),
      profile: result.data
        ? {
            displayName: result.data.display_name,
            avatarUrl: result.data.avatar_url,
            scopes: result.data.scopes,
            refreshExpiresAt: result.data.refresh_expires_at,
          }
        : null,
    };
  });

export const startTikTokConnection = createServerFn({ method: "POST" })
  .validator(emptySchema)
  .handler(async () => {
    const { clientKey, redirectUri } = requireConfig();
    const { supabase, user } = await authenticatedUser();
    const state = crypto.randomUUID();
    await supabase.from("tiktok_oauth_states").delete().eq("user_id", user.id);
    const saved = await supabase.from("tiktok_oauth_states").insert({
      state,
      user_id: user.id,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    });
    if (saved.error) throw new Error("Não foi possível iniciar a conexão segura com o TikTok.");
    const authorizationUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
    authorizationUrl.searchParams.set("client_key", clientKey);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "user.info.basic,video.list");
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("state", state);
    return { authorizationUrl: authorizationUrl.toString() };
  });

export const completeTikTokConnection = createServerFn({ method: "POST" })
  .validator(callbackSchema)
  .handler(async ({ data }) => {
    const { clientKey, clientSecret, redirectUri, encryptionKey } = requireConfig();
    const { supabase, user } = await authenticatedUser();
    const state = await supabase
      .from("tiktok_oauth_states")
      .select("state,expires_at")
      .eq("state", data.state)
      .eq("user_id", user.id)
      .maybeSingle();
    await supabase.from("tiktok_oauth_states").delete().eq("state", data.state);
    if (!state.data || new Date(state.data.expires_at).getTime() < Date.now()) {
      throw new Error("A autorização expirou ou não é válida. Comece a conexão novamente.");
    }
    const token = await exchangeToken(
      new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: data.code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    );
    if (!token.refresh_token || !token.open_id) {
      throw new Error("O TikTok retornou uma autorização incompleta.");
    }
    const profileResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
      { headers: { Authorization: `Bearer ${token.access_token}` } },
    );
    const profilePayload = (await profileResponse.json().catch(() => null)) as {
      data?: { user?: { display_name?: string; avatar_url?: string } };
    } | null;
    const profile = profilePayload?.data?.user;
    const upsert = await supabase.from("tiktok_connections").upsert({
      user_id: user.id,
      open_id: token.open_id,
      display_name: profile?.display_name ?? "Conta TikTok conectada",
      avatar_url: profile?.avatar_url ?? null,
      access_token_ciphertext: await encryptToken(token.access_token, encryptionKey),
      refresh_token_ciphertext: await encryptToken(token.refresh_token, encryptionKey),
      scopes: (token.scope ?? "").split(",").filter(Boolean),
      access_expires_at: new Date(Date.now() + (token.expires_in ?? 86_400) * 1_000).toISOString(),
      refresh_expires_at: new Date(
        Date.now() + (token.refresh_expires_in ?? 31_536_000) * 1_000,
      ).toISOString(),
    });
    if (upsert.error) throw new Error("A conta foi autorizada, mas não pôde ser salva.");
    return { displayName: profile?.display_name ?? "Conta TikTok conectada" };
  });

export const disconnectTikTok = createServerFn({ method: "POST" })
  .validator(emptySchema)
  .handler(async () => {
    const { supabase, user } = await authenticatedUser();
    const connection = await supabase
      .from("tiktok_connections")
      .select("access_token_ciphertext")
      .eq("user_id", user.id)
      .maybeSingle();
    if (connection.data) {
      try {
        const { clientKey, clientSecret, encryptionKey } = requireConfig();
        const token = await decryptToken(connection.data.access_token_ciphertext, encryptionKey);
        await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, token }),
        });
      } catch {
        // A remoção local continua mesmo se o TikTok já tiver invalidado o token.
      }
    }
    const deleted = await supabase.from("tiktok_connections").delete().eq("user_id", user.id);
    if (deleted.error) throw new Error("Não foi possível desconectar a conta.");
    return { disconnected: true };
  });

export async function getAuthorizedTikTokVideo(userId: string, videoId: string) {
  const supabase = getSupabaseServerClient();
  const connection = await supabase
    .from("tiktok_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (connection.error || !connection.data) return null;
  try {
    const token = await activeAccessToken(connection.data as ConnectionRecord);
    const fields = [
      "id",
      "create_time",
      "cover_image_url",
      "share_url",
      "video_description",
      "duration",
      "title",
      "embed_link",
      "like_count",
      "comment_count",
      "share_count",
      "view_count",
    ].join(",");
    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/query/?fields=${encodeURIComponent(fields)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ filters: { video_ids: [videoId] } }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      data?: { videos?: Array<Record<string, unknown>> };
      error?: { code?: string };
    } | null;
    if (!response.ok || payload?.error?.code !== "ok") return null;
    return payload.data?.videos?.[0] ?? null;
  } catch {
    return null;
  }
}
