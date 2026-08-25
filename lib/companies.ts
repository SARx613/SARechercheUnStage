export type AtsType =
  | "greenhouse"
  | "lever"
  | "workday"
  | "comeet"
  | "topmatch"
  | "html_static"
  | "manual";

export type Category =
  | "quant"
  | "banque"
  | "asset_management"
  | "conseil_tech"
  | "tel_aviv";

interface BaseCompany {
  slug: string;
  name: string;
  category: Category;
  careersUrl: string;
}

export interface GreenhouseCompany extends BaseCompany {
  ats: "greenhouse";
  token: string;
}

export interface LeverCompany extends BaseCompany {
  ats: "lever";
  token: string;
}

export interface WorkdayCompany extends BaseCompany {
  ats: "workday";
  tenant: string;
  wd: string;
  site: string;
}

export interface ComeetCompany extends BaseCompany {
  ats: "comeet";
  /** Slug lisible dans l'URL publique (www.comeet.com/jobs/<slug>/<uid>). */
  companyId: string;
  /** Identifiant reel attendu par l'API (ex: "C0.009") — PAS le slug. */
  uid: string;
  /**
   * Token public embarque dans la page carriere de l'entreprise. L'API
   * Comeet le refuse en son absence (HTTP 400 "Token is missing") — c'est
   * ce qui cassait le scraper eToro. Se relit dans le HTML de
   * www.comeet.com/jobs/<slug>/<uid> (champ "token") si l'entreprise le
   * fait tourner.
   */
  token: string;
}

/**
 * TopMatch (redmatch) — ATS israelien utilise par plusieurs bourses
 * d'investissement (Altshuler Shaham, Meitav, Analyst, Migdal). API JSON
 * publique, un POST par tenant identifie par son affiliateGUID (lisible
 * dans careers.topmatch.co.il/<Tenant>/redmatch.settings.js).
 */
export interface TopmatchCompany extends BaseCompany {
  ats: "topmatch";
  affiliateGuid: string;
  /** Slug du mini-site carriere, sert a reconstruire l'URL d'une offre. */
  tenant: string;
}

export interface HtmlStaticCompany extends BaseCompany {
  ats: "html_static";
  listUrl: string;
  jobSelector: string;
  titleSelector: string;
  linkSelector: string;
  locationSelector?: string;
}

export interface ManualCompany extends BaseCompany {
  ats: "manual";
  note?: string;
}

export type Company =
  | GreenhouseCompany
  | LeverCompany
  | WorkdayCompany
  | ComeetCompany
  | TopmatchCompany
  | HtmlStaticCompany
  | ManualCompany;

