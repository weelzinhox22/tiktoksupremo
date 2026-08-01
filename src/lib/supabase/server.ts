import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

export function getSupabaseServerClient() {
  const url = process.env["VITE_SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) {
    throw new Error("Supabase não configurado no servidor.");
  }
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookies) {
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options);
        }
      },
    },
  });
}
