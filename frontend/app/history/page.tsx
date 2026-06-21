"use client";

import { useEffect, useState } from "react";
import { api, GeneratedIdea } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import Markdown from "@/components/Markdown";

const MODE_LABELS: Record<string, string> = {
  B: "По избранному",
  C: "Свободная",
  D: "По сфере",
};

function HistoryView() {
  const [items, setItems] = useState<GeneratedIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .ideaHistory()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: number) => {
    await api.deleteIdea(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  if (loading)
    return <p className="py-12 text-center text-neutral-500">Загрузка...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">История идей</h1>
      {items.length === 0 ? (
        <p className="text-neutral-500">Пока нет сгенерированных идей.</p>
      ) : (
        <div className="space-y-4">
          {items.map((idea) => (
            <div
              key={idea.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <span className="rounded bg-orange-600/20 px-2 py-0.5 text-orange-400">
                    {MODE_LABELS[idea.mode] ?? idea.mode}
                  </span>
                  <span>
                    {new Date(idea.created_at).toLocaleString("ru-RU")}
                  </span>
                </div>
                <button
                  onClick={() => remove(idea.id)}
                  className="text-sm text-neutral-500 hover:text-red-400"
                >
                  Удалить
                </button>
              </div>
              <Markdown>{idea.idea_text}</Markdown>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <RequireAuth>
      <HistoryView />
    </RequireAuth>
  );
}
