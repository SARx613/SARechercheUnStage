"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";

interface JobRow {
  id: number;
  title: string;
  location: string | null;
  url: string;
  postedAt: string | null;
  firstSeenAt: string;
  employmentType: string | null;
  matchedKeywords: string[] | null;
  isMatch: boolean;
  isTargetCity: boolean;
  periodStatus: "compatible" | "incompatible" | "unknown";
  companyName: string;
  companyCategory: string;
  status: string | null;
  notes: string | null;
}

const STATUS_OPTIONS = [
  { value: "a_voir", label: "À voir" },
  { value: "postule", label: "Postulé" },
  { value: "relance", label: "Relancé" },
  { value: "entretien", label: "Entretien" },
  { value: "refuse", label: "Refusé" },
  { value: "accepte", label: "Accepté" },
];

const STATUS_COLORS: Record<string, string> = {
  a_voir: "bg-neutral-100 text-neutral-700",
  postule: "bg-blue-50 text-blue-700",
  relance: "bg-amber-50 text-amber-700",
  entretien: "bg-violet-50 text-violet-700",
  refuse: "bg-red-50 text-red-700",
  accepte: "bg-emerald-50 text-emerald-700",
};

const columnHelper = createColumnHelper<JobRow>();

export default function JobsTable() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "firstSeenAt", desc: true },
  ]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("target");
  const [matchOnly, setMatchOnly] = useState(true);
  const [hidePastPeriod, setHidePastPeriod] = useState(true);
  const [search, setSearch] = useState("");

  const CITY_FILTERS: { value: string; label: string; terms: string[] }[] = [
    { value: "paris", label: "Paris", terms: ["paris"] },
    { value: "london", label: "Londres", terms: ["london", "londres"] },
    { value: "nyc", label: "New York", terms: ["new york", "nyc"] },
    { value: "telaviv", label: "Tel Aviv", terms: ["tel aviv", "tel-aviv"] },
  ];

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(data))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(jobId: number, status: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status } : j))
    );
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (matchOnly && !j.isMatch) return false;
      if (hidePastPeriod && j.periodStatus === "incompatible") return false;
      if (categoryFilter !== "all" && j.companyCategory !== categoryFilter)
        return false;
      if (cityFilter === "target" && !j.isTargetCity) return false;
      if (cityFilter !== "all" && cityFilter !== "target") {
        const cityDef = CITY_FILTERS.find((c) => c.value === cityFilter);
        const haystack = `${j.title} ${j.location ?? ""}`.toLowerCase();
        if (!cityDef?.terms.some((t) => haystack.includes(t))) return false;
      }
      if (search) {
        const haystack = `${j.title} ${j.companyName} ${j.location ?? ""}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [jobs, matchOnly, hidePastPeriod, categoryFilter, cityFilter, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("companyName", {
        header: "Entreprise",
        cell: (info) => (
          <span className="font-medium text-[#131a28]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Poste",
        cell: (info) => (
          <a
            href={info.row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#367afd] hover:underline"
          >
            {info.getValue()}
          </a>
        ),
      }),
      columnHelper.accessor("location", {
        header: "Ville",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("employmentType", {
        header: "Type",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("periodStatus", {
        header: "Période",
        cell: (info) => {
          const status = info.getValue();
          if (status === "compatible") {
            return (
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                Jan–Juin 2027
              </span>
            );
          }
          return (
            <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500">
              Date à confirmer
            </span>
          );
        },
      }),
      columnHelper.accessor("firstSeenAt", {
        header: "Vu le",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
          }),
      }),
      columnHelper.accessor("status", {
        header: "Statut",
        cell: (info) => {
          const status = info.getValue() ?? "a_voir";
          return (
            <select
              value={status}
              onChange={(e) => updateStatus(info.row.original.id, e.target.value)}
              className={`rounded-md px-2 py-1 text-xs font-medium outline-none ${STATUS_COLORS[status]}`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredJobs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const categories = useMemo(() => {
    const set = new Set(jobs.map((j) => j.companyCategory));
    return Array.from(set);
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher (poste, entreprise, ville)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-64 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-[#131a28] outline-none transition focus:border-[#367afd] focus:ring-2 focus:ring-[#367afd]/20"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-[#131a28] outline-none"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-[#131a28] outline-none"
        >
          <option value="target">Paris / Londres / NY / Tel Aviv</option>
          {CITY_FILTERS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
          <option value="all">Toutes les villes</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={matchOnly}
            onChange={(e) => setMatchOnly(e.target.checked)}
            className="accent-[#367afd]"
          />
          Stages uniquement
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={hidePastPeriod}
            onChange={(e) => setHidePastPeriod(e.target.checked)}
            className="accent-[#367afd]"
          />
          Masquer les périodes incompatibles
        </label>
        <span className="ml-auto text-sm text-neutral-400">
          {filteredJobs.length} offre{filteredJobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none border-b border-neutral-200 px-4 py-3 text-left font-medium text-neutral-500"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{ asc: " ↑", desc: " ↓" }[
                      header.column.getIsSorted() as string
                    ] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-neutral-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  Aucune offre pour l&apos;instant — le premier scrape n&apos;a peut-être pas encore tourné.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
