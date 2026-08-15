import { createServerFn } from "@tanstack/react-start";
import { mapUser } from "./auth";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const { data, error } = await (await getSupabaseServerClient()).auth.getUser();
    if (error || !data?.user) return null;
    const mapped = mapUser(data.user);
    const adminEmails = (process.env["ADMIN_EMAILS"] || "")
      .split(",")
      .map((email) => email.trim().toLowerCase());
    return { ...mapped, isAdmin: mapped.isAdmin || adminEmails.includes(mapped.email.toLowerCase()) };
  } catch (error) {
    console.error("getCurrentUser failed:", error);
    return null;
  }
});
