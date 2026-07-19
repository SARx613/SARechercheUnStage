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

const CITY_TERMS = [
  "paris",
  "london",
  "londres",
  "new york",
  "nyc",
  "tel aviv",
  "tel-aviv",
];

function findMatches(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term));
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
): { isMatch: boolean; matchedKeywords: string[] } {
  const haystack = `${title} ${location ?? ""}`;

  const structuralIntern = isStructurallyIntern(employmentType);
  const titleInternMatches = findMatches(title, INTERNSHIP_TITLE_TERMS);
  const periodMatches = findMatches(haystack, PERIOD_TERMS);
  const cityMatches = findMatches(location ?? "", CITY_TERMS);

  const matchedKeywords = [
    ...(structuralIntern && employmentType ? [employmentType] : []),
    ...titleInternMatches,
    ...periodMatches,
    ...cityMatches,
  ];

  // "Ressemble a un stage" = signal structurel de la plateforme OU mention
  // dans le titre. La ville n'est PAS un critere bloquant : beaucoup
  // d'entreprises (Jane Street, Point72...) ne mettent pas la ville dans
  // le titre et location peut etre absent/incomplet selon l'ATS. On la
  // remonte comme signal informatif pour prioriser dans l'UI, pas comme
  // filtre d'exclusion — sinon on rate de vraies offres silencieusement.
  const isMatch = structuralIntern || titleInternMatches.length > 0;

  return { isMatch, matchedKeywords };
}
