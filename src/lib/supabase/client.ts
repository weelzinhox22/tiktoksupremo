import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./config";

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, anonKey } = getPublicSupabaseConfig();
    browserClient = createBrowserClient(url, anonKey, {
      cookieOptions: { sameSite: "lax", secure: location.protocol === "https:" },
    });
  }
  return browserClient;
}