export const COMPANIES: Company[] = [
  // ---- FONDS QUANT / PROP TRADING (Greenhouse) ----
  { slug: "jane-street", name: "Jane Street", category: "quant", ats: "greenhouse", token: "janestreet", careersUrl: "https://www.janestreet.com/join-jane-street/open-roles/" },
  { slug: "qrt", name: "Qube Research & Technologies", category: "quant", ats: "greenhouse", token: "quberesearchandtechnologies", careersUrl: "https://www.qube-rt.com/careers/" },
  { slug: "squarepoint", name: "Squarepoint Capital", category: "quant", ats: "greenhouse", token: "squarepointcapital", careersUrl: "https://squarepoint-capital.com/open-opportunities" },
  { slug: "point72", name: "Point72 / Cubist", category: "quant", ats: "greenhouse", token: "point72", careersUrl: "https://job-boards.greenhouse.io/point72" },
  { slug: "marshall-wace", name: "Marshall Wace", category: "quant", ats: "greenhouse", token: "marshallwace", careersUrl: "https://job-boards.greenhouse.io/marshallwace" },
  { slug: "optiver", name: "Optiver", category: "quant", ats: "greenhouse", token: "optiverprivate", careersUrl: "https://optiver.com/working-at-optiver/career-opportunities/" },
  { slug: "jump-trading", name: "Jump Trading", category: "quant", ats: "greenhouse", token: "jumptrading", careersUrl: "https://www.jumptrading.com/careers/" },
  { slug: "hrt", name: "Hudson River Trading", category: "quant", ats: "greenhouse", token: "wehrtyou", careersUrl: "https://www.hudsonrivertrading.com/careers/" },
  { slug: "tower-research", name: "Tower Research Capital", category: "quant", ats: "greenhouse", token: "towerresearchcapital", careersUrl: "https://www.tower-research.com/careers" },
  { slug: "drw", name: "DRW", category: "quant", ats: "greenhouse", token: "drweng", careersUrl: "https://drw.com/careers/" },
  { slug: "five-rings", name: "Five Rings", category: "quant", ats: "greenhouse", token: "fiveringsllc", careersUrl: "https://www.fiveringscapital.com/careers" },
  { slug: "flow-traders", name: "Flow Traders", category: "quant", ats: "greenhouse", token: "flowtraders", careersUrl: "https://www.flowtraders.com/careers" },
  { slug: "man-group", name: "Man Group", category: "quant", ats: "greenhouse", token: "mangroup", careersUrl: "https://www.man.com/careers" },
  // AQR: pionnier du "systematic value investing", programme stage d'ete a
  // Greenwich CT tres oriente maths/stats/CS -> profil quant pur.
  { slug: "aqr", name: "AQR Capital Management", category: "quant", ats: "greenhouse", token: "aqr", careersUrl: "https://boards.greenhouse.io/aqr" },
  // XTX Markets: premier market maker electronique europeen (>250 Md$/jour).
  { slug: "xtx-markets", name: "XTX Markets", category: "quant", ats: "greenhouse", token: "xtxmarketstechnologies", careersUrl: "https://www.xtxmarkets.com/careers/" },
  // Virtu Financial: market maker electronique multi-actifs coté au NYSE,
  // programme stage tres large (17 offres 2027 au moment de l'ajout,
  // dont plusieurs a New York, la ville cible).
  { slug: "virtu", name: "Virtu Financial", category: "quant", ats: "greenhouse", token: "virtu", careersUrl: "https://job-boards.greenhouse.io/virtu" },

  // ---- LEVER ----
  { slug: "palantir", name: "Palantir", category: "conseil_tech", ats: "lever", token: "palantir", careersUrl: "https://jobs.lever.co/palantir" },

  // ---- TEL AVIV (Greenhouse) ----
  { slug: "pagaya-us", name: "Pagaya (US)", category: "quant", ats: "greenhouse", token: "pagaya", careersUrl: "https://job-boards.greenhouse.io/pagaya" },
  { slug: "pagaya-tlv", name: "Pagaya (Tel Aviv)", category: "tel_aviv", ats: "greenhouse", token: "pagayais", careersUrl: "https://job-boards.greenhouse.io/pagayais" },

  // ---- WORKDAY ----
  { slug: "rothschild", name: "Rothschild & Co", category: "banque", ats: "workday", tenant: "rothschildandco", wd: "wd3", site: "Rothschildandco_Lateral", careersUrl: "https://rothschildandco.wd3.myworkdayjobs.com/en-US/rothschildandco_lateral" },
  // Ardian: premier fonds de private equity europeen (~200 Md$ geres,
  // Paris + Londres). Facette workerSubType="Intern (Fixed Term) (Trainee)"
  // exploitable -> 40 stages actifs au moment de l'ajout, largement le plus
  // gros volume de tous les tenants Workday suivis ici.
  { slug: "ardian", name: "Ardian", category: "asset_management", ats: "workday", tenant: "ardian", wd: "wd103", site: "ArdianCareers", careersUrl: "https://ardian.wd103.myworkdayjobs.com/en-US/ArdianCareers" },
  { slug: "blackrock", name: "BlackRock", category: "asset_management", ats: "workday", tenant: "blackrock", wd: "wd1", site: "BlackRock_Professional", careersUrl: "https://blackrock.wd1.myworkdayjobs.com/BlackRock_Professional" },
  // Blackstone (a ne pas confondre avec BlackRock, ci-dessus): premier
  // gestionnaire d'actifs alternatifs au monde (PE/immobilier/credit).
  // Pas de facette workerSubType "Intern" exploitable sur ce tenant -> repli
  // sur titre, comme Citi (categorie "Full-Time: Experienced" absente ici).
  // Titres "Summer Analyst" / "Off Cycle Intern" deja couverts par les
  // termes existants.
  { slug: "blackstone", name: "Blackstone", category: "asset_management", ats: "workday", tenant: "blackstone", wd: "wd1", site: "Blackstone_Campus_Careers", careersUrl: "https://blackstone.wd1.myworkdayjobs.com/en-US/Blackstone_Campus_Careers" },
  // Apollo Global Management: geant du private equity/credit alternatif.
  // Tenant "athene" (nom de leur filiale assurance) et non "apollo" —
  // piege classique Workday ou le tenant technique differe de la marque.
  // workerSubType="Intern" directement exploitable, contrairement a
  // Blackstone ci-dessus.
  { slug: "apollo", name: "Apollo Global Management", category: "asset_management", ats: "workday", tenant: "athene", wd: "wd5", site: "Apollo_Careers", careersUrl: "https://athene.wd5.myworkdayjobs.com/en-US/Apollo_Careers" },
  // Moelis & Company: banque d'affaires boutique M&A (New York + Londres).
  // Pas de facette workerSubType sur ce tenant (uniquement "Experienced
  // Hires" visible) -> repli sur titre, comme Citi/Blackstone. Aucun stage
  // au moment de l'ajout (recrutement campus pas encore ouvert), mais le
  // scraper est deja cable et cout marginal nul.
  { slug: "moelis", name: "Moelis & Company", category: "banque", ats: "workday", tenant: "moelis", wd: "wd1", site: "Experienced-Hires", careersUrl: "https://moelis.wd1.myworkdayjobs.com/en-US/Experienced-Hires" },
  { slug: "pimco", name: "PIMCO", category: "asset_management", ats: "workday", tenant: "pimco", wd: "wd1", site: "pimco-careers", careersUrl: "https://pimco.wd1.myworkdayjobs.com/en-US/pimco-careers" },
  { slug: "morgan-stanley", name: "Morgan Stanley", category: "banque", ats: "workday", tenant: "ms", wd: "wd5", site: "External", careersUrl: "https://ms.wd5.myworkdayjobs.com/External" },
  { slug: "barclays", name: "Barclays", category: "banque", ats: "workday", tenant: "barclays", wd: "wd3", site: "External_Career_Site_Barclays", careersUrl: "https://barclays.wd3.myworkdayjobs.com/External_Career_Site_Barclays" },
  { slug: "deutsche-bank", name: "Deutsche Bank", category: "banque", ats: "workday", tenant: "db", wd: "wd3", site: "DBWebsite", careersUrl: "https://db.wd3.myworkdayjobs.com/DBWebsite" },
  { slug: "oliver-wyman", name: "Oliver Wyman", category: "conseil_tech", ats: "workday", tenant: "mmc", wd: "wd1", site: "careers", careersUrl: "https://mmc.wd1.myworkdayjobs.com/careers" },
  { slug: "citi", name: "Citi", category: "banque", ats: "workday", tenant: "citi", wd: "wd5", site: "2", careersUrl: "https://citi.wd5.myworkdayjobs.com/en-US/2" },
  { slug: "worldquant", name: "WorldQuant (Tel Aviv)", category: "tel_aviv", ats: "workday", tenant: "mlp", wd: "wd5", site: "mlpcareers", careersUrl: "https://mlp.wd5.myworkdayjobs.com/mlpcareers" },

  // ---- COMEET ----
  { slug: "etoro", name: "eToro", category: "tel_aviv", ats: "comeet", companyId: "etoro", uid: "41.009", token: "14952452466D3DB7B61495240B91", careersUrl: "https://www.comeet.com/jobs/etoro/41.009" },

  // ---- MANUAL (pas d'API JSON fiable, pas de scraping full-JS automatisé) ----
  // KKR: tenant Workday introuvable derriere le site public (probe direct
  // sans succes, contrairement a Apollo/Blackstone).
  { slug: "kkr", name: "KKR", category: "asset_management", ats: "manual", careersUrl: "https://www.kkr.com/careers/student-careers" },
  // Boutiques M&A (advisory pur, pas de trading): Evercore et Centerview
  // tournent sur des portails proprietaires/JS-lourds (evercore.tal.net,
  // meme famille de plateforme que Lazard ci-dessous); PJT bloque le
  // scraping (403).
  { slug: "evercore", name: "Evercore", category: "banque", ats: "manual", careersUrl: "https://www.evercore.com/careers/students-graduates/students-graduates-europe-asia/" },
  { slug: "centerview", name: "Centerview Partners", category: "banque", ats: "manual", careersUrl: "https://www.centerview.com/careers/" },
  { slug: "pjt-partners", name: "PJT Partners", category: "banque", ats: "manual", careersUrl: "https://www.pjtpartners.com/careers" },
  { slug: "natixis", name: "Natixis CIB", category: "banque", ats: "manual", careersUrl: "https://recrutement.natixis.com/en/our-job-offers" },
  // Systematica: fonds quant systematique (heritage BlueCrest), Londres.
  // API Pinpoint publique et structuree, mais seulement 2 postes ouverts
  // (aucun stage) au moment de l'ajout -> pas assez de volume pour
  // justifier un scraper dedie tout de suite; a webhooker si le volume
  // augmente.
  { slug: "systematica", name: "Systematica Investments", category: "quant", ats: "manual", careersUrl: "https://systematica.pinpointhq.com/" },
  { slug: "mckinsey", name: "McKinsey", category: "conseil_tech", ats: "manual", careersUrl: "https://www.mckinsey.com/careers/search-jobs" },
  { slug: "bcg", name: "BCG", category: "conseil_tech", ats: "manual", careersUrl: "https://careers.bcg.com/global/en/search-results" },
  { slug: "bain", name: "Bain & Company", category: "conseil_tech", ats: "manual", careersUrl: "https://www.bain.com/careers/find-a-role/" },
  { slug: "citadel", name: "Citadel", category: "quant", ats: "manual", careersUrl: "https://www.citadel.com/careers/open-opportunities/" },
  { slug: "citadel-securities", name: "Citadel Securities", category: "quant", ats: "manual", careersUrl: "https://www.citadelsecurities.com/careers/open-opportunities/" },
  { slug: "millennium", name: "Millennium Management", category: "quant", ats: "manual", careersUrl: "https://career.mlp.com/careers" },
  { slug: "balyasny", name: "Balyasny (BAM)", category: "quant", ats: "manual", careersUrl: "https://www.bamfunds.com/careers" },
  { slug: "g-research", name: "G-Research", category: "quant", ats: "manual", careersUrl: "https://www.gresearch.com/vacancies/" },
  { slug: "two-sigma", name: "Two Sigma", category: "quant", ats: "manual", careersUrl: "https://careers.twosigma.com/careers/OpenRoles" },
  { slug: "de-shaw", name: "D.E. Shaw", category: "quant", ats: "manual", careersUrl: "https://www.deshaw.com/careers" },
  { slug: "sig", name: "SIG (Susquehanna)", category: "quant", ats: "manual", careersUrl: "https://careers.sig.com/jobs" },
  { slug: "cfm", name: "Capital Fund Management (CFM)", category: "quant", ats: "manual", careersUrl: "https://jobs.cfm.com" },
  { slug: "jpmorgan", name: "J.P. Morgan", category: "banque", ats: "manual", careersUrl: "https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/requisitions" },
  { slug: "goldman-sachs", name: "Goldman Sachs", category: "banque", ats: "manual", careersUrl: "https://higher.gs.com/results" },
  { slug: "bank-of-america", name: "Bank of America", category: "banque", ats: "manual", careersUrl: "https://bankcampuscareers.tal.net" },
  { slug: "ubs", name: "UBS", category: "banque", ats: "manual", careersUrl: "https://jobs.ubs.com/TGnewUI/Search/home/HomeWithPreLoad?partnerid=25008&siteid=5012" },
  { slug: "bnp-paribas", name: "BNP Paribas", category: "banque", ats: "manual", careersUrl: "https://careers.cib.bnpparibas/job-contract-type/stage/" },
  { slug: "societe-generale", name: "Société Générale", category: "banque", ats: "manual", careersUrl: "https://careers.societegenerale.com/en/internships-trainee-programs" },
  { slug: "lazard", name: "Lazard", category: "banque", ats: "manual", careersUrl: "https://lazard-careers.tal.net/candidate" },
  { slug: "amundi", name: "Amundi", category: "asset_management", ats: "manual", careersUrl: "https://jobs.amundi.com/offre-de-emploi/liste-offres.aspx" },
  { slug: "schroders", name: "Schroders", category: "asset_management", ats: "manual", careersUrl: "https://schroders.referrals.selectminds.com/careers" },

  // =====================================================================
  // ISRAEL — finance, quant et hedge funds
  // ---------------------------------------------------------------------
  // Toutes ces entreprises ont ete verifiees site par site. Les URLs
  // pointent vers la section "offres" la plus precise disponible, et quand
  // le site accepte un filtre par URL (cas de SuccessFactors chez Bank of
  // Israel), directement sur les postes etudiants.
  // Beaucoup de sites institutionnels israeliens (banques, assureurs) sont
  // des SPA maison sans API JSON -> ats "manual", comme pour McKinsey & co.
  // =====================================================================

  // ---- QUANT / PROP TRADING / HFT ISRAELIENS ----
  // Final: le prop shop historique israelien (Herzliya, ~150 personnes,
  // offre de rachat a 4 Md$ refusee en 2014). Etait en "manual" ici, mais
  // sa page carriere tourne en fait sur Comeet.
  { slug: "final", name: "Final", category: "quant", ats: "comeet", companyId: "final", uid: "C0.009", token: "C9324192025B6483EDC971125B", careersUrl: "https://www.comeet.com/jobs/final/C0.009" },
  // Barak: market maker officiel sur plusieurs bourses, systeme de trading
  // latency-sensitive maison. Poste "Junior Trader" a Tel Aviv ouvert aux
  // profils STEM/eco juste diplomes -> la porte d'entree junior.
  { slug: "barak-capital", name: "Barak Capital Market Making", category: "quant", ats: "manual", careersUrl: "https://barakmarketmaking.com/careers/", note: "Candidatures via formulaires externes (nmbrshire / forms.app) ou cv@barakcapital.com. Viser le poste 'Junior Trader' (Tel Aviv)." },
  // Efficient Frontier: HFT crypto (>1 Md$ de volume/semaine), fondee par
  // des anciens du HFT traditionnel. Pas de page /careers propre: le lien
  // "Careers" du site renvoie vers leurs offres LinkedIn.
  { slug: "efficient-frontier", name: "Efficient Frontier", category: "quant", ats: "manual", careersUrl: "https://www.linkedin.com/company/efficientfrontier/jobs/", note: "Le site efrontier.io renvoie ses offres vers LinkedIn. Contact direct: info@efrontier.io." },
  // Solidus: algo trading (Tel Aviv / Amsterdam / Gibraltar), poste
  // "Quant Algorithms Developer" recurrent a Tel Aviv.
  { slug: "solidus", name: "Solidus", category: "quant", ats: "manual", careersUrl: "https://www.solidus-tech.com/careers/", note: "Pas de poste etudiant affiche; ils invitent a envoyer un CV spontane." },

  // ---- HEDGE FUNDS ISRAELIENS ----
  // ION: ~2 Md$ d'AUM, cinq strategies (long/short, tech, macro, crossover, PE).
  { slug: "ion-asset-management", name: "ION Asset Management", category: "quant", ats: "manual", careersUrl: "https://www.ion-am.com/careers", note: "Candidature par email a jobs@ion-am.com (objet = intitule du poste). Candidatures spontanees explicitement acceptees." },
  // Sphera: gerant long/short equity israelien de reference (fonde en 2004).
  { slug: "sphera-funds", name: "Sphera Funds Management", category: "quant", ats: "manual", careersUrl: "https://spherafund.com/contact-us/", note: "Pas de page carriere publique: passer par le formulaire de contact." },
  // Silver Castle: gestion alternative (dont fonds bitcoin), cotee au TASE.

  // ---- BANQUES & INFRASTRUCTURE DE MARCHE ----
  // Bank of Israel: la banque centrale tourne sur SuccessFactors, dont la
  // recherche accepte un mot-cle en parametre d'URL -> on pointe direct sur
  // les postes etudiants. La division Recherche (analyse monetaire,
  // economie reelle) recrute des etudiants: le profil le plus quant du lot.
  { slug: "bank-of-israel", name: "Bank of Israel", category: "banque", ats: "manual", careersUrl: "https://careers.boi.org.il/search/?q=%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98", note: "URL deja filtree sur 'סטודנט' (etudiant). Viser la חטיבת המחקר (division Recherche) et l'אגף המוניטרי." },
  // Discount Bank: seule des grandes banques israeliennes a exposer une API
  // publique (Comeet) -> scrapee automatiquement.
  { slug: "discount-bank", name: "Israel Discount Bank", category: "banque", ats: "comeet", companyId: "dbank", uid: "F8.004", token: "8F435B847A035B802CC42CC4509447A035B8", careersUrl: "https://www.comeet.com/jobs/dbank/F8.004" },
  { slug: "bank-leumi", name: "Bank Leumi", category: "banque", ats: "manual", careersUrl: "https://www.leumi.co.il/he/leumi_main/searchjobs", note: "Moteur de recherche maison sans filtre par URL: taper 'סטודנט' dans le champ mot-cle. Leumi donne la priorite aux etudiants." },
  { slug: "bank-hapoalim", name: "Bank Hapoalim", category: "banque", ats: "manual", careersUrl: "https://www.bankhapoalim.co.il/forms/he/jobs-site/lobby", note: "Postes etudiants recurrents en salle des marches (dealer ni'v zarim) pour etudiants en eco/gestion. Contact: poalim.jobs@poalim.co.il." },
  { slug: "tase", name: "Tel Aviv Stock Exchange (TASE)", category: "banque", ats: "manual", careersUrl: "https://www.tase.co.il/he/content/career/careers" },

  // ---- MAISONS D'INVESTISSEMENT ----
  // Les deux plus grosses maisons d'investissement du pays. Toutes deux sur
  // TopMatch (redmatch), l'ATS israelien qui expose une API JSON publique
  // -> scrapees automatiquement.
  { slug: "altshuler-shaham", name: "Altshuler Shaham", category: "asset_management", ats: "topmatch", tenant: "AltshulerShaham", affiliateGuid: "15FA3B25-3742-44BC-A785-86EE96CBADCF", careersUrl: "https://careers.topmatch.co.il/AltshulerShaham/" },
  { slug: "meitav", name: "Meitav", category: "asset_management", ats: "topmatch", tenant: "Meitav", affiliateGuid: "05C69BAD-26F0-48EE-A059-4961B79987F1", careersUrl: "https://careers.topmatch.co.il/Meitav/" },
  // Harel recrute regulierement des etudiants au departement actuariat
  // (tarification assurance generale) -> profil quantitatif.

  // ---- PLATEFORMES DE TRADING ----
  // Plus500 (CFD, cotee au LSE) tourne sur Comeet, comme Final et eToro.
  { slug: "plus500", name: "Plus500", category: "tel_aviv", ats: "comeet", companyId: "plus500", uid: "A1.00F", token: "1AF6BCA1AF27A1A35E86B6BC50D0", careersUrl: "https://careers.plus500.com/" },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
