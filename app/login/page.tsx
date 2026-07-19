"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setPending(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur de connexion");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="text-base font-semibold text-[#131a28]">
              Stage Tracker
            </h1>
            <p className="text-sm text-neutral-500">Accès privé</p>
          </div>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[#131a28] outline-none transition focus:border-[#367afd] focus:ring-2 focus:ring-[#367afd]/20"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-lg bg-[#131a28] px-3 py-2.5 font-medium text-white transition hover:bg-[#1e293f] disabled:opacity-50"
        >
          {pending ? "Connexion..." : "Entrer"}
        </button>
      </form>
    </div>
  );
}
