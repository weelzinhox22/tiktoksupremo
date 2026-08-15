import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { createServerOnlyFn } from "@tanstack/react-start";

function getServerConfig() {
  const env = import.meta.env as Record<string, string | undefined>;
  const procEnv = (typeof process !== "undefined" ? process.env : {}) as Record<
    string,
    string | undefined
  >;
  const url = procEnv["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"] || env["VITE_SUPABASE_URL"];
  const anonKey =
    procEnv["VITE_SUPABASE_ANON_KEY"] ||
    procEnv["SUPABASE_ANON_KEY"] ||
    env["VITE_SUPABASE_ANON_KEY"];

  if (!url || !anonKey) throw new Error("Supabase não configurado no servidor.");
  return { url, anonKey, procEnv };
}

export const getSupabaseServerClient = createServerOnlyFn(async () => {
  const { getCookies, setCookie } = await import("@tanstack/react-start/server");
  const { url, anonKey } = getServerConfig();

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
});

export const getSupabaseAdminClient = createServerOnlyFn(() => {
  const { url, procEnv } = getServerConfig();
  const serviceRoleKey = procEnv["SUPABASE_SERVICE_ROLE_KEY"];
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.");
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
});
