export type AtsType =
  | "greenhouse"
  | "lever"
  | "workday"
  | "comeet"
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
  companyId: string;
  uid?: string;
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

  // ---- LEVER ----
  { slug: "palantir", name: "Palantir", category: "conseil_tech", ats: "lever", token: "palantir", careersUrl: "https://jobs.lever.co/palantir" },

  // ---- TEL AVIV (Greenhouse) ----
  { slug: "pagaya-us", name: "Pagaya (US)", category: "quant", ats: "greenhouse", token: "pagaya", careersUrl: "https://job-boards.greenhouse.io/pagaya" },
  { slug: "pagaya-tlv", name: "Pagaya (Tel Aviv)", category: "tel_aviv", ats: "greenhouse", token: "pagayais", careersUrl: "https://job-boards.greenhouse.io/pagayais" },

  // ---- WORKDAY ----
  { slug: "rothschild", name: "Rothschild & Co", category: "banque", ats: "workday", tenant: "rothschildandco", wd: "wd3", site: "Rothschildandco_Lateral", careersUrl: "https://rothschildandco.wd3.myworkdayjobs.com/en-US/rothschildandco_lateral" },
  { slug: "blackrock", name: "BlackRock", category: "asset_management", ats: "workday", tenant: "blackrock", wd: "wd1", site: "BlackRock_Professional", careersUrl: "https://blackrock.wd1.myworkdayjobs.com/BlackRock_Professional" },
  { slug: "pimco", name: "PIMCO", category: "asset_management", ats: "workday", tenant: "pimco", wd: "wd1", site: "pimco-careers", careersUrl: "https://pimco.wd1.myworkdayjobs.com/en-US/pimco-careers" },
  { slug: "morgan-stanley", name: "Morgan Stanley", category: "banque", ats: "workday", tenant: "ms", wd: "wd5", site: "External", careersUrl: "https://ms.wd5.myworkdayjobs.com/External" },
  { slug: "barclays", name: "Barclays", category: "banque", ats: "workday", tenant: "barclays", wd: "wd3", site: "External_Career_Site_Barclays", careersUrl: "https://barclays.wd3.myworkdayjobs.com/External_Career_Site_Barclays" },
  { slug: "deutsche-bank", name: "Deutsche Bank", category: "banque", ats: "workday", tenant: "db", wd: "wd3", site: "DBWebsite", careersUrl: "https://db.wd3.myworkdayjobs.com/DBWebsite" },
  { slug: "oliver-wyman", name: "Oliver Wyman", category: "conseil_tech", ats: "workday", tenant: "mmc", wd: "wd1", site: "careers", careersUrl: "https://mmc.wd1.myworkdayjobs.com/careers" },
  { slug: "citi", name: "Citi", category: "banque", ats: "workday", tenant: "citi", wd: "wd5", site: "2", careersUrl: "https://citi.wd5.myworkdayjobs.com/en-US/2" },
  { slug: "worldquant", name: "WorldQuant (Tel Aviv)", category: "tel_aviv", ats: "workday", tenant: "mlp", wd: "wd5", site: "mlpcareers", careersUrl: "https://mlp.wd5.myworkdayjobs.com/mlpcareers" },

  // ---- COMEET ----
  { slug: "etoro", name: "eToro", category: "tel_aviv", ats: "comeet", companyId: "etoro", uid: "41.009", careersUrl: "https://www.comeet.com/jobs/etoro/41.009" },

  // ---- MANUAL (pas d'API JSON fiable, pas de scraping full-JS automatisé) ----
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
  { slug: "final", name: "Final", category: "tel_aviv", ats: "manual", careersUrl: "https://www.final.co.il/career/" },
  { slug: "jpmorgan", name: "J.P. Morgan", category: "banque", ats: "manual", careersUrl: "https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/requisitions" },
  { slug: "goldman-sachs", name: "Goldman Sachs", category: "banque", ats: "manual", careersUrl: "https://higher.gs.com/results" },
  { slug: "bank-of-america", name: "Bank of America", category: "banque", ats: "manual", careersUrl: "https://bankcampuscareers.tal.net" },
  { slug: "ubs", name: "UBS", category: "banque", ats: "manual", careersUrl: "https://jobs.ubs.com/TGnewUI/Search/home/HomeWithPreLoad?partnerid=25008&siteid=5012" },
  { slug: "bnp-paribas", name: "BNP Paribas", category: "banque", ats: "manual", careersUrl: "https://careers.cib.bnpparibas/job-contract-type/stage/" },
  { slug: "societe-generale", name: "Société Générale", category: "banque", ats: "manual", careersUrl: "https://careers.societegenerale.com/en/internships-trainee-programs" },
  { slug: "lazard", name: "Lazard", category: "banque", ats: "manual", careersUrl: "https://lazard-careers.tal.net/candidate" },
  { slug: "amundi", name: "Amundi", category: "asset_management", ats: "manual", careersUrl: "https://jobs.amundi.com/offre-de-emploi/liste-offres.aspx" },
  { slug: "schroders", name: "Schroders", category: "asset_management", ats: "manual", careersUrl: "https://schroders.referrals.selectminds.com/careers" },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
