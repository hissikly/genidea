"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import RequireAuth from "@/components/RequireAuth";

function ProfileView() {
  const { user } = useAuth();
  const [industries, setIndustries] = useState("");
  const [creativity, setCreativity] = useState(50);
  const [absurdity, setAbsurdity] = useState(20);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProfile()
      .then((p) => {
        setIndustries(p.preferred_industries.join(", "));
        setCreativity(p.default_creativity);
        setAbsurdity(p.default_absurdity);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setStatus("");
    await api.updateProfile({
      preferred_industries: industries
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      default_creativity: creativity,
      default_absurdity: absurdity,
    });
    setStatus("Сохранено");
    setTimeout(() => setStatus(""), 2000);
  };

  if (loading)
    return <p className="py-12 text-center text-neutral-500">Загрузка...</p>;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold">Профиль</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Пользователь: {user?.username}
      </p>

      <div className="space-y-5 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Любимые сферы (через запятую)
          </label>
          <input
            value={industries}
            onChange={(e) => setIndustries(e.target.value)}
            placeholder="финтех, ai, образование"
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Креативность по умолчанию: {creativity}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={creativity}
            onChange={(e) => setCreativity(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Абсурдность по умолчанию: {absurdity}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={absurdity}
            onChange={(e) => setAbsurdity(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="rounded bg-orange-600 px-5 py-2 font-medium hover:bg-orange-500"
          >
            Сохранить
          </button>
          {status && <span className="text-sm text-green-400">{status}</span>}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}
