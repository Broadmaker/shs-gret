export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

const KEY = "shs-auth-user";

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}

export function login(email: string, name?: string): AuthUser {
  const user: AuthUser = {
    email: email.trim(),
    name: name?.trim() || email.split("@")[0] || "MEIT Member",
    role: "Evaluator",
  };
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthUser();
}
