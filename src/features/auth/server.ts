import { createServerFn } from "@tanstack/react-start";
import { mapUser } from "./auth";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const { data, error } = await getSupabaseServerClient().auth.getUser();
    if (error || !data?.user) return null;
    return mapUser(data.user);
  } catch (error) {
    console.error("getCurrentUser failed:", error);
    return null;
  }
});
