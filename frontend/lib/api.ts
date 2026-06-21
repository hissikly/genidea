export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export interface Startup {
  id: number;
  yc_id: number;
  name: string;
  tagline: string;
  description: string;
  website: string;
  batch: string;
  year: number | null;
  status: string;
  team_size: number | null;
  location: string;
  tags: string[];
  industries: string[];
  logo_url: string;
}

export interface StartupList {
  total: number;
  items: Startup[];
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Profile {
  preferred_industries: string[];
  default_creativity: number;
  default_absurdity: number;
}

export interface GeneratedIdea {
  id: number;
  mode: string;
  params: Record<string, unknown>;
  idea_text: string;
  created_at: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // auth
  register: (username: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ detail: string }>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),

  // startups
  listStartups: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return request<StartupList>(`/startups?${qs.toString()}`);
  },
  batches: () => request<string[]>("/startups/batches"),
  randomStartups: (count: number) =>
    request<Startup[]>(`/startups/random?count=${count}`),

  // favorites
  listFavorites: () => request<Startup[]>("/favorites"),
  addFavorite: (startup_id: number) =>
    request<{ detail: string }>("/favorites", {
      method: "POST",
      body: JSON.stringify({ startup_id }),
    }),
  removeFavorite: (startup_id: number) =>
    request<{ detail: string }>(`/favorites/${startup_id}`, {
      method: "DELETE",
    }),

  // ideas
  generateIdea: (payload: {
    mode: "B" | "C" | "D";
    language: "ru" | "en";
    creativity: number;
    absurdity: number;
    count: number;
    industry?: string;
    favorite_ids?: number[];
  }) =>
    request<GeneratedIdea>("/ideas/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  ideaHistory: () => request<GeneratedIdea[]>("/ideas/history"),
  deleteIdea: (id: number) =>
    request<{ detail: string }>(`/ideas/history/${id}`, { method: "DELETE" }),

  // profile
  getProfile: () => request<Profile>("/profile"),
  updateProfile: (payload: Partial<Profile>) =>
    request<Profile>("/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
