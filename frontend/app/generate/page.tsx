"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, GeneratedIdea } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import Markdown from "@/components/Markdown";

type Mode = "B" | "C" | "D";
type Language = "ru" | "en";

const MODES: { id: Mode; title: string; desc: string }[] = [
  { id: "C", title: "Свободная генерация", desc: "Идеи в любой сфере" },
  { id: "D", title: "По сфере", desc: "Идеи в заданной индустрии" },
  { id: "B", title: "По избранному", desc: "На основе отмеченных стартапов" },
];

function GenerateView() {
  const params = useSearchParams();
  const initialMode = (params.get("mode") as Mode) || "C";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [language, setLanguage] = useState<Language>("ru");
  const [creativity, setCreativity] = useState(50);
  const [absurdity, setAbsurdity] = useState(20);
  const [count, setCount] = useState(3);
  const [industry, setIndustry] = useState("");

  const [result, setResult] = useState<GeneratedIdea | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .getProfile()
      .then((p) => {
        setCreativity(p.default_creativity);
        setAbsurdity(p.default_absurdity);
        if (p.preferred_industries[0]) setIndustry(p.preferred_industries[0]);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const idea = await api.generateIdea({
        mode,
        language,
        creativity,
        absurdity,
        count,
        industry: mode === "D" ? industry : undefined,
      });
      setResult(idea);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка генерации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Генератор идей</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-lg border p-4 text-left transition ${
              mode === m.id
                ? "border-orange-500 bg-orange-600/10"
                : "border-neutral-800 hover:border-neutral-600"
            }`}
          >
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm text-neutral-400">{m.desc}</div>
          </button>
        ))}
      </div>

      {mode === "D" && (
        <input
          placeholder="Сфера (напр. образование, агротех, финтех)"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="mb-4 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500"
        />
      )}

      {mode === "B" && (
        <p className="mb-4 rounded border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-400">
          Идеи будут сгенерированы на основе ваших избранных стартапов.
        </p>
      )}

      <div className="mb-6 space-y-5 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Язык генерации
          </label>
          <div className="flex gap-2">
            {(["ru", "en"] as Language[]).map((lng) => (
              <button
                key={lng}
                onClick={() => setLanguage(lng)}
                className={`rounded px-4 py-1.5 text-sm transition ${
                  language === lng
                    ? "bg-orange-600"
                    : "border border-neutral-700 hover:bg-neutral-800"
                }`}
              >
                {lng === "ru" ? "Русский" : "English"}
              </button>
            ))}
          </div>
        </div>
        <Slider
          label="Креативность"
          value={creativity}
          onChange={setCreativity}
        />
        <Slider
          label="Абсурдность"
          value={absurdity}
          onChange={setAbsurdity}
        />
        <div>
          <label className="mb-1 block text-sm text-neutral-400">
            Количество идей: {count}
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || (mode === "D" && !industry)}
        className="w-full rounded bg-orange-600 py-3 font-medium hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? "Генерация..." : "Сгенерировать идеи"}
      </button>

      {error && (
        <p className="mt-4 rounded border border-red-900 bg-red-950/40 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <Markdown>{result.idea_text}</Markdown>
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-neutral-400">
        {label}: {value}
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <GenerateView />
      </Suspense>
    </RequireAuth>
  );
}
