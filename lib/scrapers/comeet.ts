import type { ComeetCompany } from "../companies";
import type { RawJob } from "./types";

interface ComeetPosition {
  uid: string;
  name: string;
  location: { name: string };
  url_comeet_hosted_page: string;
  time_updated?: number;
  employment_type?: string | null;
  experience_level?: string | null;
}

/**
 * Comeet expose deux signaux de contrat: employment_type ("Full-time",
 * "Intern"...) et experience_level ("Student", "Entry-level"...). On les
 * concatene pour que matchJob voie l'un OU l'autre — une offre etiquetee
 * experience_level="Student" mais employment_type="Part-time" est bien un
 * job etudiant.
 */
function extractEmploymentType(p: ComeetPosition): string | null {
  const parts = [p.employment_type, p.experience_level].filter(
    (v): v is string => Boolean(v)
  );
  return parts.length > 0 ? parts.join(" / ") : null;
}

export async function scrapeComeet(company: ComeetCompany): Promise<RawJob[]> {
  // L'API veut l'uid interne (ex: "C0.009") et un token public, pas le slug
  // lisible de l'URL. Sans token elle repond 400 "Token is missing".
  const res = await fetch(
    `https://www.comeet.com/careers-api/2.0/company/${company.uid}/positions?token=${company.token}`,
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
    employmentType: extractEmploymentType(p),
    raw: p as unknown as Record<string, unknown>,
  }));
}
