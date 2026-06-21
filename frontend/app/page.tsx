"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-4xl font-bold">
        <span className="text-orange-500">Genidea</span> — генератор
        стартап-идей
      </h1>
      <p className="mt-4 text-neutral-400">
        Исследуй ~6000 стартапов Y Combinator, отмечай интересные и генерируй
        новые идеи с помощью ИИ.
      </p>

      {!loading && (
        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <>
              <Link
                href="/startups"
                className="rounded bg-orange-600 px-5 py-2.5 font-medium hover:bg-orange-500"
              >
                Смотреть стартапы
              </Link>
              <Link
                href="/generate"
                className="rounded border border-neutral-700 px-5 py-2.5 hover:bg-neutral-800"
              >
                Генерировать идеи
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded bg-orange-600 px-5 py-2.5 font-medium hover:bg-orange-500"
              >
                Начать
              </Link>
              <Link
                href="/login"
                className="rounded border border-neutral-700 px-5 py-2.5 hover:bg-neutral-800"
              >
                Войти
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
