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

const PERIOD_TERMS = ["2027", "january", "janvier"];

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

export function matchJob(
  title: string,
  location: string | null,
  employmentType: string | null = null
): {
  isMatch: boolean;
  isTargetCity: boolean;
  matchedKeywords: string[];
} {
  const haystack = `${title} ${location ?? ""}`;

  if (containsAny(title, EXCLUDED_TITLE_TERMS)) {
    return { isMatch: false, isTargetCity: false, matchedKeywords: [] };
  }

  const structuralIntern = isStructurallyIntern(employmentType);
  const titleInternMatches = findMatches(title, INTERNSHIP_TITLE_TERMS);
  const periodMatches = findMatches(haystack, PERIOD_TERMS);
  // La ville reelle du poste peut etre dans le titre (cas Rothschild ou
  // location = siege social) ou dans location -> on cherche dans les deux.
  const cityMatches = findMatches(haystack, CITY_TERMS);

  const matchedKeywords = [
    ...(structuralIntern && employmentType ? [employmentType] : []),
    ...titleInternMatches,
    ...periodMatches,
    ...cityMatches,
  ];

  const isMatch = structuralIntern || titleInternMatches.length > 0;
  const isTargetCity = cityMatches.length > 0;

  return { isMatch, isTargetCity, matchedKeywords };
}
