import type { GreenhouseCompany } from "../companies";
import type { RawJob } from "./types";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  updated_at: string;
  departments?: { name: string }[];
  metadata?: { name: string; value: string | null }[] | null;
}

function extractEmploymentType(job: GreenhouseJob): string | null {
  const metadata = job.metadata ?? [];
  // Les noms de champs varient par entreprise (vu: "Employment Type",
  // "Duration", "Workflow") — on prend le premier qui ressemble a un
  // type de contrat et qui a une valeur.
  // On concatene au lieu de prendre le premier renseigne: "Employment Type"
  // donne la nature du contrat ("Summer Internship") et "Duration" la
  // periode ("May-August" / "December-February"), et classifyPeriod a besoin
  // des deux pour distinguer un stage d'ete d'un stage de janvier.
  const candidates = ["Employment Type", "Duration", "Workflow"];
  const values = candidates
    .map((name) => metadata.find((m) => m.name === name && m.value)?.value)
    .filter((v): v is string => Boolean(v));
  if (values.length === 0) return null;
  // La colonne employment_type est en varchar(100).
  return [...new Set(values)].join(" / ").slice(0, 100);
}

export async function scrapeGreenhouse(
  company: GreenhouseCompany
): Promise<RawJob[]> {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs?content=true`,
    { headers: { "User-Agent": "job-tracker-personal-use" } }
  );
  if (!res.ok) {
    throw new Error(`Greenhouse ${company.token}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as { jobs: GreenhouseJob[] };

  return data.jobs.map((job) => ({
    externalId: String(job.id),
    title: job.title,
    location: job.location?.name ?? null,
    url: job.absolute_url,
    postedAt: job.updated_at ? new Date(job.updated_at) : null,
    employmentType: extractEmploymentType(job),
    raw: job as unknown as Record<string, unknown>,
  }));
}
