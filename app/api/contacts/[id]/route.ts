import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { networkingContacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const VALID_STATUSES = [
  "a_faire",
  "envoye",
  "relance",
  "repondu",
  "call_planifie",
  "call_fait",
  "stage_propose",
  "sans_suite",
  "refuse",
];

const EDITABLE_FIELDS = [
  "firmName",
  "division",
  "city",
  "contactName",
  "title",
  "linkedinUrl",
  "email",
  "channel",
  "status",
  "dateSent",
  "followUpAt",
  "notes",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contactId = Number(id);
  if (!Number.isInteger(contactId)) {
    return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
  }

  const body = await request.json();
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      updates[field] =
        (field === "dateSent" || field === "followUpAt") && body[field]
          ? new Date(body[field])
          : body[field];
    }
  }

  await db
    .update(networkingContacts)
    .set(updates)
    .where(eq(networkingContacts.id, contactId));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contactId = Number(id);
  if (!Number.isInteger(contactId)) {
    return NextResponse.json({ error: "Invalid contact id" }, { status: 400 });
  }

  await db.delete(networkingContacts).where(eq(networkingContacts.id, contactId));

  return NextResponse.json({ ok: true });
}
