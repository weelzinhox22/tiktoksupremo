import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapUser } from "./auth";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await getSupabaseServerClient().auth.getUser();
    if (error || !data?.user) return null;
    return mapUser(data.user);
  } catch (error) {
    console.error("getCurrentUser failed:", error);
    return null;
  }
});
