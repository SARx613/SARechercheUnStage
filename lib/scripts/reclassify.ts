import { db } from "../db/client";
import { jobPostings } from "../db/schema";
import { matchJob } from "../keywords";
import { eq } from "drizzle-orm";

/**
 * Rejoue le classement (stage / ville / periode / seniorite) sur TOUTES les
 * offres deja stockees, a partir des champs deja en base — aucun appel
 * reseau vers les ATS.
 *
 * Le cron reclasse deja les offres qu'il recroise a chaque passage, mais
 * cela ne suffit pas: une annonce retiree du board (ou hors du plafond de
 * 300 offres du repli Workday) n'est plus jamais revisitee et garderait
 * indefiniment le classement d'une version anterieure des regles. C'est
 * ainsi que des "Vice President, Internal Audit" sont restes marques comme
 * stages apres la correction du matching par mot entier.
 *
 * A relancer apres toute modification de lib/keywords.ts.
 */
export async function reclassifyAll(): Promise<{
  scanned: number;
  updated: number;
}> {
  const rows = await db
    .select({
      id: jobPostings.id,
      title: jobPostings.title,
      location: jobPostings.location,
      employmentType: jobPostings.employmentType,
      isMatch: jobPostings.isMatch,
      isTargetCity: jobPostings.isTargetCity,
      periodStatus: jobPostings.periodStatus,
      seniorityStatus: jobPostings.seniorityStatus,
    })
    .from(jobPostings);

  let updated = 0;
  for (const row of rows) {
    const next = matchJob(row.title, row.location, row.employmentType);
    if (
      row.isMatch === next.isMatch &&
      row.isTargetCity === next.isTargetCity &&
      row.periodStatus === next.periodStatus &&
      row.seniorityStatus === next.seniorityStatus
    ) {
      continue;
    }
    await db
      .update(jobPostings)
      .set({
        isMatch: next.isMatch,
        isTargetCity: next.isTargetCity,
        periodStatus: next.periodStatus,
        seniorityStatus: next.seniorityStatus,
        matchedKeywords: next.matchedKeywords,
      })
      .where(eq(jobPostings.id, row.id));
    updated++;
  }

  return { scanned: rows.length, updated };
}
