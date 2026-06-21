"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) await login(username, password);
      else await register(username, password);
      router.push("/startups");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-bold">
        {isLogin ? "Вход" : "Регистрация"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-orange-600 py-2 font-medium hover:bg-orange-500 disabled:opacity-50"
        >
          {loading ? "..." : isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-400">
        {isLogin ? (
          <>
            Нет аккаунта?{" "}
            <Link href="/register" className="text-orange-500">
              Регистрация
            </Link>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-orange-500">
              Вход
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
