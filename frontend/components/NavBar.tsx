"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/startups", label: "Стартапы" },
  { href: "/generate", label: "Генератор" },
  { href: "/favorites", label: "Избранное" },
  { href: "/history", label: "История" },
  { href: "/profile", label: "Профиль" },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-bold text-orange-500">
          Genidea
        </Link>
        {user && (
          <div className="flex gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1.5 text-sm transition ${
                  pathname.startsWith(l.href)
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-neutral-400">{user.username}</span>
              <button
                onClick={handleLogout}
                className="rounded bg-neutral-800 px-3 py-1.5 hover:bg-neutral-700"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-300 hover:text-white">
                Вход
              </Link>
              <Link
                href="/register"
                className="rounded bg-orange-600 px-3 py-1.5 hover:bg-orange-500"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
