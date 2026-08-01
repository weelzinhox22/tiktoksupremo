import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

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
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value: String(value ?? ""),
        }));
      },
      setAll(cookies) {
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options);
        }
      },
    },
  });
}
