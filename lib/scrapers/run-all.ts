import { COMPANIES, type Company } from "../companies";
import { db } from "../db/client";
import { companies, jobPostings, scrapeRuns } from "../db/schema";
import { matchJob } from "../keywords";
import { sendPushToAll } from "../push";
import { scrapeGreenhouse } from "./greenhouse";
import { scrapeLever } from "./lever";
import { scrapeWorkday } from "./workday";
import { scrapeComeet } from "./comeet";
import type { RawJob } from "./types";
import { eq, and } from "drizzle-orm";

const BATCH_SIZE = 8;

async function scrapeOne(company: Company): Promise<RawJob[]> {
  switch (company.ats) {
    case "greenhouse":
      return scrapeGreenhouse(company);
    case "lever":
      return scrapeLever(company);
    case "workday":
      return scrapeWorkday(company);
    case "comeet":
      return scrapeComeet(company);
    case "html_static":
    case "manual":
      return [];
  }
}

async function ensureCompanyRow(company: Company) {
  const existing = await db.query.companies.findFirst({
    where: eq(companies.slug, company.slug),
  });
  if (existing) return existing;

  const [inserted] = await db
    .insert(companies)
    .values({
      slug: company.slug,
      name: company.name,
      category: company.category,
      atsType: company.ats,
      config: company as unknown as Record<string, unknown>,
      careersUrl: company.careersUrl,
    })
    .returning();
  return inserted;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export interface RunAllSummary {
  companiesProcessed: number;
  totalJobsFound: number;
  totalNewJobs: number;
  totalNewMatches: number;
  errors: { company: string; message: string }[];
}

export async function runAllScrapers(): Promise<RunAllSummary> {
  const automated = COMPANIES.filter(
    (c) => c.ats !== "manual" && c.ats !== "html_static"
  );
  const batches = chunk(automated, BATCH_SIZE);

  const summary: RunAllSummary = {
    companiesProcessed: 0,
    totalJobsFound: 0,
    totalNewJobs: 0,
    totalNewMatches: 0,
    errors: [],
  };

  const newMatchedJobs: { title: string; company: string; url: string }[] = [];

  for (const batch of batches) {
    await Promise.allSettled(
      batch.map(async (company) => {
        const startedAt = new Date();
        const companyRow = await ensureCompanyRow(company);

        try {
          const rawJobs = await scrapeOne(company);
          let newJobs = 0;
          let newMatches = 0;

          for (const job of rawJobs) {
            const existing = await db.query.jobPostings.findFirst({
              where: and(
                eq(jobPostings.companyId, companyRow.id),
                eq(jobPostings.externalId, job.externalId)
              ),
            });
            if (existing) continue;

            const { isMatch, isTargetCity, periodStatus, matchedKeywords } =
              matchJob(job.title, job.location, job.employmentType);

            await db.insert(jobPostings).values({
              companyId: companyRow.id,
              externalId: job.externalId,
              title: job.title,
              location: job.location,
              url: job.url,
              postedAt: job.postedAt,
              employmentType: job.employmentType,
              raw: job.raw,
              matchedKeywords,
              isMatch,
              isTargetCity,
              periodStatus,
            });

            newJobs++;
            if (isMatch) {
              newMatches++;
              // On ne notifie que les stages dans les villes ciblees et
              // dont la periode n'est pas explicitement incompatible: le
              // tableau garde tout pour visibilite, mais le push ne doit
              // pas alerter pour un stage a Singapour ou en septembre 2026.
              if (isTargetCity && periodStatus !== "incompatible") {
                newMatchedJobs.push({
                  title: job.title,
                  company: company.name,
                  url: job.url,
                });
              }
            }
          }

          await db.insert(scrapeRuns).values({
            companyId: companyRow.id,
            startedAt,
            finishedAt: new Date(),
            status: "success",
            jobsFound: rawJobs.length,
            newJobs,
          });

          summary.companiesProcessed++;
          summary.totalJobsFound += rawJobs.length;
          summary.totalNewJobs += newJobs;
          summary.totalNewMatches += newMatches;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await db.insert(scrapeRuns).values({
            companyId: companyRow.id,
            startedAt,
            finishedAt: new Date(),
            status: "error",
            errorMessage: message,
          });
          summary.errors.push({ company: company.name, message });
        }
      })
    );
  }

  if (newMatchedJobs.length > 0) {
    await sendPushToAll(newMatchedJobs);
  }

  return summary;
}
