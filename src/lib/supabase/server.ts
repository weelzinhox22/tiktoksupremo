import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  const env = import.meta.env as Record<string, string | undefined>;
  const procEnv = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  const url = procEnv["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"] || env["VITE_SUPABASE_URL"];
  const anonKey = procEnv["VITE_SUPABASE_ANON_KEY"] || procEnv["SUPABASE_ANON_KEY"] || env["VITE_SUPABASE_ANON_KEY"];

  if (!url || !anonKey) {
    throw new Error("Supabase não configurado no servidor.");
  }
  return createServerClient(url, anonKey, {
    cookies: {
      async getAll() {
        const { getCookies } = await import("@tanstack/react-start/server");
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      async setAll(cookies) {
        const { setCookie } = await import("@tanstack/react-start/server");
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options);
        }
      },
    },
  });
}
