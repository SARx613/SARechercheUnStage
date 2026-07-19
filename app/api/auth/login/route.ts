import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createSession } from "@/lib/session";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (typeof password !== "string" || !process.env.SITE_PASSWORD_HASH) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const providedHash = sha256(password);
  const expectedHash = process.env.SITE_PASSWORD_HASH;

  const match =
    providedHash.length === expectedHash.length &&
    timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));

  if (!match) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
