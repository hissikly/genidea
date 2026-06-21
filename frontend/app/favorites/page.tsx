"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Startup } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import StartupCard from "@/components/StartupCard";

function FavoritesView() {
  const [items, setItems] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listFavorites()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const remove = async (s: Startup) => {
    await api.removeFavorite(s.id);
    setItems((prev) => prev.filter((x) => x.id !== s.id));
  };

  if (loading)
    return <p className="py-12 text-center text-neutral-500">Загрузка...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Избранное</h1>
      {items.length === 0 ? (
        <p className="text-neutral-500">
          Пока пусто. Добавьте стартапы из{" "}
          <Link href="/startups" className="text-orange-500">
            каталога
          </Link>
          , затем сгенерируйте идеи на их основе.
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-neutral-500">{items.length} стартапов</p>
            <Link
              href="/generate?mode=B"
              className="rounded bg-orange-600 px-4 py-2 text-sm hover:bg-orange-500"
            >
              Сгенерировать идеи по избранному →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <StartupCard
                key={s.id}
                startup={s}
                isFavorite
                onToggleFavorite={remove}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesView />
    </RequireAuth>
  );
}
