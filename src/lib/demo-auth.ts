/**
 * Autenticação de DEMONSTRAÇÃO (temporária).
 *
 * O Lovable Cloud ainda não está ativo neste projeto, então a sessão é
 * mantida apenas no navegador (localStorage). Quando o Cloud for habilitado,
 * estas funções serão substituídas pelas chamadas equivalentes do Supabase
 * sem alterar as telas de login e do dashboard.
 */

export const DEMO_CREDENTIALS = {
  username: "weelzinhox22teste",
  password: "123456",
};

export type DemoUser = {
  username: string;
  fullName: string;
  brand: string;
  role: string;
  credits: number;
};

const DEMO_USER: DemoUser = {
  username: DEMO_CREDENTIALS.username,
  fullName: "Weelzinho",
  brand: "Operação Tik Supremo",
  role: "Afiliado TikTok Shop",
  credits: 250,
};

const STORAGE_KEY = "tik-supremo:demo-session";

export function signIn(username: string, password: string): DemoUser {
  const normalized = username.trim().toLowerCase();
  if (normalized !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
    throw new Error("Usuário ou senha inválidos.");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

export function signOut() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}
