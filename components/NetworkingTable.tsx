"use client";

import { useEffect, useMemo, useState } from "react";
import {
  NETWORKING_TARGETS,
  DIVISION_LABELS,
  type NetworkingCity,
  type NetworkingDivision,
} from "@/lib/networkingTargets";
import { OUTREACH_TEMPLATES } from "@/lib/outreachTemplates";

interface Contact {
  id: number;
  firmName: string;
  division: string | null;
  city: "new_york" | "paris" | "other";
  contactName: string | null;
  title: string | null;
  linkedinUrl: string | null;
  email: string | null;
  channel: "linkedin_inmail" | "linkedin_connect" | "email" | "other";
  status: string;
  dateSent: string | null;
  followUpAt: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "a_faire", label: "À faire" },
  { value: "envoye", label: "Envoyé" },
  { value: "relance", label: "Relancé" },
  { value: "repondu", label: "Répondu" },
  { value: "call_planifie", label: "Call planifié" },
  { value: "call_fait", label: "Call fait" },
  { value: "stage_propose", label: "Stage proposé" },
  { value: "sans_suite", label: "Sans suite" },
  { value: "refuse", label: "Refusé" },
];

const STATUS_COLORS: Record<string, string> = {
  a_faire: "bg-neutral-100 text-neutral-700",
  envoye: "bg-blue-50 text-blue-700",
  relance: "bg-amber-50 text-amber-700",
  repondu: "bg-violet-50 text-violet-700",
  call_planifie: "bg-violet-100 text-violet-800",
  call_fait: "bg-indigo-50 text-indigo-700",
  stage_propose: "bg-emerald-50 text-emerald-700",
  sans_suite: "bg-neutral-100 text-neutral-500",
  refuse: "bg-red-50 text-red-700",
};

const CITY_LABELS: Record<NetworkingCity, string> = {
  new_york: "New York",
  paris: "Paris",
  other: "Autre",
};

const LINKEDIN_INMAIL_QUOTA = { new_york: 40, paris: 10, other: 0 };

const EMPTY_FORM = {
  firmName: "",
  division: "" as NetworkingDivision | "",
  city: "new_york" as NetworkingCity,
  contactName: "",
  title: "",
  linkedinUrl: "",
  email: "",
  channel: "linkedin_inmail" as Contact["channel"],
  notes: "",
};

export default function NetworkingTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => setContacts(data))
      .finally(() => setLoading(false));
  }, []);

  async function updateContact(id: number, patch: Partial<Contact>) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function deleteContact(id: number) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firmName.trim()) return;
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const row = await res.json();
    setContacts((prev) => [row, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function copyTemplate(id: string, body: string) {
    navigator.clipboard?.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const inMailUsage = useMemo(() => {
    const sent = contacts.filter(
      (c) => c.channel === "linkedin_inmail" && c.status !== "a_faire"
    );
    return {
      new_york: sent.filter((c) => c.city === "new_york").length,
      paris: sent.filter((c) => c.city === "paris").length,
      other: sent.filter((c) => c.city === "other").length,
      total: sent.length,
    };
  }, [contacts]);

  const targetFirmNames = useMemo(
    () => Array.from(new Set(NETWORKING_TARGETS.map((t) => t.firmName))),
    []
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 gap-4">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-medium text-neutral-500">Quota InMail LinkedIn (50 au total)</p>
          <p className="text-sm text-[#131a28]">
            <span className="font-semibold">{inMailUsage.new_york}</span>/{LINKEDIN_INMAIL_QUOTA.new_york} New York
            {" · "}
            <span className="font-semibold">{inMailUsage.paris}</span>/{LINKEDIN_INMAIL_QUOTA.paris} Paris
            {" · "}
            <span className="font-semibold">{inMailUsage.other}</span> autre
            {" · "}
            <span className="font-semibold">{inMailUsage.total}</span>/50 utilisés
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowTemplates((s) => !s)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-[#131a28] hover:bg-neutral-50"
          >
            {showTemplates ? "Masquer les templates" : "Voir les templates de message"}
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg bg-[#367afd] px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ee0]"
          >
            {showForm ? "Annuler" : "+ Ajouter un contact"}
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          {OUTREACH_TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-600">{t.label}</span>
                <button
                  onClick={() => copyTemplate(t.id, (t.subject ? `Objet: ${t.subject}\n\n` : "") + t.body)}
                  className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  {copiedId === t.id ? "Copié !" : "Copier"}
                </button>
              </div>
              {t.subject && (
                <p className="mb-1 text-xs font-medium text-neutral-500">Objet : {t.subject}</p>
              )}
              <pre className="whitespace-pre-wrap font-sans text-xs text-neutral-700">{t.body}</pre>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={addContact}
          className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-4"
        >
          <input
            list="firm-suggestions"
            placeholder="Entreprise *"
            value={form.firmName}
            onChange={(e) => setForm({ ...form, firmName: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#367afd]"
            required
          />
          <datalist id="firm-suggestions">
            {targetFirmNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <select
            value={form.division}
            onChange={(e) => setForm({ ...form, division: e.target.value as NetworkingDivision })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          >
            <option value="">Division...</option>
            {Object.entries(DIVISION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value as NetworkingCity })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          >
            {Object.entries(CITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value as Contact["channel"] })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          >
            <option value="linkedin_inmail">InMail LinkedIn</option>
            <option value="linkedin_connect">Connexion LinkedIn</option>
            <option value="email">Email</option>
            <option value="other">Autre</option>
          </select>
          <input
            placeholder="Nom du contact"
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Poste"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Lien LinkedIn"
            value={form.linkedinUrl}
            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="col-span-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none sm:col-span-3"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#367afd] px-3 py-2 text-sm font-medium text-white hover:bg-[#2f6ee0]"
          >
            Ajouter
          </button>
        </form>
      )}

      <div className="flex-1 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50">
            <tr>
              {["Entreprise", "Division", "Ville", "Contact", "Poste", "Canal", "Statut", ""].map((h) => (
                <th key={h} className="border-b border-neutral-200 px-4 py-3 text-left font-medium text-neutral-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-[#131a28]">{c.firmName}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {c.division ? DIVISION_LABELS[c.division as NetworkingDivision] ?? c.division : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{CITY_LABELS[c.city]}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {c.linkedinUrl ? (
                    <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#367afd] hover:underline">
                      {c.contactName || "Profil LinkedIn"}
                    </a>
                  ) : (
                    c.contactName || "—"
                  )}
                  {c.email && <div className="text-xs text-neutral-400">{c.email}</div>}
                </td>
                <td className="px-4 py-3 text-neutral-700">{c.title || "—"}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {{ linkedin_inmail: "InMail", linkedin_connect: "Connexion", email: "Email", other: "Autre" }[c.channel]}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    onChange={(e) => updateContact(c.id, { status: e.target.value })}
                    className={`rounded-md px-2 py-1 text-xs font-medium outline-none ${STATUS_COLORS[c.status]}`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="text-xs text-neutral-400 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                  Aucun contact pour l&apos;instant — ajoute les personnes trouvées sur LinkedIn ici.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
