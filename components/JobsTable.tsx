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
  a_voir: "bg-slate-700 text-slate-200",
  postule: "bg-sky-700 text-sky-100",
  relance: "bg-amber-700 text-amber-100",
  entretien: "bg-violet-700 text-violet-100",
  refuse: "bg-red-900 text-red-200",
  accepte: "bg-emerald-700 text-emerald-100",
};

const columnHelper = createColumnHelper<JobRow>();

export default function JobsTable() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "firstSeenAt", desc: true },
  ]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [matchOnly, setMatchOnly] = useState(true);
  const [search, setSearch] = useState("");

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
      if (categoryFilter !== "all" && j.companyCategory !== categoryFilter)
        return false;
      if (search) {
        const haystack = `${j.title} ${j.companyName} ${j.location ?? ""}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [jobs, matchOnly, categoryFilter, search]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("companyName", {
        header: "Entreprise",
        cell: (info) => (
          <span className="font-medium text-slate-100">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Poste",
        cell: (info) => (
          <a
            href={info.row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
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
      <div className="flex-1 flex items-center justify-center text-slate-400">
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
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 min-w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={matchOnly}
            onChange={(e) => setMatchOnly(e.target.checked)}
          />
          Stages uniquement
        </label>
        <span className="ml-auto text-sm text-slate-500">
          {filteredJobs.length} offre{filteredJobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none border-b border-slate-800 px-4 py-3 text-left font-medium text-slate-400"
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
                className="border-b border-slate-900 hover:bg-slate-900/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
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
