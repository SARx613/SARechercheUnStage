import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { networkingContacts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(networkingContacts)
    .orderBy(desc(networkingContacts.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.firmName || typeof body.firmName !== "string") {
    return NextResponse.json({ error: "firmName is required" }, { status: 400 });
  }

  const [row] = await db
    .insert(networkingContacts)
    .values({
      firmName: body.firmName,
      division: body.division ?? null,
      city: body.city ?? "other",
      contactName: body.contactName ?? null,
      title: body.title ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      email: body.email ?? null,
      channel: body.channel ?? "linkedin_inmail",
      status: body.status ?? "a_faire",
      notes: body.notes ?? null,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
