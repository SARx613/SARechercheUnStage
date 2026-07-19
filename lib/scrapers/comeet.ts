import type { ComeetCompany } from "../companies";
import type { RawJob } from "./types";

interface ComeetPosition {
  uid: string;
  name: string;
  location: { name: string };
  url_comeet_hosted_page: string;
  time_updated?: number;
}

export async function scrapeComeet(company: ComeetCompany): Promise<RawJob[]> {
  const res = await fetch(
    `https://www.comeet.com/careers-api/2.0/company/${company.companyId}/positions`,
    { headers: { "User-Agent": "job-tracker-personal-use" } }
  );
  if (!res.ok) {
    throw new Error(`Comeet ${company.companyId}: HTTP ${res.status}`);
  }
  const positions = (await res.json()) as ComeetPosition[];

  return positions.map((p) => ({
    externalId: p.uid,
    title: p.name,
    location: p.location?.name ?? null,
    url: p.url_comeet_hosted_page,
    postedAt: p.time_updated ? new Date(p.time_updated * 1000) : null,
    employmentType: null,
    raw: p as unknown as Record<string, unknown>,
  }));
}
