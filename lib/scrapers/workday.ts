import type { WorkdayCompany } from "../companies";
import type { RawJob } from "./types";

interface WorkdayJobPosting {
  title: string;
  externalPath: string;
  locationsText?: string;
  postedOn?: string;
  bulletFields?: string[];
}

interface WorkdayFacetValue {
  descriptor: string;
  id: string;
}

interface WorkdayFacet {
  facetParameter: string;
  values: WorkdayFacetValue[];
}

interface WorkdayResponse {
  total: number;
  jobPostings: WorkdayJobPosting[];
  facets?: WorkdayFacet[];
}

const PAGE_SIZE = 20;
const MAX_PAGES = 15; // garde-fou: 300 offres max par entreprise

/**
 * L'id de la valeur de facette "Intern" est un hash propre a chaque
 * tenant Workday (pas de convention stable) -> il faut le decouvrir a
 * chaque scrape via une requete initiale qui renvoie les facettes.
 */
function findInternFacetId(facets: WorkdayFacet[] | undefined): string | null {
  const facet = facets?.find((f) => f.facetParameter === "workerSubType");
  const value = facet?.values.find((v) =>
    v.descriptor.toLowerCase().includes("intern")
  );
  return value?.id ?? null;
}

export async function scrapeWorkday(
  company: WorkdayCompany
): Promise<RawJob[]> {
  const base = `https://${company.tenant}.${company.wd}.myworkdayjobs.com/wday/cxs/${company.tenant}/${company.site}/jobs`;
  const jobUrl = (externalPath: string) =>
    `https://${company.tenant}.${company.wd}.myworkdayjobs.com/${company.site}${externalPath}`;

  // 1) requete de decouverte: recupere les facettes pour trouver l'id
  //    "Intern" specifique a ce tenant.
  const discoveryRes = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1, offset: 0 }),
  });
  if (!discoveryRes.ok) {
    throw new Error(
      `Workday ${company.tenant}/${company.site}: HTTP ${discoveryRes.status}`
    );
  }
  const discovery = (await discoveryRes.json()) as WorkdayResponse;
  const internFacetId = findInternFacetId(discovery.facets);

  const jobs: RawJob[] = [];

  if (internFacetId) {
    // 2a) filtre serveur direct sur workerSubType=Intern: rapide, peu de
    //     pages a paginer (le volume de stages est faible vs l'ensemble
    //     des offres de la banque).
    let offset = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limit: PAGE_SIZE,
          offset,
          appliedFacets: { workerSubType: [internFacetId] },
        }),
      });
      if (!res.ok) break;
      const data = (await res.json()) as WorkdayResponse;
      for (const job of data.jobPostings) {
        jobs.push({
          externalId: job.externalPath,
          title: job.title,
          location: job.locationsText ?? null,
          url: jobUrl(job.externalPath),
          postedAt: null,
          employmentType: "Intern",
          raw: job as unknown as Record<string, unknown>,
        });
      }
      offset += PAGE_SIZE;
      if (offset >= data.total || data.jobPostings.length === 0) break;
    }
  } else {
    // 2b) repli: pas de facette workerSubType exploitable sur ce tenant
    //     (ex: Citi avec site="2") -> on recupere tout et on filtrera
    //     sur le titre en aval, comme pour les autres ATS sans signal
    //     structure.
    let offset = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: PAGE_SIZE, offset }),
      });
      if (!res.ok) break;
      const data = (await res.json()) as WorkdayResponse;
      for (const job of data.jobPostings) {
        jobs.push({
          externalId: job.externalPath,
          title: job.title,
          location: job.locationsText ?? null,
          url: jobUrl(job.externalPath),
          postedAt: null,
          employmentType: null,
          raw: job as unknown as Record<string, unknown>,
        });
      }
      offset += PAGE_SIZE;
      if (offset >= data.total || data.jobPostings.length === 0) break;
    }
  }

  return jobs;
}
