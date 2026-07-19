import type { LeverCompany } from "../companies";
import type { RawJob } from "./types";

interface LeverJob {
  id: string;
  text: string;
  hostedUrl: string;
  categories?: { location?: string; commitment?: string };
  createdAt: number;
}

export async function scrapeLever(company: LeverCompany): Promise<RawJob[]> {
  const res = await fetch(
    `https://api.lever.co/v0/postings/${company.token}?mode=json`,
    { headers: { "User-Agent": "job-tracker-personal-use" } }
  );
  if (!res.ok) {
    throw new Error(`Lever ${company.token}: HTTP ${res.status}`);
  }
  const jobs = (await res.json()) as LeverJob[];

  return jobs.map((job) => ({
    externalId: job.id,
    title: job.text,
    location: job.categories?.location ?? null,
    url: job.hostedUrl,
    postedAt: job.createdAt ? new Date(job.createdAt) : null,
    employmentType: job.categories?.commitment ?? null,
    raw: job as unknown as Record<string, unknown>,
  }));
}
