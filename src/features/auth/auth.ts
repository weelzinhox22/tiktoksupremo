import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppUser } from "@/lib/supabase/types";

export function mapUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): AppUser {
  const email = user.email ?? "";
  const name = user.user_metadata?.["display_name"];
  return {
    id: user.id,
    email,
    displayName: typeof name === "string" && name.trim() ? name : email.split("@")[0] || "Creator",
    isAdmin:
      user.app_metadata?.["role"] === "admin" ||
      user.app_metadata?.["is_admin"] === true ||
      user.user_metadata?.["role"] === "admin" ||
      user.user_metadata?.["is_admin"] === true,
  };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw translateAuthError(error.message);
  if (!data.user) throw new Error("Não foi possível iniciar a sessão.");
  return mapUser(data.user);
}

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await getSupabaseBrowserClient().auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw translateAuthError(error.message);
  if (!data.user) throw new Error("Não foi possível criar a conta.");
  return { user: mapUser(data.user), needsConfirmation: !data.session };
}

export async function signOut() {
  const { error } = await getSupabaseBrowserClient().auth.signOut();
  if (error) throw translateAuthError(error.message);
}

export async function resetPassword(email: string) {
  const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login?recovery=1`,
  });
  if (error) throw translateAuthError(error.message);
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials"))
    return new Error("E-mail ou senha inválidos.");
  if (normalized.includes("email not confirmed"))
    return new Error("Confirme seu e-mail antes de entrar.");
  if (normalized.includes("already registered") || normalized.includes("already been registered"))
    return new Error("Este e-mail já está cadastrado.");
  if (normalized.includes("password"))
    return new Error("A senha precisa ter pelo menos 6 caracteres.");
  if (normalized.includes("rate limit"))
    return new Error("Muitas tentativas. Aguarde um pouco e tente novamente.");
  return new Error(`Não foi possível autenticar: ${message}`);
}
