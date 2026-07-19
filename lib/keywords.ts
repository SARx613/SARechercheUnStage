const INTERNSHIP_TITLE_TERMS = [
  "stage",
  "intern",
  "internship",
  "stagiaire",
  "off-cycle",
  "off cycle",
  "co-op",
  "summer analyst", // certaines banques (ex: Barclays) appellent leur stage ete ainsi sans dire "intern"
];

// Cherches a la fois dans le titre et dans location: certaines entreprises
// (ex: Rothschild & Co) mettent le siege comme location meme si le poste
// reel est ailleurs (ex: location="Paris" mais titre="... - Bordeaux -").
const CITY_TERMS = [
  "paris",
  "london",
  "londres",
  "new york",
  "nyc",
  "tel aviv",
  "tel-aviv",
];

// Fonctions clairement hors perimetre (RH, support administratif,
// alternance germanophone generique) qui ne devraient jamais remonter
// meme si elles matchent "intern"/"stage" par ailleurs.
const EXCLUDED_TITLE_TERMS = [
  "human resources",
  "hr intern",
  "reporting rh",
  "rh & rémunérations",
  "werkstudent",
  "praktikant",
  "praktikum",
  "clerical assistant",
  "recruiting", // "Campus Recruiter", "Experienced Hire Recruiter"...
  "recruiter",
];

// Postes qui exigent typiquement une nationalite/habilitation americaine
// (security clearance) -> inaccessibles a un candidat francais. Frequent
// chez les entreprises travaillant avec le gouvernement US (Palantir,
// certains prop shops/defense tech).
const US_CLEARANCE_TERMS = [
  "us government", // matche aussi "AUS Government" (Australie, meme logique de nationalite locale requise)
  "usg",
  "federal health and civilian",
];

// Mois compatibles avec un stage janvier-juin 2027 (le stage peut demarrer
// un peu avant/apres selon flexibilite de l'entreprise, on reste large sur
// dec->juillet plutot que strictement jan-juin).
const COMPATIBLE_MONTHS = [
  "december",
  "décembre",
  "january",
  "janvier",
  "february",
  "février",
  "march",
  "mars",
  "april",
  "avril",
  "may",
  "mai",
  "june",
  "juin",
  "july",
  "juillet",
];

const INCOMPATIBLE_MONTHS = [
  "august",
  "août",
  "september",
  "septembre",
  "october",
  "octobre",
  "november",
  "novembre",
];

// "Summer" designe quasi-systematiquement un stage d'ete (juin-aout ou
// juillet-sept selon le pays), incompatible avec une recherche jan-juin
// meme si l'annee 2027 est mentionnee.
const SUMMER_TERMS = ["summer", "été", "ete "];

export type PeriodStatus = "compatible" | "incompatible" | "unknown";

function findMatches(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term));
}

function containsAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

/**
 * Signal structure remonte par le scraper quand la plateforme source
 * en expose un (ex: Workday facette workerSubType="Intern", Greenhouse
 * metadata "Employment Type"/"Duration"). Beaucoup plus fiable que du
 * texte libre car independant de la formulation du titre.
 */
export function isStructurallyIntern(employmentType: string | null): boolean {
  if (!employmentType) return false;
  const lower = employmentType.toLowerCase();
  return (
    lower.includes("intern") ||
    lower.includes("co-op") ||
    lower.includes("coop") ||
    lower.includes("stagiaire")
  );
}

/**
 * Classe la periode du stage a partir du TITRE uniquement (le seul texte
 * fiable disponible pour toutes les entreprises). Beaucoup de titres ne
 * mentionnent aucune date (calendrier precise apres candidature) -> on
 * retourne "unknown" plutot que d'exclure a tort une offre pertinente.
 */
export function classifyPeriod(title: string): PeriodStatus {
  const lower = title.toLowerCase();
  const hasYear2027 = lower.includes("2027");
  const hasYear2026 = lower.includes("2026");
  const hasYear2025 = lower.includes("2025");
  const isSummer = containsAny(lower, SUMMER_TERMS);
  const compatibleMonth = findMatches(lower, COMPATIBLE_MONTHS).length > 0;
  const incompatibleMonth = findMatches(lower, INCOMPATIBLE_MONTHS).length > 0;

  // Annee clairement passee ou trop lointaine sans annee 2027 associee.
  if ((hasYear2025 || (hasYear2026 && !hasYear2027)) && !hasYear2027) {
    // 2026 seul reste ambigu (ex: "Janvier 2026" pourrait glisser vers
    // fev 2027 en pratique) mais on suit le titre tel quel: si le mois
    // associe est incompatible ou si c'est explicitement 2025, on exclut.
    if (hasYear2025) return "incompatible";
    if (incompatibleMonth) return "incompatible";
    if (compatibleMonth) return "incompatible"; // "Janvier 2026" != "Janvier 2027"
  }

  if (isSummer && !compatibleMonth) return "incompatible";
  if (incompatibleMonth && !compatibleMonth) return "incompatible";

  if (hasYear2027 || compatibleMonth) return "compatible";

  return "unknown";
}

export function matchJob(
  title: string,
  location: string | null,
  employmentType: string | null = null
): {
  isMatch: boolean;
  isTargetCity: boolean;
  periodStatus: PeriodStatus;
  matchedKeywords: string[];
} {
  const haystack = `${title} ${location ?? ""}`;

  if (
    containsAny(title, EXCLUDED_TITLE_TERMS) ||
    containsAny(title, US_CLEARANCE_TERMS)
  ) {
    return {
      isMatch: false,
      isTargetCity: false,
      periodStatus: "unknown",
      matchedKeywords: [],
    };
  }

  const structuralIntern = isStructurallyIntern(employmentType);
  const titleInternMatches = findMatches(title, INTERNSHIP_TITLE_TERMS);
  // La ville reelle du poste peut etre dans le titre (cas Rothschild ou
  // location = siege social) ou dans location -> on cherche dans les deux.
  const cityMatches = findMatches(haystack, CITY_TERMS);
  const periodStatus = classifyPeriod(title);

  const matchedKeywords = [
    ...(structuralIntern && employmentType ? [employmentType] : []),
    ...titleInternMatches,
    ...cityMatches,
  ];

  const isMatch = structuralIntern || titleInternMatches.length > 0;
  const isTargetCity = cityMatches.length > 0;

  return { isMatch, isTargetCity, periodStatus, matchedKeywords };
}
