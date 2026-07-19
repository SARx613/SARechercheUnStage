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
  const candidates = ["Employment Type", "Duration", "Workflow"];
  for (const name of candidates) {
    const field = metadata.find((m) => m.name === name && m.value);
    if (field?.value) return field.value;
  }
  return null;
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
