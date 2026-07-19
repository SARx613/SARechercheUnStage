import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { applicationStatus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const VALID_STATUSES = [
  "a_voir",
  "postule",
  "relance",
  "entretien",
  "refuse",
  "accepte",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) {
    return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
  }

  const { status, notes } = await request.json();
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await db.query.applicationStatus.findFirst({
    where: eq(applicationStatus.jobId, jobId),
  });

  if (existing) {
    await db
      .update(applicationStatus)
      .set({
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      })
      .where(eq(applicationStatus.jobId, jobId));
  } else {
    await db.insert(applicationStatus).values({
      jobId,
      status: status ?? "a_voir",
      notes: notes ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
