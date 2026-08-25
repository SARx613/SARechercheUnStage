const INTERNSHIP_TITLE_TERMS = [
  "stage",
  "intern",
  "internship",
  "stagiaire",
  "off-cycle",
  "off cycle",
  "co-op",
  // Terme standard chez plusieurs grandes banques/market makers (Virtu,
  // JPMorgan, Goldman, BofA, Citi) pour un programme de stage d'hiver
  // souvent oriente diversite. C'est un mot-valise ("Winter" + "internship")
  // -> le "intern" qu'il contient n'est jamais isole par des frontieres de
  // mot, il faut donc le lister explicitement.
  "winternship",
  "springternship",
  "summer analyst", // certaines banques (ex: Barclays) appellent leur stage ete ainsi sans dire "intern"
  // Hebreu: les offres israeliennes (Comeet chez Final/Discount, TopMatch
  // chez Altshuler/Meitav/Analyst) sont redigees en hebreu et ne
  // contiennent jamais "intern"/"stage". Sans ces termes, aucun poste
  // etudiant israelien ne remonte.
  // "student" s'ecrit avec les formes masculine/feminine/plurielle, et
  // l'ecriture inclusive israelienne les colle ("סטודנט/ית") -> la racine
  // "סטודנט" les couvre toutes par inclusion de sous-chaine.
  "סטודנט",
  "מתמחה", // "stagiaire" (aussi utilise pour les stages d'expertise comptable)
  "התמחות", // "stage / internship"
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
  // "Ceinture" hedge funds de la region de New York: plusieurs poids
  // lourds (AQR, Point72, Bridgewater, Tudor) recrutent leurs stagiaires
  // hors Manhattan, a moins d'une heure de train (Greenwich/Stamford/
  // Westport, Connecticut). Sans ces villes, ces offres — pourtant du pur
  // hedge fund new-yorkais — echappaient entierement au filtre "NY".
  "greenwich, ct",
  "stamford, ct",
  "westport, ct",
  "tel aviv",
  "tel-aviv",
  // La finance israelienne ne tient pas dans les limites de Tel Aviv: les
  // sieges sont eclates sur toute l'agglomeration (Meitav a Bnei Brak, ION
  // a Herzliya, Discount a Rishon LeZion, Migdal/WorldQuant a Ramat Gan).
  // Sans ces villes, isTargetCity serait faux et le push ne partirait pas.
  "ramat gan",
  "herzliya",
  "herzliyya",
  "bnei brak",
  "bnei berak",
  "rishon",
  "petah tikva",
  "givatayim",
  "giv'atayim",
  // Jerusalem n'est pas une ville "tech", mais la Bank of Israel — et donc
  // sa division Recherche, le poste etudiant le plus quantitatif du pays —
  // y siege. Sans elle, ces offres ne declencheraient jamais de push.
  "jerusalem",
  "ירושלים",
  "israel",
  // Idem cote hebreu (les offres TopMatch ne donnent la ville qu'en hebreu).
  "תל אביב",
  "רמת גן",
  "הרצליה",
  "בני ברק",
  "ראשון לציון",
  "פתח תקווה",
  "גוש דן", // "Gush Dan" = agglomeration de Tel Aviv
  "רמת החייל", // quartier d'affaires de Tel Aviv (Altshuler Shaham)
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

/**
 * Un "Summer Internship (December-February)" est un stage d'ete de
 * l'hemisphere sud: il chevauche janvier-juin et reste donc pertinent.
 */
const SOUTHERN_SUMMER_MONTHS = [
  "december",
  "décembre",
  "january",
  "janvier",
  "february",
  "février",
];

// "Off-cycle" designe un stage de 3-6 mois demarrant hors de la saison
// estivale classique (souvent janvier, parfois fevrier/mars selon la
// division) -> bon signal de compatibilite avec jan-juin 2027, mais la
// date de demarrage exacte varie par division/localisation donc ce n'est
// PAS une certitude: on l'utilise pour faire pencher un "unknown" vers
// "compatible" plutot que pour ecraser une annee/mois deja detectee.
const OFF_CYCLE_TERMS = ["off-cycle", "off cycle"];

/**
 * Intitules qui designent un poste d'encadrement ou confirme. Un stage
 * n'est jamais l'un de ceux-la: des qu'un de ces termes apparait, l'offre
 * est ecartee meme si le titre contient par ailleurs "intern"/"stage"
 * (cas reel: "Internal Audit - Business Audit Associate/Vice President").
 *
 * Volontairement conservateur, on ne met QUE des termes non ambigus:
 *  - pas de "lead" seul ("Lead Generation" est un poste marketing junior),
 *    seulement "team lead" / "tech lead";
 *  - pas de "md" (deux lettres, trop de collisions), seulement
 *    "managing director";
 *  - pas d'"analyst", qui designe le poste d'entree en banque d'affaires.
 */
const SENIOR_TITLE_TERMS = [
  "vp",
  "svp",
  "evp",
  "avp",
  "vice president",
  "vice-president",
  "president",
  "director",
  "directeur",
  "managing director",
  "head of",
  "chief",
  "principal",
  // PAS de "partner" seul: en private equity/immobilier, "Partners" designe
  // presque toujours le nom d'une equipe ou d'un fonds ("Strategic
  // Partners", "Infrastructure Partners"), jamais un niveau de poste dans
  // un titre de stage. L'a inclure excluait a tort des stages Blackstone
  // reels ("Strategic Partners Real Estate Secondaries Summer Analyst").
  // Un vrai poste de Partner senior ne contient de toute facon jamais
  // "intern"/"stage" dans son titre -> le retirer ne coute rien.
  "managing partner",
  "general partner",
  "team lead",
  "tech lead",
  "team leader",
  "manager",
  "responsable",
  "executive",
  "experienced hire",
  "senior",
  "sr.",
  // Hebreu: "בכיר" = senior, "מנהל" = manager/directeur.
  "בכיר",
  "מנהל",
];

/**
 * "Senior" ne designe pas toujours un niveau de poste: dans le recrutement
 * campus americain, "senior" est l'annee d'etudes (equivalent M2). Une offre
 * "Summer Analyst - Open to Seniors" est bien un stage. On neutralise donc
 * ces tournures avant de chercher les marqueurs de seniorite.
 */
const STUDENT_SENIOR_PHRASES = [
  "senior year",
  "senior students",
  "senior student",
  "seniors",
  "rising senior",
  "juniors and seniors",
];

export type SeniorityStatus = "junior" | "senior" | "unknown";

export type PeriodStatus = "compatible" | "incompatible" | "unknown";

/**
 * Les intitules et villes remontes par les ATS sont saisis a la main et
 * arrivent avec des espaces doubles ou insecables (vu chez Analyst IMS:
 * location = "תל  אביב" avec deux espaces, qui ne matchait pas "תל אביב").
 * On aplatit donc les blancs avant toute comparaison.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compare un terme au texte SANS matcher au milieu d'un mot.
 *
 * Indispensable: en inclusion simple, "intern" matche "INTERNational" et
 * "INTERNal" — ce qui faisait remonter "Internal Audit – Business Audit
 * Associate/Vice President" (BlackRock) comme une offre de stage. Le "s?"
 * final couvre les pluriels ("interns", "stages").
 *
 * On ne peut pas utiliser \b: en JS il se base sur [A-Za-z0-9_], donc les
 * lettres hebraiques comptent comme des separateurs et "\bסטודנט\b" ne
 * matcherait jamais "סטודנט/ית". Les termes sans caractere latin gardent
 * donc l'inclusion simple — ce qui est le bon comportement en hebreu, ou
 * l'ecriture inclusive colle les suffixes a la racine.
 */
function termMatches(haystack: string, term: string): boolean {
  const t = normalize(term);
  if (!/[a-z0-9]/.test(t)) return haystack.includes(t);
  return new RegExp(`(?<![a-z0-9])${escapeRegExp(t)}s?(?![a-z0-9])`).test(
    haystack
  );
}

function findMatches(text: string, terms: string[]): string[] {
  const haystack = normalize(text);
  return terms.filter((term) => termMatches(haystack, term));
}

function containsAny(text: string, terms: string[]): boolean {
  const haystack = normalize(text);
  return terms.some((term) => termMatches(haystack, term));
}

/**
 * Signal structure remonte par le scraper quand la plateforme source
 * en expose un (ex: Workday facette workerSubType="Intern", Greenhouse
 * metadata "Employment Type"/"Duration"). Beaucoup plus fiable que du
 * texte libre car independant de la formulation du titre.
 */
export function isStructurallyIntern(employmentType: string | null): boolean {
  if (!employmentType) return false;
  // Meme piege qu'ailleurs: un employmentType "Internal" ou "International
  // Assignment" ne doit pas passer pour un stage -> comparaison par mot.
  return containsAny(employmentType, [
    "intern",
    "internship",
    "co-op",
    "coop",
    "stagiaire",
    "student",
  ]);
}

/**
 * Classe la periode du stage a partir du TITRE uniquement (le seul texte
 * fiable disponible pour toutes les entreprises). Beaucoup de titres ne
 * mentionnent aucune date (calendrier precise apres candidature) -> on
 * retourne "unknown" plutot que d'exclure a tort une offre pertinente.
 */
export function classifyPeriod(
  title: string,
  employmentType: string | null = null
): PeriodStatus {
  // Beaucoup d'entreprises ne datent pas le titre mais exposent la periode
  // dans leur metadonnee de contrat: Jane Street publie ses stages sous le
  // simple intitule du metier ("Mechanical Engineer") avec un
  // Employment Type "Summer Internship" et une Duration "May-August".
  // Ignorer ce champ laissait passer ~30% de stages d'ete.
  const lower = `${title} ${employmentType ?? ""}`.toLowerCase();
  const hasYear2027 = lower.includes("2027");
  const hasYear2026 = lower.includes("2026");
  const hasYear2025 = lower.includes("2025");
  const hasOtherYear = hasYear2025 || hasYear2026;
  const isSummer = containsAny(lower, SUMMER_TERMS);
  const isOffCycle = containsAny(lower, OFF_CYCLE_TERMS);
  const compatibleMonth = findMatches(lower, COMPATIBLE_MONTHS).length > 0;
  const incompatibleMonth = findMatches(lower, INCOMPATIBLE_MONTHS).length > 0;

  // Annee clairement passee ou trop lointaine sans annee 2027 associee:
  // peu importe qu'un mois soit mentionne ou non, "2026"/"2025" seuls
  // signifient que ce cycle precis ne tombe pas sur jan-juin 2027.
  if (hasOtherYear && !hasYear2027) return "incompatible";

  // "Summer" est un marqueur explicite et prioritaire: une plage
  // "May-August" contient bien "may" (mois compatible), mais reste un stage
  // d'ete qui deborde tres au-dela de juin. Seule exception, l'ete austral
  // (decembre-fevrier), qui tombe justement sur la fenetre visee.
  if (isSummer) {
    return containsAny(lower, SOUTHERN_SUMMER_MONTHS)
      ? "compatible"
      : "incompatible";
  }
  if (incompatibleMonth && !compatibleMonth) return "incompatible";

  if (hasYear2027 || compatibleMonth) return "compatible";

  // Pas de date explicite, mais "off-cycle" est un bon indice de stage
  // 3-6 mois hors saison estivale (souvent demarrage janvier) -> on
  // penche vers compatible plutot que de le laisser en simple "unknown",
  // meme si la date precise reste a verifier au cas par cas.
  if (isOffCycle) return "compatible";

  return "unknown";
}

/**
 * Classe le niveau d'anciennete attendu a partir du titre et, quand la
 * plateforme en expose un, du niveau d'experience structure
 * (Comeet: experience_level).
 */
export function classifySeniority(
  title: string,
  employmentType: string | null = null
): SeniorityStatus {
  // On retire d'abord les tournures ou "senior" qualifie l'etudiant et non
  // le poste, sinon un "Summer Analyst - Rising Seniors" serait ecarte.
  let cleaned = normalize(title);
  for (const phrase of STUDENT_SENIOR_PHRASES) {
    cleaned = cleaned.split(phrase).join(" ");
  }

  if (containsAny(cleaned, SENIOR_TITLE_TERMS)) return "senior";
  if (employmentType && containsAny(employmentType, SENIOR_TITLE_TERMS))
    return "senior";

  if (
    isStructurallyIntern(employmentType) ||
    containsAny(title, INTERNSHIP_TITLE_TERMS) ||
    containsAny(cleaned, ["junior", "entry level", "entry-level", "graduate"])
  ) {
    return "junior";
  }

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
  seniorityStatus: SeniorityStatus;
  matchedKeywords: string[];
} {
  const haystack = `${title} ${location ?? ""}`;
  const seniorityStatus = classifySeniority(title, employmentType);

  if (
    containsAny(title, EXCLUDED_TITLE_TERMS) ||
    containsAny(title, US_CLEARANCE_TERMS) ||
    // Un poste d'encadrement n'est jamais un stage, quoi que dise le reste
    // du titre.
    seniorityStatus === "senior"
  ) {
    return {
      isMatch: false,
      isTargetCity: false,
      periodStatus: "unknown",
      seniorityStatus,
      matchedKeywords: [],
    };
  }

  const structuralIntern = isStructurallyIntern(employmentType);
  const titleInternMatches = findMatches(title, INTERNSHIP_TITLE_TERMS);
  // La ville reelle du poste peut etre dans le titre (cas Rothschild ou
  // location = siege social) ou dans location -> on cherche dans les deux.
  const cityMatches = findMatches(haystack, CITY_TERMS);
  const periodStatus = classifyPeriod(title, employmentType);

  const matchedKeywords = [
    ...(structuralIntern && employmentType ? [employmentType] : []),
    ...titleInternMatches,
    ...cityMatches,
  ];

  const isMatch = structuralIntern || titleInternMatches.length > 0;
  const isTargetCity = cityMatches.length > 0;

  return {
    isMatch,
    isTargetCity,
    periodStatus,
    seniorityStatus,
    matchedKeywords,
  };
}
