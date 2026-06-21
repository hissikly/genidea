"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Startup } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import StartupCard from "@/components/StartupCard";

const PAGE_SIZE = 30;

function StartupsView() {
  const [items, setItems] = useState<Startup[]>([]);
  const [total, setTotal] = useState(0);
  const [batches, setBatches] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    api.batches().then(setBatches).catch(() => {});
    api
      .listFavorites()
      .then((favs) => setFavIds(new Set(favs.map((f) => f.id))))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listStartups({
        search,
        batch,
        year: year || undefined,
        tag,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [search, batch, year, tag, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = async (s: Startup) => {
    const next = new Set(favIds);
    if (favIds.has(s.id)) {
      await api.removeFavorite(s.id);
      next.delete(s.id);
    } else {
      await api.addFavorite(s.id);
      next.add(s.id);
    }
    setFavIds(next);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Стартапы YC</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        />
        <select
          value={batch}
          onChange={(e) => {
            setPage(0);
            setBatch(e.target.value);
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="">Все батчи</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          placeholder="Год (напр. 2023)"
          value={year}
          onChange={(e) => {
            setPage(0);
            setYear(e.target.value.replace(/\D/g, ""));
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        />
        <input
          placeholder="Тег (напр. AI)"
          value={tag}
          onChange={(e) => {
            setPage(0);
            setTag(e.target.value);
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      <p className="mb-3 text-sm text-neutral-500">Найдено: {total}</p>

      {loading ? (
        <p className="py-12 text-center text-neutral-500">Загрузка...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <StartupCard
              key={s.id}
              startup={s}
              isFavorite={favIds.has(s.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-neutral-700 px-3 py-1.5 disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm text-neutral-400">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-neutral-700 px-3 py-1.5 disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

export default function StartupsPage() {
  return (
    <RequireAuth>
      <StartupsView />
    </RequireAuth>
  );
}
