"use client";

import { useState } from "react";
import { Startup } from "@/lib/api";

export default function StartupCard({
  startup,
  isFavorite,
  onToggleFavorite,
}: {
  startup: Startup;
  isFavorite?: boolean;
  onToggleFavorite?: (s: Startup) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-start gap-3">
        {startup.logo_url && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={startup.logo_url}
            alt={startup.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-10 w-10 shrink-0 rounded bg-white object-contain p-0.5"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-neutral-800 text-neutral-500">
            {startup.name[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{startup.name}</h3>
            {startup.batch && (
              <span className="rounded bg-orange-600/20 px-1.5 py-0.5 text-xs text-orange-400">
                {startup.batch}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-400">{startup.tagline}</p>
        </div>
      </div>

      {startup.description && (
        <p className="mt-3 line-clamp-3 text-sm text-neutral-500">
          {startup.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {startup.tags.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-400"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {startup.website ? (
          <a
            href={startup.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-orange-500 hover:underline"
          >
            Сайт ↗
          </a>
        ) : (
          <span />
        )}
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(startup)}
            className={`rounded px-3 py-1 text-sm transition ${
              isFavorite
                ? "bg-orange-600 hover:bg-orange-500"
                : "border border-neutral-700 hover:bg-neutral-800"
            }`}
          >
            {isFavorite ? "★ В избранном" : "☆ В избранное"}
          </button>
        )}
      </div>
    </div>
  );
}
