export interface RawJob {
  externalId: string;
  title: string;
  location: string | null;
  url: string;
  postedAt: Date | null;
  /**
   * Signal structure du type de contrat quand la plateforme source en
   * expose un (Workday: facette workerSubType, Greenhouse: metadata
   * "Employment Type"/"Duration"). Null si non disponible -> repli sur
   * le titre pour le matching.
   */
  employmentType: string | null;
  raw: Record<string, unknown>;
}

export interface ScrapeResult {
  companySlug: string;
  jobs: RawJob[];
  error?: string;
}
