import { createFileRoute } from "@tanstack/react-router";

const AUTHORIZE_ENDPOINT = "https://www.tiktok.com/v2/auth/authorize/";
const REDIRECT_URI = "https://tiktoksupremo.studiooryon.pro/auth/tiktok/callback";
const STATE_COOKIE = "tiktok_login_state";

function configurationError(message: string) {
  console.error(`[TikTok Login] configuração inválida: ${message}`);
  return Response.json(
    {
      error: "tiktok_login_not_configured",
      message: `Login com TikTok indisponível: ${message}`,
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export const Route = createFileRoute("/api/auth/tiktok/start")({
  server: {
    handlers: {
      GET: async () => {
        const rawClientKey = process.env["TIKTOK_CLIENT_KEY"];
        const configuredRedirectUri = process.env["TIKTOK_REDIRECT_URI"];
        const clientKey = rawClientKey?.trim() ?? "";

        if (!clientKey) return configurationError("TIKTOK_CLIENT_KEY não foi cadastrada.");
        if (/\s|["']/u.test(clientKey)) {
          return configurationError(
            "TIKTOK_CLIENT_KEY contém espaços ou aspas. Copie somente a Client Key do portal.",
          );
        }
        if (/client|secret|app[_ -]?id|example|your|chave|fict/iu.test(clientKey)) {
          return configurationError(
            "TIKTOK_CLIENT_KEY parece ser um placeholder, App ID, Client Secret ou nome do aplicativo.",
          );
        }
        if (configuredRedirectUri !== REDIRECT_URI) {
          return configurationError(`TIKTOK_REDIRECT_URI deve ser exatamente ${REDIRECT_URI}.`);
        }

        const state = crypto.randomUUID();
        const params = new URLSearchParams();
        params.set("client_key", clientKey);
        params.set("scope", "user.info.basic");
        params.set("response_type", "code");
        params.set("redirect_uri", REDIRECT_URI);
        params.set("state", state);
        const authorizationUrl = `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
        const suffix = clientKey.slice(-4).padStart(4, "*");

        console.info("[TikTok Login] autorização iniciada", {
          clientKeyFound: true,
          clientKeySuffix: `****${suffix}`,
          redirectUri: REDIRECT_URI,
        });

        return new Response(null, {
          status: 302,
          headers: {
            Location: authorizationUrl,
            "Set-Cookie": `${STATE_COOKIE}=${encodeURIComponent(state)}; Max-Age=600; Path=/auth/tiktok/callback; HttpOnly; Secure; SameSite=Lax`,
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        });
      },
    },
  },
});
