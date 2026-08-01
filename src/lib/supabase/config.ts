export function getPublicSupabaseConfig() {
  const env = import.meta.env as Record<string, string | undefined>;
  const procEnv = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  const url = env["VITE_SUPABASE_URL"] || procEnv["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"];
  const anonKey = env["VITE_SUPABASE_ANON_KEY"] || procEnv["VITE_SUPABASE_ANON_KEY"] || procEnv["SUPABASE_ANON_KEY"];
  if (!url || !anonKey) {
    throw new Error("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  return { url, anonKey };
}

export function isSupabaseConfigured() {
  const env = import.meta.env as Record<string, string | undefined>;
  const procEnv = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  const url = env["VITE_SUPABASE_URL"] || procEnv["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"];
  const anonKey = env["VITE_SUPABASE_ANON_KEY"] || procEnv["VITE_SUPABASE_ANON_KEY"] || procEnv["SUPABASE_ANON_KEY"];
  return Boolean(url && anonKey);
}
