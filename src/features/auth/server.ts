import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapUser } from "./auth";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await getSupabaseServerClient().auth.getUser();
    if (error || !data.user) return null;
    return mapUser(data.user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("não configurado")) return null;
    throw error;
  }
});
