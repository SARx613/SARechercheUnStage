import type { ComeetCompany } from "../companies";
import type { RawJob } from "./types";

interface ComeetPosition {
  uid: string;
  name: string;
  location: { name: string };
  url_comeet_hosted_page: string;
  /** Chaine ISO 8601 (ex: "2026-08-17T10:17:40Z"), PAS un timestamp Unix. */
  time_updated?: string;
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

/**
 * time_updated est une date ISO, pas un epoch: la multiplier par 1000
 * donnait NaN -> "Invalid time value" au moment de l'insert Drizzle, et
 * l'entreprise entiere tombait en erreur. On garde un filet anti-NaN pour
 * qu'un champ malforme coute au pire une date manquante, pas le scrape.
 */
function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
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
    postedAt: parseDate(p.time_updated),
    employmentType: extractEmploymentType(p),
    raw: p as unknown as Record<string, unknown>,
  }));
}
