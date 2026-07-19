import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { jobPostings, companies, applicationStatus } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      id: jobPostings.id,
      title: jobPostings.title,
      location: jobPostings.location,
      url: jobPostings.url,
      postedAt: jobPostings.postedAt,
      firstSeenAt: jobPostings.firstSeenAt,
      employmentType: jobPostings.employmentType,
      matchedKeywords: jobPostings.matchedKeywords,
      isMatch: jobPostings.isMatch,
      companyName: companies.name,
      companyCategory: companies.category,
      status: applicationStatus.status,
      notes: applicationStatus.notes,
    })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .leftJoin(applicationStatus, eq(applicationStatus.jobId, jobPostings.id))
    .orderBy(desc(jobPostings.firstSeenAt))
    .limit(1000);

  return NextResponse.json(rows);
}
